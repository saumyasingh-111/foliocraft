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
import { PortfolioData } from "@/themes/types";
import { INITIAL_DEFAULT_PORTFOLIO } from "../utils/defaults";

export async function getUserPortfolios(userId: string): Promise<PortfolioData[]> {
  const portfolios = await getUserPortfoliosFromFirestore(userId);
  if (portfolios.length === 0) {
    // If user has no portfolio yet, create and seed an initial draft
    const seeded: PortfolioData = {
      ...INITIAL_DEFAULT_PORTFOLIO,
      portfolioId: "p-" + Math.random().toString(36).substring(2, 9),
      userId,
      title: "My Portfolio",
      username: "user-" + Math.floor(Math.random() * 9000 + 1000),
      isPublished: false,
      publishedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await savePortfolioToFirestore(seeded);
      return [seeded];
    } catch {
      return [seeded];
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
