import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { getClientDb, isFirebaseConfigured } from "./client";
import { PortfolioData, ThemeMeta } from "@/themes/types";
import { THEME_REGISTRY, INITIAL_DEFAULT_PORTFOLIO } from "../utils/defaults";

// ============================================================================
// 1. USER PROFILE TYPES & OPERATIONS
// ============================================================================
export interface UserProfileDocument {
  uid: string;
  fullName: string;
  email: string;
  profilePicture?: string | null;
  username?: string | null;
  createdAt: string;
  updatedAt: string;
  accountStatus: "active" | "suspended" | "pending";
}

export async function getUserProfile(uid: string): Promise<UserProfileDocument | null> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return null;

  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return snap.data() as UserProfileDocument;
  } catch (err) {
    console.error("Error fetching user profile from Firestore:", err);
    return null;
  }
}

export async function createOrUpdateUserProfile(
  uid: string,
  data: Partial<UserProfileDocument>
): Promise<void> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return;

  try {
    const userRef = doc(db, "users", uid);
    const now = new Date().toISOString();
    await setDoc(
      userRef,
      {
        uid,
        ...data,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Error creating/updating user profile in Firestore:", err);
    throw err;
  }
}

// ============================================================================
// 2. PORTFOLIO TYPES & OPERATIONS
// ============================================================================
export async function getUserPortfoliosFromFirestore(userId: string): Promise<PortfolioData[]> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return [];

  try {
    const q = query(collection(db, "portfolios"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const list: PortfolioData[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as PortfolioData);
    });
    // Sort by updatedAt descending
    return list.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  } catch (err) {
    console.error("Error fetching user portfolios from Firestore:", err);
    return [];
  }
}

export async function getPortfolioByIdFromFirestore(portfolioId: string): Promise<PortfolioData | null> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return null;

  try {
    const portfolioRef = doc(db, "portfolios", portfolioId);
    const snap = await getDoc(portfolioRef);
    if (!snap.exists()) return null;
    return snap.data() as PortfolioData;
  } catch (err) {
    console.error("Error fetching portfolio by id from Firestore:", err);
    return null;
  }
}

export async function getPublishedPortfolioBySlug(username: string): Promise<PortfolioData | null> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return null;

  const normalized = username.toLowerCase().trim();
  try {
    const q = query(
      collection(db, "portfolios"),
      where("username", "==", normalized),
      where("isPublished", "==", true),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as PortfolioData;
    }
    return null;
  } catch (err) {
    console.error("Error querying published portfolio by username:", err);
    return null;
  }
}

export async function checkSlugAvailability(
  username: string,
  currentPortfolioId?: string
): Promise<boolean> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return false;

  const normalized = username.toLowerCase().trim();
  if (!normalized) return false;

  try {
    const uRef = doc(db, "usernames", normalized);
    const snap = await getDoc(uRef);
    if (!snap.exists()) return true;
    const data = snap.data();
    return data?.portfolioId === currentPortfolioId;
  } catch (err) {
    console.error("Error checking slug availability:", err);
    return false;
  }
}

export async function savePortfolioToFirestore(portfolio: PortfolioData): Promise<void> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) {
    throw new Error("Firestore is not configured. Cannot save portfolio.");
  }

  const now = new Date().toISOString();
  portfolio.updatedAt = now;

  try {
    // Atomic transaction for slug reservation and portfolio persistence
    await runTransaction(db, async (transaction) => {
      const portfolioRef = doc(db, "portfolios", portfolio.portfolioId);
      const normalizedUsername = (portfolio.username || "").toLowerCase().trim();

      if (normalizedUsername) {
        const usernameRef = doc(db, "usernames", normalizedUsername);
        const usernameSnap = await transaction.get(usernameRef);

        if (usernameSnap.exists()) {
          const ownerId = usernameSnap.data()?.userId;
          const portfolioOwner = usernameSnap.data()?.portfolioId;
          if (portfolioOwner && portfolioOwner !== portfolio.portfolioId) {
            throw new Error(`The username '${normalizedUsername}' is already reserved.`);
          }
        }

        // Reserve username mapping
        transaction.set(
          usernameRef,
          {
            username: normalizedUsername,
            userId: portfolio.userId,
            portfolioId: portfolio.portfolioId,
            updatedAt: now,
          },
          { merge: true }
        );
      }

      // Save main portfolio document
      transaction.set(portfolioRef, portfolio, { merge: true });
    });
  } catch (err) {
    console.error("Error in savePortfolioToFirestore transaction:", err);
    throw err;
  }
}

export async function deletePortfolioFromFirestore(
  portfolioId: string,
  userId: string,
  username?: string
): Promise<void> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return;

  try {
    const portfolioRef = doc(db, "portfolios", portfolioId);
    const snap = await getDoc(portfolioRef);
    if (snap.exists() && snap.data()?.userId !== userId) {
      throw new Error("Unauthorized: you do not own this portfolio.");
    }

    await deleteDoc(portfolioRef);

    // Remove username reservation if associated
    if (username) {
      const uRef = doc(db, "usernames", username.toLowerCase().trim());
      await deleteDoc(uRef).catch((e) => console.warn("Failed to delete username doc:", e));
    }
  } catch (err) {
    console.error("Error deleting portfolio from Firestore:", err);
    throw err;
  }
}

// ============================================================================
// 3. THEMES COLLECTION
// ============================================================================
export interface ThemeFirestoreDocument {
  themeId: string;
  name: string;
  category: string;
  description: string;
  previewImage?: string;
  available: boolean;
  createdAt: string;
}

export async function syncDefaultThemesToFirestore(): Promise<void> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return;

  try {
    for (const theme of THEME_REGISTRY) {
      const themeRef = doc(db, "themes", theme.id);
      await setDoc(
        themeRef,
        {
          themeId: theme.id,
          name: theme.name,
          category: theme.category,
          description: theme.description,
          available: true,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn("Could not sync default themes to Firestore:", err);
  }
}

// ============================================================================
// 4. ANALYTICS COLLECTION
// ============================================================================
export interface AnalyticsDocument {
  portfolioId: string;
  visitorCount: number;
  pageViews: number;
  lastVisited: string;
  eventType: string;
}

export async function recordPortfolioPageView(
  portfolioId: string,
  eventType = "page_view"
): Promise<void> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return;

  try {
    const analyticsRef = doc(db, "analytics", portfolioId);
    const now = new Date().toISOString();
    await setDoc(
      analyticsRef,
      {
        portfolioId,
        visitorCount: increment(1),
        pageViews: increment(1),
        lastVisited: now,
        eventType,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Failed to record analytics event:", err);
  }
}

export async function getPortfolioAnalytics(
  portfolioId: string
): Promise<{ visitorCount: number; pageViews: number; lastVisited: string } | null> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return null;

  try {
    const analyticsRef = doc(db, "analytics", portfolioId);
    const snap = await getDoc(analyticsRef);
    if (!snap.exists()) return { visitorCount: 0, pageViews: 0, lastVisited: "No visits yet" };
    const d = snap.data();
    return {
      visitorCount: d.visitorCount || 0,
      pageViews: d.pageViews || 0,
      lastVisited: d.lastVisited || "Recent",
    };
  } catch (err) {
    console.error("Error reading portfolio analytics:", err);
    return null;
  }
}

// ============================================================================
// 5. CUSTOM DOMAINS COLLECTION
// ============================================================================
export interface CustomDomainDocument {
  userId: string;
  portfolioId: string;
  domain: string;
  verificationStatus: "pending" | "verified" | "failed";
  createdAt: string;
}

export async function registerCustomDomain(
  userId: string,
  portfolioId: string,
  domain: string
): Promise<void> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return;

  const normalizedDomain = domain.toLowerCase().trim();
  const domainRef = doc(db, "customDomains", normalizedDomain);
  await setDoc(
    domainRef,
    {
      userId,
      portfolioId,
      domain: normalizedDomain,
      verificationStatus: "pending",
      createdAt: new Date().toISOString(),
    },
    { merge: true }
  );
}
