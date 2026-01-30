import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
import * as fs from "fs/promises";
import * as path from "path";
import { execSync } from "child_process";

dotenv.config();

const API_KEY =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY is not set");
  process.exit(1);
}

const client = new GoogleGenAI({ apiKey: API_KEY });
const models = client.models;

async function generateWithRetry(prompt: string): Promise<string> {
  try {
    const result = await models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("AI generation failed:", error);
    throw error;
  }
}

async function main() {
  const dataPath = path.join(process.cwd(), "src/lib/data/release-notes.json");
  const rawData = await fs.readFile(dataPath, "utf-8");
  const notes = JSON.parse(rawData);

  // Get last release date
  const lastDate = notes.length > 0 ? notes[0].date : "2026-01-01";

  console.log(`Getting commits since ${lastDate}...`);

  let commits = "";
  try {
    commits = execSync(
      `git log --since="${lastDate} 23:59:59" --pretty=format:"%s" --no-merges`,
    )
      .toString()
      .trim();
  } catch (e) {
    console.warn("Failed to get git log, or no commits found.");
  }

  if (!commits || commits.length < 10) {
    console.log(
      "No significant new commits found. Skipping release note generation.",
    );
    return;
  }

  console.log("Found new commits. Generating summary with AI...");

  const prompt = `
당신은 글로벌 서비스 '지원고고(ApplyGogo)'의 제품 매니저입니다.
최근 배포된 다음 커밋 내역을 바탕으로 사용자에게 친숙한 릴리즈 노트를 작성해주세요.

커밋 내역:
${commits}

요구사항:
1. 한국어(ko), 영어(en), 일본어(ja) 3개 국어로 작성하세요.
2. 각 언어별로 제목(title), 상세 설명(description), 주차(week)를 생성하세요.
3. 주차(week)는 기존 데이터의 마지막 주차 정보를 참고하되, 이번이 몇 주차인지 판단하세요. (현재 마지막 주차: ${notes[0]?.week?.ko || "4주차"})
4. 상세 설명은 1-2문장으로 매우 친숙하고 명확하게 작성하세요.
5. 버전(version)은 기존 버전(${notes[0]?.version})에서 적절히 마이너 업데이트(0.1.0 증가) 하세요.
6. 결과는 반드시 다음과 같은 JSON 형식이여야 하며, 다른 텍스트는 포함하지 마세요:
{
  "version": "1.x.x",
  "title": { "ko": "...", "en": "...", "ja": "..." },
  "description": { "ko": "...", "en": "...", "ja": "..." },
  "week": { "ko": "n주차", "en": "Week n", "ja": "n週目" }
}
`;

  const aiResponse = await generateWithRetry(prompt);
  const jsonText = aiResponse
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let newNote;
  try {
    newNote = JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse AI response:", jsonText);
    process.exit(1);
  }

  const finalNote = {
    ...newNote,
    date: new Date().toISOString().split("T")[0],
  };

  notes.unshift(finalNote); // Add to beginning (latest first)

  await fs.writeFile(dataPath, JSON.stringify(notes, null, 2), "utf-8");
  console.log(
    `Successfully generated and added release note v${finalNote.version}`,
  );
}

main().catch(console.error);
