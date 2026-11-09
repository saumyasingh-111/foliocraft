import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/client";
import { PortfolioData } from "@/themes/types";
import { INITIAL_DEFAULT_PORTFOLIO } from "../utils/defaults";

const LOCAL_STORAGE_PORTFOLIOS_KEY = "website_maker_mock_portfolios";

function getLocalPortfolios(): PortfolioData[] {
  if (typeof window === "undefined") return [INITIAL_DEFAULT_PORTFOLIO];
  const stored = localStorage.getItem(LOCAL_STORAGE_PORTFOLIOS_KEY);
  if (!stored) {
    const initial = [INITIAL_DEFAULT_PORTFOLIO];
    localStorage.setItem(LOCAL_STORAGE_PORTFOLIOS_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [INITIAL_DEFAULT_PORTFOLIO];
  }
}

function saveLocalPortfolios(portfolios: PortfolioData[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_PORTFOLIOS_KEY, JSON.stringify(portfolios));
}

export async function getUserPortfolios(userId: string): Promise<PortfolioData[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "portfolios"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const list: PortfolioData[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as PortfolioData);
      });
      return list;
    } catch (err) {
      console.warn("Firestore getUserPortfolios error, fallback to local:", err);
    }
  }

  // Fallback to local
  const all = getLocalPortfolios();
  const userList = all.filter((p) => p.userId === userId || p.userId === "demo-user");
  if (userList.length === 0) {
    // Seed an initial one for this user
    const seeded = {
      ...INITIAL_DEFAULT_PORTFOLIO,
      portfolioId: "portfolio-" + Math.random().toString(36).substring(2, 9),
      userId,
    };
    saveLocalPortfolios([...all, seeded]);
    return [seeded];
  }
  return userList;
}

export async function getPortfolioById(portfolioId: string): Promise<PortfolioData | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "portfolios", portfolioId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as PortfolioData;
      }
    } catch (err) {
      console.warn("Firestore getPortfolioById error, fallback to local:", err);
    }
  }

  const all = getLocalPortfolios();
  const found = all.find((p) => p.portfolioId === portfolioId);
  return found || null;
}

export async function getPortfolioByUsername(username: string): Promise<PortfolioData | null> {
  const normalized = username.toLowerCase().trim();
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, "portfolios"),
        where("username", "==", normalized),
        where("isPublished", "==", true)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as PortfolioData;
      }
    } catch (err) {
      console.warn("Firestore getPortfolioByUsername error, fallback to local:", err);
    }
  }

  const all = getLocalPortfolios();
  const match = all.find(
    (p) => p.username.toLowerCase() === normalized && p.isPublished
  );
  return match || null;
}

export async function checkUsernameAvailability(
  username: string,
  currentPortfolioId?: string
): Promise<boolean> {
  const normalized = username.toLowerCase().trim();
  if (!normalized) return false;

  if (isFirebaseConfigured && db) {
    try {
      const userDocRef = doc(db, "usernames", normalized);
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) return true;
      const data = snap.data();
      return data?.portfolioId === currentPortfolioId;
    } catch (err) {
      console.warn("Firestore checkUsernameAvailability error, fallback:", err);
    }
  }

  const all = getLocalPortfolios();
  const exists = all.some(
    (p) => p.username.toLowerCase() === normalized && p.portfolioId !== currentPortfolioId
  );
  return !exists;
}

export async function savePortfolio(portfolio: PortfolioData): Promise<void> {
  portfolio.updatedAt = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "portfolios", portfolio.portfolioId);
      await setDoc(docRef, {
        ...portfolio,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Record username reservation
      if (portfolio.username) {
        const uRef = doc(db, "usernames", portfolio.username.toLowerCase());
        await setDoc(uRef, {
          username: portfolio.username.toLowerCase(),
          userId: portfolio.userId,
          portfolioId: portfolio.portfolioId,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      return;
    } catch (err) {
      console.warn("Firestore savePortfolio error, saving to local store:", err);
    }
  }

  // Local fallback
  const all = getLocalPortfolios();
  const index = all.findIndex((p) => p.portfolioId === portfolio.portfolioId);
  if (index >= 0) {
    all[index] = portfolio;
  } else {
    all.push(portfolio);
  }
  saveLocalPortfolios(all);
}

export async function deletePortfolio(portfolioId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "portfolios", portfolioId));
      return;
    } catch (err) {
      console.warn("Firestore deletePortfolio error, fallback to local:", err);
    }
  }

  const all = getLocalPortfolios();
  const filtered = all.filter((p) => p.portfolioId !== portfolioId);
  saveLocalPortfolios(filtered);
}
