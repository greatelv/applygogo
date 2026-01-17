import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

// 지원하는 로케일
export const locales = ["ko", "en", "ja"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // 지원하지 않는 로케일은 404
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
