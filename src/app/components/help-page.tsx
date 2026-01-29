"use client";

import { useState } from "react";
import { CircleHelp, ChevronDown, Mail } from "lucide-react";
import { cn } from "../lib/utils";
import { PLAN_PRODUCTS } from "@/lib/constants/plans";
import { useTranslations, useLocale } from "next-intl";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const CATEGORY_KEYS = [
  "all",
  "gettingStarted",
  "features",
  "payment",
  "security",
];

export function HelpPage() {
  const t = useTranslations("helpPage");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isGlobal = locale !== "ko";

  const [activeCategory, setActiveCategory] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const normalPrice = isGlobal
    ? PLAN_PRODUCTS.PASS_30DAY.originalPriceGlobal
    : PLAN_PRODUCTS.PASS_30DAY.price * 2;
  const launchPrice = isGlobal
    ? PLAN_PRODUCTS.PASS_30DAY.priceGlobal
    : PLAN_PRODUCTS.PASS_30DAY.price;
  const currency = tCommon("currency");

  const faqItemsRaw = t.raw("faq.items") as any[];
  const faqs: FAQItem[] = faqItemsRaw.map((item, index) => ({
    ...item,
    answer: t(`faq.items.${index}.answer`, {
      normalPrice: `${currency}${normalPrice.toLocaleString()}`,
      launchPrice: `${currency}${launchPrice.toLocaleString()}`,
      credits: PLAN_PRODUCTS.PASS_30DAY.credits,
    }),
  }));

  const filteredFaqs =
    activeCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
          <CircleHelp className="size-8 text-primary" />
        </div>
        <h1 className="text-3xl mb-3">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* FAQ Section */}
      <div id="faq">
        <h2 className="text-2xl font-semibold mb-6">{t("faq.title")}</h2>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORY_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                activeCategory === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {t(`faq.categories.${key}`)}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <span className="text-xs text-primary font-medium">
                    {t(`faq.categories.${faq.category}`)}
                  </span>
                  <p className="font-medium mt-1">{faq.question}</p>
                </div>
                <ChevronDown
                  className={cn(
                    "size-5 text-muted-foreground transition-transform flex-shrink-0 ml-4",
                    openId === faq.id && "rotate-180",
                  )}
                />
              </button>

              {openId === faq.id && (
                <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div
        id="contact"
        className="mt-16 bg-card border border-border rounded-lg p-8 text-center"
      >
        <Mail className="size-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t("contact.title")}</h3>
        <p className="text-muted-foreground mb-6">{t("contact.description")}</p>
        <a
          href="mailto:patakeique@gmail.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Mail className="size-4" />
          {t("contact.button")}
        </a>
      </div>
    </div>
  );
}
