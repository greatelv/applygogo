"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Languages } from "lucide-react";

const ALL_LOCALES = ["ko", "en", "ja"] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [available, setAvailable] = useState<string[] | null>(null);

  const blogSlug = (() => {
    const m = pathname.match(/^\/blog\/([^/]+)\/?$/);
    return m ? m[1] : null;
  })();

  useEffect(() => {
    if (!blogSlug) {
      setAvailable(null);
      return;
    }
    let aborted = false;
    fetch(`/api/blog-locales/${encodeURIComponent(blogSlug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (aborted || !data) return;
        setAvailable(Array.isArray(data.available) ? data.available : null);
      })
      .catch(() => {});
    return () => {
      aborted = true;
    };
  }, [blogSlug]);

  const handleLocaleChange = (newLocale: string) => {
    if (blogSlug && available && !available.includes(newLocale)) {
      router.replace("/blog", { locale: newLocale as any });
      return;
    }
    router.replace(pathname, { locale: newLocale as any });
  };

  const languages = [
    { code: "ko", label: "한국어" },
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9">
          <Languages className="size-4" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => {
          const unavailableHere =
            !!blogSlug && !!available && !available.includes(lang.code);
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLocaleChange(lang.code)}
              className={locale === lang.code ? "bg-accent font-bold" : ""}
            >
              <span>{lang.label}</span>
              {unavailableHere && (
                <span className="ml-2 text-xs text-muted-foreground">
                  → /blog
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
