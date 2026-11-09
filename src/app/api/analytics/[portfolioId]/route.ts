import { NextRequest, NextResponse } from "next/server";
import {
  getPortfolioAnalytics,
  recordPortfolioPageView,
} from "@/lib/firebase/firestore";

interface Props {
  params: Promise<{ portfolioId: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { portfolioId } = await params;
    const stats = await getPortfolioAnalytics(portfolioId);
    return NextResponse.json({ stats });
  } catch (err: unknown) {
    console.error("GET /api/analytics/[portfolioId] error:", err);
    return NextResponse.json(
      { error: "Failed to read analytics." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { portfolioId } = await params;
    await recordPortfolioPageView(portfolioId, "page_view");
    return NextResponse.json({ recorded: true });
  } catch (err: unknown) {
    console.error("POST /api/analytics/[portfolioId] error:", err);
    return NextResponse.json(
      { error: "Failed to record analytics." },
      { status: 500 }
    );
  }
}
