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
  // Korean users see English (_target)
  // Global users (en/ja) see Korean (_source)
  return locale === "ko";
}

/**
 * Gets the appropriate field value based on locale
 * @param sourceValue - The source language value (usually Korean for ko locale, English/Japanese for en/ja locale)
 * @param targetValue - The target language value (usually English for ko locale, Korean for en/ja locale)
 * @param locale - The application locale
 * @returns The appropriate value based on locale
 */
export function getLocalizedValue<T>(
  sourceValue: T,
  targetValue: T,
  locale: AppLocale,
): T {
  return shouldUseTargetData(locale) ? targetValue : sourceValue;
}

/**
 * Gets the display language name for the resume
 * @param locale - The application locale
 * @returns The language name to display
 */
export function getResumeLanguageName(locale: AppLocale): string {
  return shouldUseTargetData(locale) ? "English" : "Korean";
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
  // If viewing English resume (ko locale), show English titles
  // If viewing Korean resume (en/ja locale), show Korean titles
  return shouldUseTargetData(locale) ? enTitle : koTitle;
}
