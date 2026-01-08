import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

// Export configured model for multimodal use (PDF analysis)
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite", // Explicit version (DO NOT CHANGE)
});

// Retry helper function
export async function generateContentWithRetry(
  model: any,
  content: any,
  maxRetries = 2,
  initialDelay = 5000 // Increase delay to 5s
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
당신은 이력서 분석 전문가입니다. 주어진 이력서 PDF에서 정보를 정확하게 추출하고 전문적으로 번역해주세요.

**추출 지침:**
1. **중복 제거**: PDF 내에서 요약부와 상세 내용 등 같은 정보가 반복될 경우, 이를 하나로 합쳐 유니크하게 추출하세요.
2. **경력 그룹화**: **동일한 회사의 경력은 하나의 항목으로 통합**하세요. 직무가 바뀌었더라도 같은 회사라면 한 항목에 넣고, 수행 업무(bullets)에서 이를 구분하여 기술하세요.
3. **학력 유니크화**: 졸업 여부나 전공이 같다면 중복된 학력 항목은 하나로 정리하세요.
4. **최근 이력순 나열**: **모든 경력사항(\`work_experiences\`)과 학력사항(\`educations\`)은 가장 최신 항목이 위로 오도록(역연대순, Reverse Chronological Order) 정렬**하여 배열로 만드세요.

**상세 필드 구성:**
1. **개인 정보 (personal_info)**:
   - name_kr: 이름 (한글)
   - name_en: 이름 (영문 번역)
   - email: 이메일
   - phone: 전화번호
   - links: 주요 링크 (GitHub, LinkedIn 등)를 [{ "label": "...", "url": "..." }] 형식으로 추출

2. **경력사항 (work_experiences)**: **회사별로 그룹화 및 최신순 정렬**
   - company_name_kr: 회사명 (한글)
   - company_name_en: 회사명 (영문 번역)
   - role_kr: 주요 직무/직책 (한글)
   - role_en: 주요 직무/직책 (영문 번역)
   - start_date: 시작일 (YYYY-MM 형식)
   - end_date: 종료일 (YYYY-MM 형식, 재직중이면 "현재")
   - bullets_kr: 해당 회사의 모든 업무 성과 및 내용 (한글, 배열)
   - bullets_en: 해당 회사의 모든 업무 성과 및 내용 (영문 번역, 배열)

3. **학력사항 (educations)**: **최신순 정렬**된 유니크한 학력 정보
   - school_name: 학교명 (한글)
   - school_name_en: 학교명 (영문 번역)
   - major: 전공 (한글)
   - major_en: 전공 (영문 번역)
   - degree: 학위 (한글)
   - degree_en: 학위 (Bachelor/Master/PhD 등, 영문 번역)
   - start_date: 입학일 (YYYY-MM)
   - end_date: 졸업일 (YYYY-MM)

4. **기술 스택 (skills)**: 핵심 기술 위주 최대 10개 (이름만 추출)

**응답 형식:**
\`\`\`json
{
  "personal_info": { ... },
  "work_experiences": [...],
  "educations": [...],
  "skills": [...]
}
\`\`\`

**주의:** 번역은 전문적인 비즈니스 용어를 사용하고, 날짜 규격을 엄격히 준수하세요.
`;
