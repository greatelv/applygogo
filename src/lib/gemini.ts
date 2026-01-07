import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

// Export configured model for multimodal use (PDF analysis)
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite", // More stable than 2.5-flash
});

// Retry helper function
export async function generateContentWithRetry(
  model: any,
  content: any,
  maxRetries = 2,
  initialDelay = 2000
) {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(content);
      return result;
    } catch (error: any) {
      lastError = error;

      // Check if it's a retryable error (429, 503, 500)
      const isRetryable =
        error.status === 429 ||
        error.status === 503 ||
        error.status === 500 ||
        error.message?.includes("overloaded") ||
        error.message?.includes("quota");

      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff: 2s, 4s, 8s
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(
        `Gemini API error (attempt ${
          attempt + 1
        }/${maxRetries}), retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export const RESUME_ANALYSIS_PROMPT = `
당신은 이력서 분석 전문가입니다. 주어진 이력서 PDF에서 **모든 경력사항을 있는 그대로 추출하고 번역**해주세요.

**중요: 중복 제거나 선택은 하지 마세요. 모든 경력을 추출하세요.**

1. **경력사항 (work_experiences)**: PDF에 나타난 모든 경력마다 다음 정보 포함
   - company_name_kr: 회사명 (한글, PDF에 표기된 그대로)
   - company_name_en: 회사명 (영문 번역)
   - role_kr: 직무/직책 (한글)
   - role_en: 직무/직책 (영문 번역)
   - start_date: 시작일 (YYYY-MM 형식)
   - end_date: 종료일 (YYYY-MM 형식, 재직중이면 "현재")
   - bullets_kr: 해당 경력의 모든 업무 및 성과 (한글, 배열)
   - bullets_en: 해당 경력의 모든 업무 및 성과 (영문 번역, 배열)

2. **학력사항 (educations)**: 각 학력마다 다음 정보 포함
   - school_name: 학교명
   - major: 전공
   - degree: 학위 (학사/석사/박사 등)
   - start_date: 입학일 (YYYY-MM)
   - end_date: 졸업일 (YYYY-MM)

3. **기술 스택 (skills)**: 각 기술마다 다음 정보 포함
   - name: 기술명
   - level: 숙련도 (초급/중급/고급/전문가)

**응답 형식:**
\`\`\`json
{
  "work_experiences": [...],
  "educations": [...],
  "skills": [...]
}
\`\`\`

**주의사항:**
- 같은 회사가 여러 번 나와도 괜찮습니다 - 모두 추출하세요
- 날짜는 YYYY-MM 형식으로
- 영문 번역은 자연스럽고 전문적으로
- 각 불릿은 한 문장으로 간결하게
`;
