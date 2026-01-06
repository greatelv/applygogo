import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

interface ResumeAnalysisResult {
  summary: string;
  workExperience: {
    companyNameKr: string;
    companyNameEn?: string;
    roleKr: string;
    roleEn?: string;
    startDate: string; // YYYY.MM
    endDate: string; // YYYY.MM or Present
    bulletsKr: string[];
    bulletsEn?: string[];
  }[];
  education: {
    schoolName: string;
    major: string;
    degree: string;
    startDate: string;
    endDate: string;
  }[];
  skills: {
    name: string;
    level?: string;
  }[];
}

export async function analyzeResume(
  filePath: string,
  mimeType: string = "application/pdf"
): Promise<ResumeAnalysisResult> {
  let uploadResult;

  try {
    // 1. Upload the file to Gemini
    uploadResult = await fileManager.uploadFile(filePath, {
      mimeType,
      displayName: "Resume Upload",
    });

    console.log(
      `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`
    );

    // 2. Initialize Model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Generate Content
    const prompt = `
    Please analyze this resume and extract the following information in JSON format.
    Translate any Korean content to English where appropriate for the "En" fields, but keep the original Korean in "Kr" fields.
    
    Structure:
    {
      "summary": "A professional summary of the candidate in Korean",
      "workExperience": [
        {
          "companyNameKr": "Original Company Name",
          "companyNameEn": "English Company Name",
          "roleKr": "Original Role",
          "roleEn": "English Role",
          "startDate": "YYYY.MM",
          "endDate": "YYYY.MM or Present",
          "bulletsKr": ["Detail 1 in Korean", "Detail 2 in Korean"],
          "bulletsEn": ["Detail 1 in English", "Detail 2 in English"]
        }
      ],
      "education": [
        {
          "schoolName": "School Name",
          "major": "Major",
          "degree": "Degree (Bachelor's, Master's, etc)",
          "startDate": "YYYY.MM",
          "endDate": "YYYY.MM or Present"
        }
      ],
      "skills": [
        { "name": "Skill Name", "level": "Level (Optional)" }
      ]
    }
    
    IMPORTANT: Return ONLY the JSON string. Do not include markdown code blocks.
    `;

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResult.file.mimeType,
          fileUri: uploadResult.file.uri,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean up markdown formatting if present
    const jsonString = text.replace(/```json\n?|\n?```/g, "").trim();

    try {
      return JSON.parse(jsonString) as ResumeAnalysisResult;
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", text);
      throw new Error("Failed to parse resume analysis result");
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  } finally {
    // 4. Cleanup: Delete the file from Gemini
    if (uploadResult?.file?.name) {
      try {
        await fileManager.deleteFile(uploadResult.file.name);
        console.log(`Deleted file ${uploadResult.file.name}`);
      } catch (e) {
        console.error("Failed to delete file from Gemini:", e);
      }
    }
  }
}
