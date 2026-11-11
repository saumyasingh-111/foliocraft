import { NextRequest, NextResponse } from "next/server";
import { generateSectionWithAI, recommendSectionLayout } from "@/lib/sections/aiArchitect";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, action = "create_section", section, entryCount } = body;

    if (action === "recommend_layout") {
      if (!section) {
        return NextResponse.json(
          { success: false, error: "Section data is required for layout recommendation." },
          { status: 400 }
        );
      }
      const recommendation = recommendSectionLayout(section, entryCount || 1);
      return NextResponse.json({ success: true, ...recommendation });
    }

    // Default action: create_section
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "A valid prompt describing the section is required." },
        { status: 400 }
      );
    }

    const result = await generateSectionWithAI(prompt);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("AI Section Builder API Route Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "An unexpected error occurred while generating section schema.",
      },
      { status: 500 }
    );
  }
}
