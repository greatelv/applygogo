import { generateContentWithRetry, geminiModel } from "./gemini";

export interface GeneratedResumeData {
  title: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  workExperience: Array<{
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate: string | "Present";
    highlights: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    major?: string;
    location?: string;
    startDate?: string;
    endDate: string;
  }>;
  skills: Array<{
    category?: string;
    items: string[];
  }>;
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    link?: string;
  }>;
}

export async function generateGlobalResume(
  pdfBuffer: Buffer,
  targetLocale: "en" | "ja",
): Promise<GeneratedResumeData> {
  const targetLanguage = targetLocale === "en" ? "English" : "Japanese";
  const targetContext =
    targetLocale === "en"
      ? "Western tech companies (US/Europe)"
      : "Japanese corporate environment";

  const prompt = `
    You are an expert Resume Consultant specializing in transforming Korean resumes into professional ${targetLanguage} resumes for ${targetContext}.

    TASK:
    Analyze the provided Korean resume PDF and restructure it into a high-quality ${targetLanguage} resume in JSON format.
    
    GUIDELINES:
    1. **Language & Tone**: 
       - Translate all content into natural, professional ${targetLanguage}.
       - ${
         targetLocale === "en"
           ? "Use strong Action Verbs (e.g., Led, Developed, Optimized). Avoid passive voice."
           : "Use appropriate Keigo (Honorifics) and professional business Japanese terminology."
       }
    
    2. **Content Enhancement**:
       - Focus on **Achievements** rather than just duties.
       - Quantify results (numbers, %, $) where possible.
       - If dates are not clear, deduce from context or use placeholder "YYYY-MM".
    
    3. **Structure**:
       - **Summary**: Create a compelling 2-3 sentence professional summary.
       - **Work Experience**: Group bullet points logically.
       - **Skills**: Categorize skills (e.g., Languages, Frameworks, Tools).
    
    OUTPUT SCHEMA (JSON Only):
    {
      "title": "Suggested Resume Title (e.g., Senior Software Engineer)",
      "personalInfo": {
        "name": "Full Name (Romanized if English)",
        "email": "Email",
        "phone": "Phone",
        "location": "City, Country",
        "linkedin": "URL",
        "website": "URL"
      },
      "summary": "Professional Summary...",
      "workExperience": [
        {
          "company": "Company Name",
          "position": "Job Title",
          "location": "City, Country",
          "startDate": "YYYY-MM",
          "endDate": "YYYY-MM or Present",
          "highlights": [
            "Achievement 1...",
            "Achievement 2..."
          ]
        }
      ],
      "education": [
        {
          "school": "School Name",
          "degree": "Degree (e.g., B.S. in Computer Science)",
          "major": "Major",
          "location": "City, Country",
          "startDate": "YYYY-MM",
          "endDate": "YYYY-MM"
        }
      ],
      "skills": [
        {
          "category": "Category Name (e.g., Frontend)",
          "items": ["React", "TypeScript"]
        }
      ],
      "languages": [
        { "language": "Korean", "proficiency": "Native" },
        { "language": "English", "proficiency": "Professional Working" }
      ],
      "projects": [
        {
          "name": "Project Name",
          "description": "Brief description",
          "technologies": ["Tech 1", "Tech 2"]
        }
      ]
    }
    
    IMPORTANT: Return ONLY valid JSON. No markdown code blocks, no explanations.
  `;

  try {
    const base64Data = pdfBuffer.toString("base64");

    const result = await generateContentWithRetry(geminiModel, [
      prompt,
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Data,
        },
      },
    ]);
    const responseText = result.response.text();

    // Clean up JSON formatting (remove markdown code blocks if present)
    const jsonMatch =
      responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
      responseText.match(/```\n?([\s\S]*?)\n?```/);
    const cleanJson = jsonMatch ? jsonMatch[1] : responseText;

    return JSON.parse(cleanJson.trim()) as GeneratedResumeData;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error(`Failed to generate global resume: ${error}`);
  }
}
