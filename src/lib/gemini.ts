import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export const gemini = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const SUMMARY_PROMPT = `
You are an expert resume consultant.
Extract work experiences from the provided Korean resume text.
For each work experience, summarize the key achievements into 3-4 bullet points in KOREAN.
Focus on Action Verbs and quantifiable results.

Input Text:
{{TEXT}}

Output Format (JSON Array):
[
  {
    "companyName": "Company Name",
    "role": "Job Title",
    "startDate": "YYYY.MM",
    "endDate": "YYYY.MM or Present",
    "bullets": ["Achievement 1", "Achievement 2", "Achievement 3"]
  }
]
RETURN ONLY JSON.
`;

export const TRANSLATE_PROMPT = `
You are an expert English resume translator.
Translate the following Korean bullet points into professional English resume bullet points.
Use strong Action Verbs (e.g., Spearheaded, Orchestrated, Developed).
Keep the meaning but improve the tone to be more impactful.

Korean Bullets:
{{BULLETS}}

Output Format (JSON Array of Strings):
["English Bullet 1", "English Bullet 2", "English Bullet 3"]

RETURN ONLY JSON.
`;
