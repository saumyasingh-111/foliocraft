import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  runTransaction,
} from "firebase/firestore";
import { getClientDb, getClientAuth, isFirebaseConfigured } from "./client";
import { PortfolioData, ThemeId, ThemeSettings, SectionConfig } from "@/themes/types";
import { THEME_REGISTRY, createEmptyPortfolio, SAMPLE_DEMO_PORTFOLIO } from "../utils/defaults";

// Utility timeout wrapper to prevent any Firestore call from hanging indefinitely
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 7000,
  errorMessage = "Database operation timed out"
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

// ============================================================================
// 1. USER PROFILE TYPES & OPERATIONS
// Collection: users (Document ID: Firebase Auth UID)
// ============================================================================
export interface UserProfileDocument {
  uid: string;
  fullName: string;
  email: string;
  emailVerified?: boolean;
  photoURL?: string | null;
  username?: string | null;
  bio?: string | null;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
  onboardingCompleted: boolean;
  accountStatus: "active" | "suspended" | "pending";
  preferences?: {
    emailNotifications?: boolean;
    defaultTheme?: ThemeId;
    themeMode?: "light" | "dark" | "system";
    [key: string]: unknown;
  };
}

export async function getUserProfile(uid: string): Promise<UserProfileDocument | null> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return null;

  try {
    const userRef = doc(db, "users", uid);
    const snap = await withTimeout(getDoc(userRef), 6000, "User profile read timed out");
    if (!snap.exists()) return null;
    return snap.data() as UserProfileDocument;
  } catch (err) {
    console.error("[Firestore] Error fetching user profile:", err);
    return null;
  }
}

export async function createOrUpdateUserProfile(
  uid: string,
  data: Partial<UserProfileDocument>
): Promise<UserProfileDocument> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) {
    throw new Error("Firestore client is not configured.");
  }

  const auth = getClientAuth();
  const currentEmail = auth?.currentUser?.email || "";
  const userRef = doc(db, "users", uid);
  const now = new Date().toISOString();

  const profileData: UserProfileDocument = {
    uid,
    fullName: data.fullName || auth?.currentUser?.displayName || "User",
    email: data.email || currentEmail,
    photoURL: data.photoURL || auth?.currentUser?.photoURL || null,
    username: data.username || null,
    bio: data.bio || null,
    location: data.location || null,
    createdAt: data.createdAt || now,
    updatedAt: now,
    onboardingCompleted: data.onboardingCompleted ?? false,
    accountStatus: data.accountStatus || "active",
    preferences: data.preferences || {
      emailNotifications: true,
      defaultTheme: "minimal-editorial",
      themeMode: "system",
    },
    ...data,
  };

  try {
    await withTimeout(
      setDoc(userRef, profileData, { merge: true }),
      7000,
      "Failed to persist user profile: request timed out"
    );
    return profileData;
  } catch (err) {
    console.error("[Firestore] Error writing user profile document:", err);
    throw err;
  }
}

// ============================================================================
// 2. PORTFOLIO TYPES & OPERATIONS
// Collection: portfolios (Document ID: unique portfolioId)
// ============================================================================
export interface CanonicalPortfolioDocument extends PortfolioData {
  ownerId: string;
  slug: string;
  published: boolean;
  selectedTheme: ThemeId;
  customThemeSettings: ThemeSettings;
  resumeURL?: string | null;
  resumeUrl?: string | null;
  seoTitle?: string;
  seoDescription?: string;
}

/**
 * Safely identifies Firestore FieldValue sentinels (e.g. deleteField(), serverTimestamp(), increment()),
 * Timestamps, GeoPoints, and DocumentReferences that must be preserved as-is.
 */
export function isFirestoreSpecialType(val: any): boolean {
  if (!val || typeof val !== "object") return false;

  // FieldValue sentinels (deleteField, serverTimestamp, increment, arrayUnion, arrayRemove)
  if (
    val.constructor?.name === "FieldValue" ||
    val.constructor?.name === "DeleteFieldValueImpl" ||
    val.constructor?.name === "ServerTimestampFieldValueImpl" ||
    val.constructor?.name === "NumericIncrementFieldValueImpl" ||
    val._methodName !== undefined ||
    val._delegate !== undefined
  ) {
    return true;
  }

  // Firestore Timestamp
  if (
    val.constructor?.name === "Timestamp" ||
    (typeof val.toMillis === "function" && typeof val.toDate === "function")
  ) {
    return true;
  }

  // Firestore GeoPoint
  if (
    val.constructor?.name === "GeoPoint" ||
    (typeof val.latitude === "number" && typeof val.longitude === "number")
  ) {
    return true;
  }

  // Firestore DocumentReference
  if (
    val.constructor?.name === "DocumentReference" ||
    (val.firestore && typeof val.path === "string" && typeof val.id === "string")
  ) {
    return true;
  }

  return false;
}

/**
 * Recursively serializes and sanitizes data for Cloud Firestore writes.
 * 
 * Guarantees:
 * 1. Omit any object properties whose value is undefined (never write undefined to Firestore).
 * 2. In arrays, normalize undefined elements to null to preserve indices without Firestore error.
 * 3. Never strip meaningful null values (e.g. null resumeUrl, null profileImage, null publishedAt).
 * 4. Never alter or corrupt arrays or primitive values (booleans, finite numbers, strings).
 * 5. Never alter Firestore FieldValue sentinels (deleteField(), serverTimestamp(), increment()).
 * 6. Never alter Timestamps, GeoPoints, DocumentReferences, or native Date instances.
 * 7. Reject invalid data (NaN, Infinity, functions, symbols, BigInt) with a clear error before transactions.
 */
export function sanitizeForFirestore<T>(data: T, path = ""): T {
  // Primitives and falsy values
  if (data === null) return null as T;
  if (data === undefined) return undefined as T;

  const type = typeof data;

  if (type === "string" || type === "boolean") {
    return data;
  }

  if (type === "number") {
    const num = data as unknown as number;
    if (Number.isNaN(num) || !Number.isFinite(num)) {
      throw new Error(
        `Invalid numeric value (${num}) found at path '${path || "root"}'. Cloud Firestore does not support NaN or Infinity.`
      );
    }
    return data;
  }

  if (type === "function" || type === "symbol" || type === "bigint") {
    throw new Error(
      `Unsupported non-serializable type (${type}) found at path '${path || "root"}'. Functions, symbols, and BigInts cannot be written to Cloud Firestore.`
    );
  }

  // Preserve native Dates
  if (data instanceof Date) {
    return data;
  }

  // Preserve Firestore sentinels, references, timestamps, geopoints
  if (isFirestoreSpecialType(data)) {
    return data;
  }

  // Arrays: recursively sanitize elements and convert undefined elements to null
  if (Array.isArray(data)) {
    return data.map((item, idx) => {
      if (item === undefined) return null;
      return sanitizeForFirestore(item, `${path}[${idx}]`);
    }) as unknown as T;
  }

  // Plain objects: recursively sanitize and omit keys that are undefined
  if (type === "object") {
    const cleaned: Record<string, any> = {};
    const obj = data as Record<string, any>;
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val, path ? `${path}.${key}` : key);
      }
    }
    return cleaned as T;
  }

  return data;
}

/**
 * Validates portfolio structure before initiating any Firestore transaction.
 */
export function validatePortfolioBeforeSave(portfolio: Partial<PortfolioData>): void {
  if (!portfolio || typeof portfolio !== "object") {
    throw new Error("Portfolio save validation failed: payload must be a non-null object.");
  }

  const portfolioId = portfolio.portfolioId?.trim();
  if (!portfolioId) {
    throw new Error("Portfolio save validation failed: 'portfolioId' is required and cannot be empty.");
  }

  const ownerId = (portfolio.ownerId || portfolio.userId || "").trim();
  if (!ownerId) {
    throw new Error("Portfolio save validation failed: 'userId' or 'ownerId' is required.");
  }

  // Size limit sanity check
  try {
    const stringified = JSON.stringify(portfolio);
    if (stringified.length > 900_000) {
      throw new Error(
        "Portfolio document size exceeds Firestore 1MB document limit. Please use external media URLs instead of embedded Base64 assets."
      );
    }
  } catch (err: any) {
    if (err.message && err.message.includes("exceeds Firestore 1MB")) throw err;
  }
}

/**
 * Normalizes portfolio data to guarantee canonical fields and safe UI defaults.
 * All optional fields default to null or safe structures, NEVER undefined.
 */
export function normalizePortfolioData(data: Partial<PortfolioData>): PortfolioData {
  const ownerId = data.ownerId || data.userId || "";
  const username = (data.username || data.slug || "creator").toLowerCase().trim();
  const isPublished = Boolean(data.isPublished ?? data.published ?? false);
  const themeId = data.themeId || data.selectedTheme || "minimal-editorial";
  const defaultThemeMeta = THEME_REGISTRY.find((t) => t.id === themeId) || THEME_REGISTRY[0];
  const themeSettings = data.themeSettings || data.customThemeSettings || defaultThemeMeta.defaultSettings;
  const fullName = data.personalInfo?.fullName !== undefined ? data.personalInfo.fullName : (data.title?.replace(/'s Portfolio$/, "") || "");
  const professionalTitle = data.personalInfo?.professionalTitle !== undefined ? data.personalInfo.professionalTitle : (data.professionalTitle || "");

  // Safe resumeUrl resolution:
  // If explicitly provided as a non-empty string, preserve trimmed URL; otherwise null
  const rawResume = data.resumeUrl !== undefined ? data.resumeUrl : data.resumeURL;
  const resumeUrl = typeof rawResume === "string" && rawResume.trim() ? rawResume.trim() : null;

  const baseEmpty = createEmptyPortfolio(ownerId, username, fullName, data.personalInfo?.email);

  return {
    ...baseEmpty,
    ...data,
    portfolioId: data.portfolioId || baseEmpty.portfolioId,
    userId: ownerId,
    ownerId,
    username,
    slug: username,
    title: data.title || (fullName ? `${fullName}'s Portfolio` : "My Portfolio"),
    professionalTitle,
    description: data.description !== undefined ? data.description : (data.about?.bioLong || data.personalInfo?.tagline || ""),
    profileImage: data.profileImage !== undefined ? data.profileImage : (data.personalInfo?.avatarUrl || null),
    isPublished,
    published: isPublished,
    publishedAt: data.publishedAt || (isPublished ? new Date().toISOString() : null),
    themeId,
    selectedTheme: themeId,
    themeSettings,
    customThemeSettings: themeSettings,
    resumeUrl: resumeUrl,
    resumeURL: resumeUrl,
    seoTitle: data.seoTitle || (fullName ? `${fullName} — ${professionalTitle || "Portfolio"}` : "FolioCraft Portfolio"),
    seoDescription: data.seoDescription || data.personalInfo?.heroHeadline || data.personalInfo?.tagline || "",
    personalInfo: {
      ...baseEmpty.personalInfo,
      ...(data.personalInfo || {}),
      fullName,
      professionalTitle,
    },
    sections: data.sections && data.sections.length > 0 ? data.sections : baseEmpty.sections,
    projects: Array.isArray(data.projects) ? data.projects : [],
    experience: Array.isArray(data.experience) ? data.experience : [],
    education: Array.isArray(data.education) ? data.education : [],
    skills: Array.isArray(data.skills) ? data.skills : [],
    achievements: Array.isArray(data.achievements) ? data.achievements : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    dynamicSections: Array.isArray(data.dynamicSections) ? data.dynamicSections : [],
    socialLinks: data.socialLinks || {},
    about: {
      ...baseEmpty.about,
      ...(data.about || {}),
    },
  };
}

export async function getUserPortfoliosFromFirestore(userId: string): Promise<PortfolioData[]> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return [];

  try {
    const list: PortfolioData[] = [];
    const seenIds = new Set<string>();

    // 1. Direct fetch primary deterministic portfolio doc if it exists (instant, no composite index needed)
    try {
      const directDocRef = doc(db, "portfolios", "p-" + userId);
      const directSnap = await withTimeout(getDoc(directDocRef), 3500, "Direct read timed out");
      if (directSnap.exists()) {
        const item = normalizePortfolioData(directSnap.data() as PortfolioData);
        list.push(item);
        seenIds.add(item.portfolioId);
      }
    } catch {
      // Fallback to query
    }

    // 2. Query collection by userId
    try {
      const q = query(collection(db, "portfolios"), where("userId", "==", userId));
      const snapshot = await withTimeout(getDocs(q), 5000, "Failed to load user portfolios");
      snapshot.forEach((d) => {
        const item = normalizePortfolioData(d.data() as PortfolioData);
        if (!seenIds.has(item.portfolioId)) {
          list.push(item);
          seenIds.add(item.portfolioId);
        }
      });
    } catch (qErr) {
      console.warn("[Firestore] Query by userId warning:", qErr);
    }

    // 3. Query collection by ownerId if empty
    if (list.length === 0) {
      try {
        const qOwner = query(collection(db, "portfolios"), where("ownerId", "==", userId));
        const ownerSnap = await withTimeout(getDocs(qOwner), 5000, "Failed to load portfolios by ownerId");
        ownerSnap.forEach((d) => {
          const item = normalizePortfolioData(d.data() as PortfolioData);
          if (!seenIds.has(item.portfolioId)) {
            list.push(item);
            seenIds.add(item.portfolioId);
          }
        });
      } catch (qOwnerErr) {
        console.warn("[Firestore] Query by ownerId warning:", qOwnerErr);
      }
    }

    // Sort by updatedAt descending
    return list.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  } catch (err) {
    console.error("[Firestore] Error fetching user portfolios:", err);
    return [];
  }
}

export async function getPortfolioByIdFromFirestore(portfolioId: string): Promise<PortfolioData | null> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return null;

  try {
    const portfolioRef = doc(db, "portfolios", portfolioId);
    const snap = await withTimeout(getDoc(portfolioRef), 7000, "Portfolio read timed out");
    if (!snap.exists()) return null;
    return normalizePortfolioData(snap.data() as PortfolioData);
  } catch (err) {
    console.error("[Firestore] Error fetching portfolio by ID:", err);
    return null;
  }
}

export async function getPublishedPortfolioBySlug(username: string): Promise<PortfolioData | null> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return null;

  const normalized = username.toLowerCase().trim();
  if (!normalized) return null;

  try {
    // 1. Direct lookup via usernames reservation index (instant, zero index requirements)
    try {
      const uRef = doc(db, "usernames", normalized);
      const uSnap = await withTimeout(getDoc(uRef), 4000, "Username slug lookup timed out");
      if (uSnap.exists()) {
        const targetPortfolioId = uSnap.data()?.portfolioId;
        if (targetPortfolioId) {
          const pRef = doc(db, "portfolios", targetPortfolioId);
          const pSnap = await withTimeout(getDoc(pRef), 4000, "Portfolio document lookup timed out");
          if (pSnap.exists()) {
            const data = pSnap.data() as PortfolioData;
            if (data.isPublished === true || data.published === true) {
              return normalizePortfolioData(data);
            }
          }
        }
      }
    } catch (slugErr) {
      console.warn("[Firestore] Direct slug reservation lookup warning:", slugErr);
    }

    // 2. Collection query fallback by username and isPublished
    try {
      const q = query(
        collection(db, "portfolios"),
        where("username", "==", normalized),
        where("isPublished", "==", true),
        limit(1)
      );
      const snapshot = await withTimeout(getDocs(q), 5000, "Public portfolio lookup timed out");
      if (!snapshot.empty) {
        return normalizePortfolioData(snapshot.docs[0].data() as PortfolioData);
      }
    } catch (qErr) {
      console.warn("[Firestore] Public query by username warning:", qErr);
    }

    // 3. Collection query fallback by slug alias
    try {
      const qAlt = query(
        collection(db, "portfolios"),
        where("slug", "==", normalized),
        where("published", "==", true),
        limit(1)
      );
      const snapAlt = await withTimeout(getDocs(qAlt), 5000, "Public portfolio alternate lookup timed out");
      if (!snapAlt.empty) {
        return normalizePortfolioData(snapAlt.docs[0].data() as PortfolioData);
      }
    } catch {
      // Fallback
    }

    return null;
  } catch (err) {
    console.error("[Firestore] Error querying published portfolio by slug:", err);
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
    const snap = await withTimeout(getDoc(uRef), 5000, "Slug availability check timed out");
    if (!snap.exists()) return true;
    const data = snap.data();
    return data?.portfolioId === currentPortfolioId;
  } catch (err) {
    console.error("[Firestore] Error checking slug availability:", err);
    return false;
  }
}

export async function savePortfolioToFirestore(portfolio: PortfolioData): Promise<void> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) {
    throw new Error("Firestore is not configured. Cannot save portfolio.");
  }

  // Pre-transaction validation
  validatePortfolioBeforeSave(portfolio);

  const auth = getClientAuth();
  const currentUid = auth?.currentUser?.uid;
  const portfolioId = portfolio.portfolioId.trim();
  const rawOwner = (portfolio.ownerId || portfolio.userId || "").trim();
  const resolvedOwnerId = currentUid || (rawOwner !== "demo-user" ? rawOwner : "");

  if (!resolvedOwnerId) {
    throw new Error("Authentication required: you must be signed in to save portfolio data.");
  }

  const now = new Date().toISOString();

  try {
    // Atomic transaction for slug reservation and portfolio persistence
    await withTimeout(
      runTransaction(db, async (transaction) => {
        const portfolioRef = doc(db, "portfolios", portfolioId);

        // READS FIRST: All gets must precede all sets/updates/deletes in Firestore transactions
        const existingSnap = await transaction.get(portfolioRef);
        const existingData = existingSnap.exists()
          ? (existingSnap.data() as Partial<PortfolioData>)
          : null;

        const normalizedUsername = (
          portfolio.username ||
          portfolio.slug ||
          existingData?.username ||
          existingData?.slug ||
          ""
        ).toLowerCase().trim();

        let usernameSnap = null;
        let usernameRef = null;
        if (normalizedUsername) {
          usernameRef = doc(db, "usernames", normalizedUsername);
          usernameSnap = await transaction.get(usernameRef);
        }

        // Validate slug reservation conflict
        if (usernameSnap && usernameSnap.exists()) {
          const reservedPortfolioId = usernameSnap.data()?.portfolioId;
          const reservedUserId = usernameSnap.data()?.userId || usernameSnap.data()?.ownerId;
          if (
            reservedPortfolioId &&
            reservedPortfolioId !== portfolioId &&
            reservedUserId &&
            reservedUserId !== resolvedOwnerId
          ) {
            throw new Error(`The username '${normalizedUsername}' is already reserved by another creator.`);
          }
        }

        // Clean up previous username reservation if slug changed
        const oldUsername = (existingData?.username || existingData?.slug || "").toLowerCase().trim();
        if (oldUsername && oldUsername !== normalizedUsername) {
          const oldUsernameRef = doc(db, "usernames", oldUsername);
          transaction.delete(oldUsernameRef);
        }

        // Optional field handling for resumeUrl:
        // Check if incoming payload explicitly passed resumeUrl or resumeURL
        const hasIncomingResume =
          portfolio.resumeUrl !== undefined || portfolio.resumeURL !== undefined;
        const incomingResumeVal =
          portfolio.resumeUrl !== undefined ? portfolio.resumeUrl : portfolio.resumeURL;

        let resumeAction: any;

        if (hasIncomingResume) {
          if (typeof incomingResumeVal === "string" && incomingResumeVal.trim()) {
            resumeAction = incomingResumeVal.trim();
          } else if (incomingResumeVal === null || incomingResumeVal === "") {
            // Explicitly cleared or removed
            if (existingSnap.exists()) {
              resumeAction = deleteField();
            } else {
              resumeAction = null;
            }
          } else {
            resumeAction = null;
          }
        } else {
          // Unrelated partial update where resumeUrl was omitted: preserve existing
          if (existingData && (existingData.resumeUrl || existingData.resumeURL)) {
            resumeAction = existingData.resumeUrl || existingData.resumeURL;
          } else {
            resumeAction = null;
          }
        }

        // Merge without forcing demo hardcoded content!
        const baseEmpty = createEmptyPortfolio(resolvedOwnerId, normalizedUsername || "creator");
        const merged: PortfolioData = {
          ...baseEmpty,
          ...(existingData || {}),
          ...portfolio,
          portfolioId,
          userId: resolvedOwnerId,
          ownerId: resolvedOwnerId,
          username: normalizedUsername || existingData?.username || "creator",
          slug: normalizedUsername || existingData?.slug || "creator",
          updatedAt: now,
          createdAt: existingData?.createdAt || portfolio.createdAt || now,
        };

        // Sanitize out any accidental transient browser session blob URLs
        if (merged.profileImage && merged.profileImage.startsWith("blob:")) {
          merged.profileImage = existingData?.profileImage || null;
        }
        if (merged.personalInfo?.avatarUrl && merged.personalInfo.avatarUrl.startsWith("blob:")) {
          merged.personalInfo.avatarUrl = existingData?.personalInfo?.avatarUrl || undefined;
        }

        const normalized = normalizePortfolioData(merged);

        // Overlay the resolved resume field action (which could be string, null, or deleteField())
        const writePayload: Record<string, any> = {
          ...normalized,
          userId: resolvedOwnerId,
          ownerId: resolvedOwnerId,
          resumeUrl: resumeAction,
          resumeURL: resumeAction,
        };

        // Recursive sanitization: eliminates ANY undefined properties throughout the entire document tree
        const sanitizedPayload = sanitizeForFirestore(writePayload);

        // WRITES
        if (normalizedUsername && usernameRef) {
          transaction.set(
            usernameRef,
            {
              username: normalizedUsername,
              slug: normalizedUsername,
              userId: resolvedOwnerId,
              ownerId: resolvedOwnerId,
              portfolioId: portfolioId,
              updatedAt: now,
            },
            { merge: true }
          );
        }

        transaction.set(portfolioRef, sanitizedPayload, { merge: true });
      }),
      8000,
      "Portfolio save transaction timed out"
    );
  } catch (err) {
    console.error("[Firestore] Error in savePortfolioToFirestore transaction:", err);
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
    const snap = await withTimeout(getDoc(portfolioRef), 5000, "Delete verification timed out");
    if (snap.exists()) {
      const data = snap.data();
      const owner = data?.ownerId || data?.userId;
      if (owner && owner !== userId) {
        throw new Error("Unauthorized: you do not own this portfolio.");
      }
    }

    await withTimeout(deleteDoc(portfolioRef), 5000, "Delete operation timed out");

    // Remove username reservation if associated
    if (username) {
      const uRef = doc(db, "usernames", username.toLowerCase().trim());
      await deleteDoc(uRef).catch((e) => console.warn("Failed to delete username doc:", e));
    }
  } catch (err) {
    console.error("[Firestore] Error deleting portfolio:", err);
    throw err;
  }
}

// ============================================================================
// 3. THEMES COLLECTION
// Collection: themes
// ============================================================================
export interface ThemeFirestoreDocument {
  themeId: string;
  name: string;
  category: string;
  description: string;
  previewImage?: string;
  defaultSettings: ThemeSettings;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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
          defaultSettings: theme.defaultSettings,
          isActive: true,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn("[Firestore] Notice syncing themes to Firestore:", err);
  }
}

export async function getThemesFromFirestore(): Promise<ThemeFirestoreDocument[]> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) {
    return THEME_REGISTRY.map((t) => ({
      themeId: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
      defaultSettings: t.defaultSettings,
      isActive: true,
    }));
  }

  try {
    const q = query(collection(db, "themes"), where("isActive", "==", true));
    const snap = await withTimeout(getDocs(q), 5000, "Themes read timed out");
    if (snap.empty) {
      return THEME_REGISTRY.map((t) => ({
        themeId: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        defaultSettings: t.defaultSettings,
        isActive: true,
      }));
    }
    const list: ThemeFirestoreDocument[] = [];
    snap.forEach((d) => list.push(d.data() as ThemeFirestoreDocument));
    return list;
  } catch {
    return THEME_REGISTRY.map((t) => ({
      themeId: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
      defaultSettings: t.defaultSettings,
      isActive: true,
    }));
  }
}

// ============================================================================
// 4. ANALYTICS COLLECTION
// Collection: analytics
// ============================================================================
export interface AnalyticsDocument {
  portfolioId: string;
  ownerId?: string;
  visitorCount: number;
  pageViews: number;
  viewCount: number;
  lastVisited: string;
  eventType: string;
  source?: string;
}

export async function recordPortfolioPageView(
  portfolioId: string,
  eventType = "page_view",
  source = "direct"
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
        viewCount: increment(1),
        lastVisited: now,
        eventType,
        source,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("[Firestore] Notice recording analytics event:", err);
  }
}

export async function getPortfolioAnalytics(
  portfolioId: string
): Promise<{ visitorCount: number; pageViews: number; lastVisited: string; viewCount: number } | null> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return null;

  try {
    const analyticsRef = doc(db, "analytics", portfolioId);
    const snap = await withTimeout(getDoc(analyticsRef), 5000, "Analytics read timed out");
    if (!snap.exists()) {
      return { visitorCount: 0, pageViews: 0, viewCount: 0, lastVisited: "No visits recorded" };
    }
    const d = snap.data();
    return {
      visitorCount: d.visitorCount || d.pageViews || 0,
      pageViews: d.pageViews || 0,
      viewCount: d.viewCount || d.pageViews || 0,
      lastVisited: d.lastVisited || "Recent",
    };
  } catch (err) {
    console.error("[Firestore] Error reading portfolio analytics:", err);
    return null;
  }
}

// ============================================================================
// 5. CUSTOM DOMAINS COLLECTION
// Collection: customDomains
// ============================================================================
export interface CustomDomainDocument {
  domainId: string;
  ownerId: string;
  portfolioId: string;
  domain: string;
  verificationStatus: "pending" | "verified" | "failed";
  createdAt: string;
  verifiedAt?: string | null;
}

export async function registerCustomDomain(
  ownerId: string,
  portfolioId: string,
  domain: string
): Promise<void> {
  const db = getClientDb();
  if (!db || !isFirebaseConfigured) return;

  const normalizedDomain = domain.toLowerCase().trim();
  const domainId = "dom_" + normalizedDomain.replace(/[^a-z0-9]/g, "_");
  const domainRef = doc(db, "customDomains", normalizedDomain);

  await setDoc(
    domainRef,
    {
      domainId,
      ownerId,
      userId: ownerId,
      portfolioId,
      domain: normalizedDomain,
      verificationStatus: "pending",
      createdAt: new Date().toISOString(),
      verifiedAt: null,
    },
    { merge: true }
  );
}
