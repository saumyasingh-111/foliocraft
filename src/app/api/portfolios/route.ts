import { NextRequest, NextResponse } from "next/server";
import {
  getUserPortfoliosFromFirestore,
  savePortfolioToFirestore,
  checkSlugAvailability,
} from "@/lib/firebase/firestore";
import { PortfolioData } from "@/themes/types";
import { INITIAL_DEFAULT_PORTFOLIO } from "@/lib/utils/defaults";
import { slugify } from "@/lib/utils/slugify";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required query parameter: userId" },
        { status: 400 }
      );
    }

    const portfolios = await getUserPortfoliosFromFirestore(userId);
    return NextResponse.json({ portfolios });
  } catch (err: unknown) {
    console.error("GET /api/portfolios error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve portfolios." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, username, themeId } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { error: "Fields 'userId' and 'title' are required." },
        { status: 400 }
      );
    }

    const portfolioId = "p-" + Math.random().toString(36).substring(2, 9);
    const slug = slugify(username || title);

    // Verify slug availability
    const isAvailable = await checkSlugAvailability(slug);
    const finalSlug = isAvailable ? slug : `${slug}-${Math.floor(Math.random() * 900 + 100)}`;

    const newPortfolio: PortfolioData = {
      ...INITIAL_DEFAULT_PORTFOLIO,
      portfolioId,
      userId,
      title,
      username: finalSlug,
      themeId: themeId || "minimal-editorial",
      isPublished: false,
      publishedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await savePortfolioToFirestore(newPortfolio);

    return NextResponse.json({ portfolio: newPortfolio }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/portfolios error:", err);
    return NextResponse.json(
      { error: "Failed to create portfolio." },
      { status: 500 }
    );
  }
}
