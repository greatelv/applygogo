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
