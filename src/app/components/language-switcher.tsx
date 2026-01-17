"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";

const LANGUAGES = [
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
] as const;

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (locale: string) => {
    // 현재 경로에서 locale 추출
    const segments = pathname.split("/").filter(Boolean);
    const currentLocale = ["en", "ja"].includes(segments[0])
      ? segments[0]
      : "ko";

    if (locale === "ko") {
      // 한국어는 기본 경로 (/)
      if (currentLocale === "ko") {
        // 이미 한국어면 아무것도 안 함
        return;
      }
      // /en/... 또는 /ja/... → /...
      const newPath = "/" + segments.slice(1).join("/");
      router.push(newPath || "/");
    } else {
      // 영어/일본어는 /[locale] 경로
      if (currentLocale === "ko") {
        // / → /en 또는 /ja
        router.push(`/${locale}${pathname}`);
      } else {
        // /en/... → /ja/... 또는 그 반대
        const newPath = "/" + locale + "/" + segments.slice(1).join("/");
        router.push(newPath);
      }
    }
  };

  // 현재 locale 감지
  const segments = pathname.split("/").filter(Boolean);
  const currentLocale = ["en", "ja"].includes(segments[0]) ? segments[0] : "ko";
  const currentLanguage = LANGUAGES.find((lang) => lang.code === currentLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span>{currentLanguage?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={currentLocale === lang.code ? "bg-accent" : ""}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
