import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { geminiModel, generateContentWithRetry } from "@/lib/gemini";

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

    let instruction = "";
    if (type === "bullets") {
      instruction = `
      Translate the following Korean bullet points into professional English resume bullet points.
      Rules:
      - Maintain the original meaning, metrics, and technical terms.
      - Use strong professional action verbs (e.g., Developed, Orchestrated, Optimized).
      - Keep formatting consistent.
      `;
    } else {
      instruction = `
      Translate the following Korean text into English suitable for a resume (e.g., School Name, Major, Degree).
      Rules:
      - Maintain proper nouns (e.g., University names).
      - Use standard academic terms (e.g., Bachelor of Science, GPA).
      - Keep formatting consistent.
      `;
    }

    const prompt = `
    You are a professional resume translator.
    ${instruction}
    - Output ONLY a JSON array of strings. Do not include markdown code blocks.

    Input:
    ${JSON.stringify(texts)}
    `;

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
