import {
  getUserPortfoliosFromFirestore,
  getPortfolioByIdFromFirestore,
  getPublishedPortfolioBySlug,
  checkSlugAvailability,
  savePortfolioToFirestore,
  deletePortfolioFromFirestore,
  recordPortfolioPageView,
  getPortfolioAnalytics,
} from "../firebase/firestore";
import { getClientAuth } from "../firebase/client";
import { PortfolioData } from "@/themes/types";
import { createEmptyPortfolio, SAMPLE_DEMO_PORTFOLIO } from "../utils/defaults";

export async function getUserPortfolios(userId: string): Promise<PortfolioData[]> {
  const portfolios = await getUserPortfoliosFromFirestore(userId);
  if (portfolios.length === 0) {
    // If user has no portfolio yet, create a clean, genuinely empty portfolio for this user
    const auth = getClientAuth();
    const currentName = auth?.currentUser?.displayName || undefined;
    const currentEmail = auth?.currentUser?.email || undefined;
    const baseSlug = (currentName || currentEmail?.split("@")[0] || "creator")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const uniqueSlug = `${baseSlug || "creator"}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const newPortfolio = createEmptyPortfolio(userId, uniqueSlug, currentName, currentEmail);

    try {
      await savePortfolioToFirestore(newPortfolio);
      return [newPortfolio];
    } catch (err) {
      console.warn("[Portfolios] Could not auto-persist newly generated portfolio draft:", err);
      return [newPortfolio];
    }
  }
  return portfolios;
}

export async function getPortfolioById(portfolioId: string): Promise<PortfolioData | null> {
  return await getPortfolioByIdFromFirestore(portfolioId);
}

export async function getPortfolioByUsername(username: string): Promise<PortfolioData | null> {
  const portfolio = await getPublishedPortfolioBySlug(username);
  if (portfolio) {
    // Record real analytics event asynchronously
    recordPortfolioPageView(portfolio.portfolioId, "page_view").catch(() => {});
  }
  return portfolio;
}

export async function checkUsernameAvailability(
  username: string,
  currentPortfolioId?: string
): Promise<boolean> {
  return await checkSlugAvailability(username, currentPortfolioId);
}

export async function savePortfolio(portfolio: PortfolioData): Promise<void> {
  return await savePortfolioToFirestore(portfolio);
}

export async function deletePortfolio(portfolioId: string, userId?: string): Promise<void> {
  return await deletePortfolioFromFirestore(portfolioId, userId || "");
}

export { recordPortfolioPageView, getPortfolioAnalytics };
