"use client";

import { useTranslations, useMessages } from "next-intl";
import { PublicHeader } from "@/app/components/header";
import { SiteFooter } from "@/app/components/site-footer";

export default function TermsPage() {
  const t = useTranslations("terms");
  const messages = useMessages() as any;
  const sections = messages.terms?.sections || [];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          {sections.map((section: any, index: number) => {
            const hasItems = section.items && section.items.length > 0;
            const hasContent = !!section.content;

            return (
              <section key={index}>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  {t(`sections.${index}.title`)}
                </h2>

                {hasContent && <p>{t(`sections.${index}.content`)}</p>}

                {hasItems && (
                  <ul
                    className={`list-disc pl-5 space-y-1 ${hasContent ? "mt-2" : ""}`}
                  >
                    {section.items.map((_: any, itemIndex: number) => (
                      <li key={itemIndex}>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: t.raw(
                              `sections.${index}.items.${itemIndex}`,
                            ),
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}

          <hr className="my-8 border-border" />

          <div className="text-sm pb-12">
            <p>{t("footer.date")}</p>
            <p>{t("footer.enforceDate")}</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
