import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { translationModel, generateContentWithRetry } from "@/lib/gemini";
import { getNarrativeGenerationPrompt } from "@/lib/prompts";
import { checkCredits, deductCredits } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // bullets: 영문 불렛 포인트 배열
    // jobContext: (Optional) 직무/상황 컨텍스트
    const { bullets, jobContext } = await req.json();

    if (!bullets || !Array.isArray(bullets) || bullets.length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Check credits (Standard cost for narrative generation)
    // TODO: Define specific cost for this action if different from standard translation
    const cost = 1.0;
    const hasCredits = await checkCredits(session.user.id, cost);
    if (!hasCredits) {
      return NextResponse.json(
        { error: "크레딧이 부족합니다." },
        { status: 403 }
      );
    }

    const prompt = getNarrativeGenerationPrompt(bullets, jobContext);

    // Call Gemini API
    const result = await generateContentWithRetry(translationModel, prompt);
    const responseText = result.response.text();

    // Extract JSON part
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? jsonMatch[0] : responseText;

    let narrativeTexts: string[];
    try {
      narrativeTexts = JSON.parse(jsonText);
    } catch (e) {
      console.error("JSON parse failed", responseText);
      throw new Error("Failed to parse AI response");
    }

    // Deduct credits
    await deductCredits(session.user.id, cost, "영문 불렛 → 국문 자소서 변환");

    return NextResponse.json({ narrativeTexts });
  } catch (error: any) {
    console.error("Narrative Generation API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate narrative" },
      { status: 500 }
    );
  }
}
