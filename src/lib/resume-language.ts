/**
 * Resume Language Utility
 *
 * Business Logic:
 * - Korean users (app_locale: "ko") → View English resume (_target data)
 * - Global users (app_locale: "en" or "ja") → View Korean resume (_source data)
 *
 * This is because:
 * - Korean users want to convert their Korean resume to English for global opportunities
 * - Global users want to convert their English/Japanese resume to Korean for Korean job market
 */

export type AppLocale = "ko" | "en" | "ja";

/**
 * Determines whether to use source or target data based on app locale
 * @param locale - The application locale
 * @returns true if should use target data (English), false if should use source data (Korean)
 */
export function shouldUseTargetData(locale: AppLocale): boolean {
  // In the converted resume view/PDF, we ALWAYS want to prioritize the target data
  // Ko user -> Target is English
  // Global user -> Target is Korean
  return true;
}

/**
 * Determines if the output language should be Korean
 * @param locale - The application locale
 * @returns true if output should be Korean (for en/ja users), false if English (for ko users)
 */
export function isOutputKorean(locale: AppLocale): boolean {
  return ["en", "ja"].includes(locale);
}

/**
 * Gets the appropriate field value based on locale with fallback
 * @param sourceValue - The source language value
 * @param targetValue - The target language value
 * @param locale - The application locale
 * @returns The appropriate value based on locale
 */
export function getLocalizedValue<T>(
  sourceValue: T,
  targetValue: T,
  locale: AppLocale,
): T {
  // Always prioritize target data, but fallback to source if target is missing
  // Note: specific fallback logic for strings should be handled by caller or specific string helper
  return shouldUseTargetData(locale) ? targetValue : sourceValue;
}

/**
 * Gets the display language name for the resume
 * @param locale - The application locale
 * @returns The language name to display
 */
export function getResumeLanguageName(locale: AppLocale): string {
  return isOutputKorean(locale) ? "Korean" : "English";
}

/**
 * Gets the section title based on locale
 * @param koTitle - Korean title
 * @param enTitle - English title
 * @param locale - The application locale
 * @returns The appropriate title
 */
export function getSectionTitle(
  koTitle: string,
  enTitle: string,
  locale: AppLocale,
): string {
  // If output is Korean (en/ja locale), show Korean titles
  // If output is English (ko locale), show English titles
  return isOutputKorean(locale) ? koTitle : enTitle;
}
