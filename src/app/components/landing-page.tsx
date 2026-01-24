import {
  ArrowRight,
  Check,
  Sparkles,
  FileText,
  Download,
  Languages,
  Building2,
  Globe,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { SiteFooter } from "./site-footer";
import dynamic from "next/dynamic";

const TemplatePreviewDialog = dynamic(
  () =>
    import("./template-preview-dialog").then(
      (mod) => mod.TemplatePreviewDialog,
    ),
  { ssr: false },
);
import { PLAN_PRODUCTS } from "@/lib/constants/plans";
import { BetaBanner } from "./beta-banner";

interface LandingPageProps {
  onGetStarted: () => void;
  isLoading?: boolean;
}

import { useTranslations, useLocale } from "next-intl";

import { PublicHeader } from "./header";

import { LandingSurveyModal } from "./landing-survey-modal";

export function LandingPage({
  onGetStarted,
  isLoading = false,
}: LandingPageProps) {
  const t = useTranslations("landing");
  const tc = useTranslations("common");

  const locale = useLocale();
  const isGlobal = locale !== "ko";

  return (
    <div className="min-h-screen bg-background">
      <LandingSurveyModal locale={locale} />
      <BetaBanner />
      <PublicHeader onGetStarted={onGetStarted} isLoading={isLoading} />

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted mb-6">
              <Globe className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t("hero.badge")}
              </span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              {t("hero.title1")}
              <br />
              <span className="text-muted-foreground">{t("hero.title2")}</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t.rich("hero.description", {
                strong: (chunks) => <strong>{chunks}</strong>,
                br: () => <br />,
              })}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={onGetStarted}
                size="lg"
                isLoading={isLoading}
                className="w-full sm:w-auto"
              >
                {t("hero.cta")}
                <ArrowRight className="size-4" />
              </Button>
              <TemplatePreviewDialog
                onSelectTemplate={() => onGetStarted()}
                trigger={
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {t("hero.viewSample")}
                  </Button>
                }
              />
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              {t("hero.subText")}
            </p>
          </div>
        </div>
      </section>

      {/* Pain Point Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">
              {t.rich("pain.title", {
                br: () => <br />,
              })}
            </h2>
            <p className="text-muted-foreground mt-4">{t("pain.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Problem Card */}
            <div className="bg-card border border-border/50 p-8 rounded-2xl opacity-70 grayscale-[0.5]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <X className="size-6 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold">
                  {t("pain.problem.title")}
                </h3>
              </div>
              <p className="text-muted-foreground">{t("pain.problem.desc")}</p>
            </div>
            {/* Solution Card */}
            <div className="bg-background border-2 border-primary/20 p-8 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="size-24 text-primary" />
              </div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Check className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary">
                  {t("pain.solution.title")}
                </h3>
              </div>
              <p className="text-foreground font-medium relative z-10">
                {t("pain.solution.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section (Replaces Cost Hook) */}
      <section className="py-20 bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              {t("comparison.title")}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t("comparison.subtitle")}
            </p>
          </div>

          <div className="bg-muted/20 rounded-3xl p-6 md:p-10 border border-border shadow-sm">
            <div className="grid grid-cols-3 gap-4 mb-6 text-center text-sm font-semibold tracking-wide">
              <div></div>
              <div className="pb-2 text-muted-foreground">
                {t("comparison.agencies")}
              </div>
              <div className="pb-2 text-primary text-base">
                {t("comparison.us")}
              </div>
            </div>
            {/* Rows */}
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="grid grid-cols-3 gap-4 py-6 border-t border-border/50 items-center relative"
              >
                <div className="text-sm font-medium text-muted-foreground pl-2">
                  {t(`comparison.rows.${i}.label`)}
                </div>
                <div className="text-center text-sm opacity-70">
                  {t(`comparison.rows.${i}.bad`)}
                </div>
                <div className="text-center font-bold text-primary flex items-center justify-center gap-2 text-lg">
                  {t(`comparison.rows.${i}.good`)}
                  {i === 1 && (
                    <Zap className="size-4 text-amber-500 fill-amber-500" />
                  )}
                </div>
                {/* Highlight background for ApplyGogo column */}
                <div className="absolute top-2 bottom-2 right-0 w-1/3 bg-primary/5 -z-10 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl tracking-tight mb-4">
              {t("features.title")}
            </h3>
            <p className="text-muted-foreground">{t("features.subtitle")}</p>
          </div>

          <ul className="grid md:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="inline-flex items-center justify-center size-12 rounded-lg bg-primary/10 mb-4">
                  {i === 0 && <Sparkles className="size-6 text-primary" />}
                  {i === 1 && <Globe className="size-6 text-primary" />}
                  {i === 2 && <Download className="size-6 text-primary" />}
                </div>
                <h4 className="text-lg font-semibold mb-2">
                  {t(`features.items.${i}.title`)}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {t(`features.items.${i}.description`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl tracking-tight mb-4">{t("steps.title")}</h3>
            <p className="text-muted-foreground">{t("steps.subtitle")}</p>
          </div>

          <ol className="grid md:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <li key={i} className="text-center">
                <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary text-primary-foreground mb-4 text-xl font-bold">
                  {i + 1}
                </div>
                <h4 className="text-lg font-semibold mb-2">
                  {t(`steps.items.${i}.title`)}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {t(`steps.items.${i}.description`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Recommended For */}
      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl tracking-tight mb-6 leading-tight">
                {t("recommended.title1")}
                <br />
                {t("recommended.title2")}
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Globe className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">
                      {t("recommended.item1Title")}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {t.rich("recommended.item1Description", {
                        strong: (chunks) => <strong>{chunks}</strong>,
                        br: () => <br />,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <Sparkles className="size-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">
                      {t("recommended.item2Title")}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {t.rich("recommended.item2Description", {
                        strong: (chunks) => <strong>{chunks}</strong>,
                        br: () => <br />,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <FileText className="size-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">
                      {t("recommended.item3Title")}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {t.rich("recommended.item3Description", {
                        strong: (chunks) => <strong>{chunks}</strong>,
                        br: () => <br />,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted/50 rounded-2xl p-8 border border-border">
              {/* Abstract Visual Representation */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border shadow-sm">
                  <div className="size-8 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                </div>
                <div className="flex justify-center text-muted-foreground">
                  <ArrowRight className="size-5 rotate-90 my-2" />
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-primary/20 shadow-sm ring-1 ring-primary/10">
                  <div className="size-8 rounded bg-primary/10 flex items-center justify-center">
                    <Check className="size-4 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">
                      Professional English Resume
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Perfectly formatted & translated
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-4">
            <h3 className="text-3xl tracking-tight font-bold">
              {t("pricing.title")}
            </h3>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 text-foreground text-sm font-medium">
              <span>🎉</span>
              <span>{t("pricing.offer")}</span>
            </div>
            <p className="text-muted-foreground">{t("pricing.subtitle")}</p>
          </div>

          <ul className="grid md:grid-cols-3 gap-6">
            {/* 무료 체험 */}
            <li className="bg-card border border-border rounded-lg p-6 text-center flex flex-col h-full">
              <h4 className="text-lg font-semibold mb-2">
                {t("pricing.free.title")}
              </h4>
              <div className="flex flex-col items-center justify-center mb-4">
                <span className="text-lg font-medium text-transparent mb-1 min-h-[28px]">
                  Placeholder
                </span>
                <div className="text-4xl font-bold">{tc("currency")}0</div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {t("pricing.free.subtitle")}
              </p>
              <ul className="space-y-2.5 mb-6 text-sm text-muted-foreground text-left flex-1">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  <span>
                    {t.rich("pricing.free.credits", {
                      strong: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  {t("pricing.free.template")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  {t("pricing.free.retranslate")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  {t("pricing.free.period")}
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full mt-auto"
                onClick={onGetStarted}
                isLoading={isLoading}
              >
                {t("hero.cta")}
              </Button>
            </li>

            {/* 7일 이용권 */}
            <li className="bg-card border border-border rounded-lg p-6 text-center flex flex-col h-full">
              <h4 className="text-lg font-semibold mb-2">
                {tc("plan.PASS_7DAY")}
              </h4>
              <div className="flex flex-col items-center justify-center mb-4">
                <span className="text-lg font-medium text-muted-foreground/60 line-through mb-1 min-h-[28px]">
                  {tc("currency")}
                  {isGlobal
                    ? PLAN_PRODUCTS.PASS_7DAY.originalPriceGlobal
                    : PLAN_PRODUCTS.PASS_7DAY.originalPrice?.toLocaleString()}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold">
                    {tc("currency")}
                    {isGlobal
                      ? PLAN_PRODUCTS.PASS_7DAY.priceGlobal
                      : PLAN_PRODUCTS.PASS_7DAY.price.toLocaleString()}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-sm px-2 py-0.5 text-foreground border-foreground/10 bg-foreground/5"
                  >
                    50% OFF
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {t("pricing.free.subtitle")}
              </p>
              <ul className="space-y-2.5 mb-6 text-sm text-muted-foreground text-left flex-1">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  <span>
                    {t.rich("pricing.features.credits", {
                      count: PLAN_PRODUCTS.PASS_7DAY.credits,
                      strong: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  {t("pricing.features.template")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  {t("pricing.features.retranslate")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  {t("pricing.features.period7")}
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full mt-auto"
                onClick={onGetStarted}
                isLoading={isLoading}
              >
                {t("header.getStarted")}
              </Button>
            </li>

            {/* 30일 이용권 (추천) */}
            <li className="bg-card border border-primary rounded-lg p-6 text-center shadow-lg relative ring-1 ring-primary/20 flex flex-col h-full">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium">
                {t("pricing.recommend")}
              </div>
              <h4 className="text-lg font-semibold mb-2">
                {tc("plan.PASS_30DAY")}
              </h4>
              <div className="flex flex-col items-center justify-center mb-4">
                <span className="text-lg font-medium text-muted-foreground/60 line-through mb-1 min-h-[28px]">
                  {tc("currency")}
                  {isGlobal
                    ? PLAN_PRODUCTS.PASS_30DAY.originalPriceGlobal
                    : PLAN_PRODUCTS.PASS_30DAY.originalPrice?.toLocaleString()}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-primary">
                    {tc("currency")}
                    {isGlobal
                      ? PLAN_PRODUCTS.PASS_30DAY.priceGlobal
                      : PLAN_PRODUCTS.PASS_30DAY.price.toLocaleString()}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-sm px-2 py-0.5 text-foreground border-foreground/10 bg-foreground/5"
                  >
                    57% OFF
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {t("pricing.free.subtitle")}
              </p>
              <ul className="space-y-2.5 mb-6 text-sm text-muted-foreground text-left flex-1">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  <span>
                    {t.rich("pricing.features.credits", {
                      count: PLAN_PRODUCTS.PASS_30DAY.credits,
                      strong: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  {t("pricing.features.template")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  {t("pricing.features.retranslate")}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  {t("pricing.features.period30")}
                </li>
              </ul>
              <Button
                className="w-full mt-auto"
                onClick={onGetStarted}
                isLoading={isLoading}
              >
                {t("header.getStarted")}
              </Button>
            </li>
          </ul>
          <p className="text-center text-sm text-muted-foreground mt-8">
            {t("pricing.footer")}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl tracking-tight mb-4">{t("faq.title")}</h3>
            <p className="text-muted-foreground">{t("faq.subtitle")}</p>
          </div>

          <div className="space-y-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-border p-6 bg-card"
              >
                <h4 className="font-semibold mb-2">{t(`faq.items.${i}.q`)}</h4>
                <p className="text-sm text-muted-foreground">
                  {t(`faq.items.${i}.a`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl tracking-tight mb-4">{t("cta.title")}</h3>
          <p className="text-muted-foreground mb-8">{t("cta.subtitle")}</p>
          <Button onClick={onGetStarted} size="lg" isLoading={isLoading}>
            {t("cta.button")}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
