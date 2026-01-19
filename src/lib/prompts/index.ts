import { AppLocale } from "./types";
import {
  getExtractionPromptKO,
  getRefinementPromptKO,
  getTranslationPromptKO,
} from "./korea";
import {
  getExtractionPromptGlobal,
  getRefinementPromptGlobal,
  getTranslationPromptGlobal,
} from "./global";

export * from "./types";

/**
 * 전역 추출 프롬프트 호출 함수
 */
export const getExtractionPrompt = (locale: AppLocale) => {
  if (locale === "ko") {
    return getExtractionPromptKO(locale);
  }
  return getExtractionPromptGlobal(locale);
};

/**
 * 전역 정제 프롬프트 호출 함수
 */
export const getRefinementPrompt = (extractedData: any, locale: AppLocale) => {
  if (locale === "ko") {
    return getRefinementPromptKO(extractedData);
  }
  return getRefinementPromptGlobal(extractedData, locale);
};

/**
 * 전역 번역 프롬프트 호출 함수
 */
export const getTranslationPrompt = (refinedData: any, locale: AppLocale) => {
  if (locale === "ko") {
    return getTranslationPromptKO(refinedData);
  }
  return getTranslationPromptGlobal(refinedData, locale);
};
