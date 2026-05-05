import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Languages } from "lucide-react";

interface Props {
  requestedLocale: string;
  articleLocale: string;
}

export async function CrossLocaleFallbackBanner({
  requestedLocale,
  articleLocale,
}: Props) {
  const t = await getTranslations("blog.fallbackBanner");
  const articleLanguageLabel = t(`languageName.${articleLocale}` as any);

  return (
    <div className="border-b border-border bg-muted/40">
      <div className="container mx-auto px-6 py-3 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 flex-shrink-0" />
            <span>
              {t("message", { language: articleLanguageLabel })}
            </span>
          </div>
          <Link
            href="/blog"
            className="text-foreground underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            {t("browseAll")}
          </Link>
        </div>
      </div>
    </div>
  );
}
