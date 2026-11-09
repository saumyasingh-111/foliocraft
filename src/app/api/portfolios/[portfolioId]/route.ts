import { NextRequest, NextResponse } from "next/server";
import {
  getPortfolioByIdFromFirestore,
  savePortfolioToFirestore,
  deletePortfolioFromFirestore,
} from "@/lib/firebase/firestore";
import { PortfolioData } from "@/themes/types";

interface Props {
  params: Promise<{ portfolioId: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { portfolioId } = await params;
    const portfolio = await getPortfolioByIdFromFirestore(portfolioId);

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ portfolio });
  } catch (err: unknown) {
    console.error("GET /api/portfolios/[portfolioId] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch portfolio." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { portfolioId } = await params;
    const body = (await request.json()) as PortfolioData;

    if (!body || body.portfolioId !== portfolioId) {
      return NextResponse.json(
        { error: "Payload portfolioId does not match URL." },
        { status: 400 }
      );
    }

    await savePortfolioToFirestore(body);

    return NextResponse.json({ success: true, portfolio: body });
  } catch (err: unknown) {
    console.error("PUT /api/portfolios/[portfolioId] error:", err);
    return NextResponse.json(
      { error: "Failed to update portfolio." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { portfolioId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const username = searchParams.get("username") || undefined;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required query parameter: userId" },
        { status: 400 }
      );
    }

    await deletePortfolioFromFirestore(portfolioId, userId, username);

    return NextResponse.json({ success: true, deletedId: portfolioId });
  } catch (err: unknown) {
    console.error("DELETE /api/portfolios/[portfolioId] error:", err);
    return NextResponse.json(
      { error: "Failed to delete portfolio." },
      { status: 500 }
    );
  }
}
