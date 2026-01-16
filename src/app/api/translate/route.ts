import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { translationModel, generateContentWithRetry } from "@/lib/gemini";
import { getTranslationPrompt } from "@/lib/prompts";
import { checkCredits, deductCredits } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      texts,
      type = "bullets",
      resumeId,
      targetLang = "en",
    } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Check credits (1.0 for re-translation)
    const cost = 1.0;
    const hasCredits = await checkCredits(session.user.id, cost);
    if (!hasCredits) {
      return NextResponse.json(
        { error: "크레딧이 부족합니다." },
        { status: 403 }
      );
    }

    const prompt = getTranslationPrompt(texts, type, targetLang);

    const result = await generateContentWithRetry(translationModel, prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? jsonMatch[0] : responseText;

    let translatedTexts;
    try {
      translatedTexts = JSON.parse(jsonText);
    } catch (e) {
      console.error("JSON parse failed", responseText);
      throw new Error("Failed to parse AI response");
    }

    // Deduct credits
    await deductCredits(
      session.user.id,
      cost,
      `이력서 부분 재번역 ${resumeId ? `(Resume ID: ${resumeId})` : ""}`
    );

    return NextResponse.json({ translatedTexts });
  } catch (error: any) {
    console.error("Translation API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to translate" },
      { status: 500 }
    );
  }
}
