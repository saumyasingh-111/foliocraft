import { NextRequest, NextResponse } from "next/server";
import { checkSlugAvailability } from "@/lib/firebase/firestore";
import { isValidSlug, slugify } from "@/lib/utils/slugify";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get("username");
    const portfolioId = searchParams.get("portfolioId") || undefined;

    if (!rawUsername) {
      return NextResponse.json(
        { error: "Username parameter is required." },
        { status: 400 }
      );
    }

    const normalized = slugify(rawUsername);
    if (!isValidSlug(normalized)) {
      return NextResponse.json(
        {
          available: false,
          username: normalized,
          message: "Username must be 3-30 lowercase alphanumeric characters or hyphens.",
        },
        { status: 200 }
      );
    }

    const available = await checkSlugAvailability(normalized, portfolioId);

    return NextResponse.json({
      available,
      username: normalized,
    });
  } catch (err: unknown) {
    console.error("API /api/username/check error:", err);
    return NextResponse.json(
      { error: "Internal server error checking username availability." },
      { status: 500 }
    );
  }
}
