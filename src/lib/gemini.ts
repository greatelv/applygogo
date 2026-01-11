import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

// ============================================================================
// 3단계 AI 프로세싱 - 단계별 모델 설정
// ============================================================================

// 1단계: 추출 (Extraction) - gemini-2.5-flash
// PDF 멀티모달 처리, 정확한 OCR, 로고 vs 본문 구분 필요
export const extractionModel = genAI.getGenerativeModel({
  model: "gemini-3-pro-preview",
});

// 2단계: 정제 (Refinement) - gemini-2.5-flash
// 단순 텍스트 처리, 불릿 선별/압축
export const refinementModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

// 3단계: 번역 (Translation) - gemini-2.5-flash-lite
// 한글 → 영문 번역, Action Verb 사용
export const translationModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

// ============================================================================
// 레거시 호환성 (기존 코드에서 사용 중인 경우)
// ============================================================================
export const geminiModel = extractionModel;

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

      // Exponential backoff: 5s, 10s, 20s
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
