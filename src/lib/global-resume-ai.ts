import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateContentWithRetry, extractionModel } from "./gemini";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ============================================================================
// Stage 1: 추출 (Extract) - PDF에서 구조화된 데이터 추출 + 언어 감지
// ============================================================================

export interface ExtractedResumeData {
  detectedLanguage: "en" | "ja";
  confidence: number;
  personalInfo: {
    name: string;
    email?: string;
    phone?: string;
    links?: {
      linkedin?: string;
      github?: string;
      portfolio?: string;
    };
  };
  summary?: string;
  workExperiences: Array<{
    company_name: string;
    role: string;
    start_date: string;
    end_date: string;
    bullets: string[];
  }>;
  educations: Array<{
    school_name: string;
    major: string;
    degree: string;
    start_date: string;
    end_date: string;
  }>;
  skills: Array<{
    name: string;
    level?: string;
  }>;
  additionalItems: Array<{
    type: "CERTIFICATION" | "AWARD" | "LANGUAGE" | "ACTIVITY" | "OTHER";
    name: string;
    description?: string;
    date?: string;
  }>;
}

export async function extractResumeData(
  pdfUrl: string,
  expectedLocale: "en" | "ja",
): Promise<ExtractedResumeData> {
  const prompt = `
You are a professional resume parser specializing in multilingual resumes.

TASK: Extract structured data from this resume PDF and detect its language.

CRITICAL REQUIREMENTS:
1. **Language Detection**:
   - Identify if the resume is primarily in English or Japanese
   - Return confidence score (0.0 to 1.0)
   - Expected language: ${expectedLocale}

2. **Structure Extraction**:
   - Personal Information (name, email, phone, links)
   - Professional Summary (if exists)
   - Work Experience (company, role, dates, bullet points)
   - Education (school, major, degree, dates)
   - Skills (name, proficiency level if mentioned)
   - Additional Items (certifications, awards, languages, activities)

3. **Data Preservation**:
   - Keep ALL text in original language
   - Preserve exact dates and numbers
   - Maintain bullet point structure

4. **Output Format**:
   Return ONLY valid JSON matching this schema:
   {
     "detectedLanguage": "en" | "ja",
     "confidence": 0.95,
     "personalInfo": {
       "name": "John Doe",
       "email": "john@example.com",
       "phone": "+1-234-567-8900",
       "links": {
         "linkedin": "linkedin.com/in/johndoe",
         "github": "github.com/johndoe",
         "portfolio": "johndoe.com"
       }
     },
     "summary": "Professional summary text...",
     "workExperiences": [
       {
         "company_name": "Company Name",
         "role": "Job Title",
         "start_date": "2020-01",
         "end_date": "2023-12",
         "bullets": [
           "Achievement 1",
           "Achievement 2"
         ]
       }
     ],
     "educations": [
       {
         "school_name": "University Name",
         "major": "Computer Science",
         "degree": "Bachelor of Science",
         "start_date": "2016-09",
         "end_date": "2020-05"
       }
     ],
     "skills": [
       {
         "name": "Python",
         "level": "Advanced"
       }
     ],
     "additionalItems": [
       {
         "type": "CERTIFICATION",
         "name": "AWS Certified Solutions Architect",
         "description": "Professional level certification",
         "date": "2022-06"
       }
     ]
   }

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no explanations.
`;

  try {
    // PDF 파일 가져오기
    const response = await fetch(pdfUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const result = await generateContentWithRetry(extractionModel, [
      prompt,
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64,
        },
      },
    ]);

    const text = result.response.text();

    // JSON 추출 (마크다운 코드 블록 제거)
    const jsonMatch =
      text.match(/```json\n?([\s\S]*?)\n?```/) ||
      text.match(/```\n?([\s\S]*?)\n?```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    const extracted: ExtractedResumeData = JSON.parse(jsonText.trim());

    // 언어 감지 검증
    if (extracted.detectedLanguage !== expectedLocale) {
      console.warn(
        `Language mismatch: expected ${expectedLocale}, detected ${extracted.detectedLanguage}`,
      );
      // 경고만 하고 계속 진행 (사용자가 잘못 선택했을 수 있음)
    }

    if (extracted.confidence < 0.7) {
      console.warn(
        `Low confidence in language detection: ${extracted.confidence}`,
      );
    }

    return extracted;
  } catch (error) {
    console.error("Error extracting resume data:", error);
    throw new Error(`Failed to extract resume data: ${error}`);
  }
}

// ============================================================================
// Stage 2: 번역 (Translate) - 원본 언어 → 한국어 직역
// ============================================================================

export interface TranslatedResumeData {
  personalInfo: {
    name: string;
    email?: string;
    phone?: string;
  };
  summary?: string;
  workExperiences: Array<{
    company_name: string;
    role: string;
    start_date: string;
    end_date: string;
    bullets: string[];
  }>;
  educations: Array<{
    school_name: string;
    major: string;
    degree: string;
    start_date: string;
    end_date: string;
  }>;
  additionalItems: Array<{
    name: string;
    description?: string;
  }>;
}

export async function translateToKorean(
  originalData: ExtractedResumeData,
  sourceLocale: "en" | "ja",
): Promise<TranslatedResumeData> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt =
    sourceLocale === "en"
      ? ENGLISH_TO_KOREAN_TRANSLATION_PROMPT
      : JAPANESE_TO_KOREAN_TRANSLATION_PROMPT;

  try {
    const result = await generateContentWithRetry(model, [
      prompt.replace("{content}", JSON.stringify(originalData, null, 2)),
    ]);

    const text = result.response.text();
    const jsonMatch =
      text.match(/```json\n?([\s\S]*?)\n?```/) ||
      text.match(/```\n?([\s\S]*?)\n?```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    return JSON.parse(jsonText.trim());
  } catch (error) {
    console.error("Error translating resume:", error);
    throw new Error(`Failed to translate resume: ${error}`);
  }
}

const ENGLISH_TO_KOREAN_TRANSLATION_PROMPT = `
You are a professional resume translator specializing in English to Korean translation.

TASK: Translate this English resume to Korean (direct translation, not cultural adaptation yet).

REQUIREMENTS:
1. **Direct Translation**:
   - Translate all text to Korean
   - Maintain professional tone
   - Preserve all numbers and dates exactly
   - Keep technical terms in English if commonly used in Korea (e.g., "Python", "AWS")

2. **Name Handling**:
   - Keep English names as-is (do NOT transliterate to Korean)
   - Example: "John Doe" stays "John Doe", not "존 도"

3. **Company/School Names**:
   - Keep well-known international companies in English (e.g., "Google", "Microsoft")
   - Translate generic terms (e.g., "University" → "대학교")

4. **Output Format**:
   Return ONLY valid JSON matching this schema:
   {
     "personalInfo": {
       "name": "John Doe",
       "email": "john@example.com",
       "phone": "+1-234-567-8900"
     },
     "summary": "전문적인 요약 텍스트...",
     "workExperiences": [
       {
         "company_name": "회사명",
         "role": "직책",
         "start_date": "2020-01",
         "end_date": "2023-12",
         "bullets": [
           "성과 1",
           "성과 2"
         ]
       }
     ],
     "educations": [
       {
         "school_name": "대학교 이름",
         "major": "컴퓨터 과학",
         "degree": "학사",
         "start_date": "2016-09",
         "end_date": "2020-05"
       }
     ],
     "additionalItems": [
       {
         "name": "자격증 이름",
         "description": "설명"
       }
     ]
   }

Source Resume Data:
{content}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no explanations.
`;

const JAPANESE_TO_KOREAN_TRANSLATION_PROMPT = `
일본어 이력서를 한국어로 번역하는 전문 번역가입니다.

작업: 일본어 이력서를 한국어로 직역합니다 (문화적 적응은 다음 단계에서).

요구사항:
1. **직역**:
   - 모든 텍스트를 한국어로 번역
   - 전문적인 톤 유지
   - 숫자와 날짜는 정확히 보존
   - 기술 용어는 한국에서 일반적으로 사용되는 경우 영어 유지 (예: "Python", "AWS")

2. **이름 처리**:
   - 일본 이름은 한국어 발음으로 표기 (예: "田中太郎" → "다나카 타로")

3. **회사/학교명**:
   - 유명한 국제 기업은 영어 유지 (예: "Google", "Microsoft")
   - 일본 고유 기업은 한국어 발음 (예: "トヨタ" → "도요타")

4. **출력 형식**:
   다음 스키마와 일치하는 유효한 JSON만 반환:
   {
     "personalInfo": {
       "name": "다나카 타로",
       "email": "tanaka@example.com",
       "phone": "+81-90-1234-5678"
     },
     "summary": "전문적인 요약 텍스트...",
     "workExperiences": [...],
     "educations": [...],
     "additionalItems": [...]
   }

원본 이력서 데이터:
{content}

중요: JSON 객체만 반환하고, 마크다운 형식이나 설명은 포함하지 마세요.
`;

// ============================================================================
// Stage 3: 정제 (Refine) - 한국 기업 문화에 맞게 톤 조정
// ============================================================================

export interface RefinedResumeData extends TranslatedResumeData {
  // 동일한 구조, 하지만 톤이 조정됨
}

export async function refineForKoreanCulture(
  translatedData: TranslatedResumeData,
): Promise<RefinedResumeData> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are a Korean resume expert specializing in adapting foreign resumes for Korean corporate culture.

TASK: Refine this Korean-translated resume to match Korean corporate culture and expectations.

CRITICAL REQUIREMENTS:

1. **Humble Tone (겸손한 톤)**:
   - Convert assertive statements to humble expressions
   - Examples:
     * "팀을 이끌었습니다" → "팀과 협업하며 프로젝트를 진행했습니다"
     * "매출을 30% 증가시켰습니다" → "매출 30% 증가에 기여했습니다"
     * "개발했습니다" → "개발에 참여했습니다" (unless solo project)

2. **Team Focus (팀 중심)**:
   - Emphasize collaboration over individual achievement
   - Add "팀원들과 함께", "협업하여", "기여했습니다" where appropriate

3. **Formal Language (존댓말)**:
   - Use formal Korean business language
   - All sentences should end with "~습니다/~했습니다"
   - Avoid casual language

4. **Quantifiable Results (구체적 성과)**:
   - Keep all numbers and percentages
   - Frame as contributions, not personal achievements
   - Example: "프로젝트 성공에 기여하여 매출 30% 증가 달성"

5. **Cultural Context**:
   - Add brief context for foreign companies/universities if needed
   - Example: "Google (글로벌 IT 기업)"
   - But keep it concise

6. **Bullet Point Style**:
   - Start with action verbs in past tense
   - Include specific metrics when available
   - Keep each bullet concise (1-2 lines max)

Input (Translated Resume):
${JSON.stringify(translatedData, null, 2)}

Output Format:
Return ONLY valid JSON with the same structure, but with refined Korean text.

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no explanations.
`;

  try {
    const result = await generateContentWithRetry(model, [prompt]);

    const text = result.response.text();
    const jsonMatch =
      text.match(/```json\n?([\s\S]*?)\n?```/) ||
      text.match(/```\n?([\s\S]*?)\n?```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    return JSON.parse(jsonText.trim());
  } catch (error) {
    console.error("Error refining resume:", error);
    throw new Error(`Failed to refine resume: ${error}`);
  }
}
