import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getPortfolioByIdFromFirestore,
  savePortfolioToFirestore,
} from "@/lib/firebase/firestore";

interface Props {
  params: Promise<{ portfolioId: string }>;
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { portfolioId } = await params;
    const body = await request.json();
    const { isPublished, userId } = body;

    const portfolio = await getPortfolioByIdFromFirestore(portfolioId);
    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
    }

    if (userId && portfolio.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: You do not own this portfolio." },
        { status: 403 }
      );
    }

    const updatedPortfolio = {
      ...portfolio,
      isPublished: Boolean(isPublished),
      publishedAt: isPublished ? new Date().toISOString() : portfolio.publishedAt,
      updatedAt: new Date().toISOString(),
    };

    await savePortfolioToFirestore(updatedPortfolio);

    // Invalidate Next.js cache so the public portfolio updates immediately
    if (portfolio.username) {
      revalidatePath(`/portfolio/${portfolio.username}`);
      revalidatePath(`/p/${portfolio.username}`);
    }

    return NextResponse.json({
      success: true,
      isPublished: updatedPortfolio.isPublished,
      publishedAt: updatedPortfolio.publishedAt,
    });
  } catch (err: unknown) {
    console.error("POST /api/portfolios/[portfolioId]/publish error:", err);
    return NextResponse.json(
      { error: "Failed to update publication status." },
      { status: 500 }
    );
  }
}
