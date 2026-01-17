import koMessages from "../../messages/ko.json";
import enMessages from "../../messages/en.json";
import jaMessages from "../../messages/ja.json";

export type Locale = "ko" | "en" | "ja";

const messages: Record<Locale, any> = {
  ko: koMessages,
  en: enMessages,
  ja: jaMessages,
};

export function getMessages(locale: Locale) {
  return messages[locale] || messages.ko;
}

export function t(locale: string | undefined, key: string): string {
  const currentLocale = (locale as Locale) || "ko";
  const msgs = getMessages(currentLocale);
  const keys = key.split(".");
  let value: any = msgs;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(
        `Translation key not found: ${key} for locale: ${currentLocale}`,
      );
      return key;
    }
  }

  return typeof value === "string" ? value : key;
}
