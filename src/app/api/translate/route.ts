import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { geminiModel, generateContentWithRetry } from "@/lib/gemini";
import { getTranslationPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { texts, type = "bullets" } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const prompt = getTranslationPrompt(texts, type);

    const result = await generateContentWithRetry(geminiModel, prompt);
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

    return NextResponse.json({ translatedTexts });
  } catch (error: any) {
    console.error("Translation API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to translate" },
      { status: 500 }
    );
  }
}
