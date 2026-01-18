import {
  ArrowRight,
  Check,
  Sparkles,
  FileText,
  Globe,
  Download,
  Languages,
} from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { SiteFooter } from "./site-footer";
import { TemplatePreviewDialog } from "./template-preview-dialog";
import { PLAN_PRODUCTS } from "@/lib/constants/plans";
import { BetaBanner } from "./beta-banner";

interface LandingPageProps {
  onGetStarted: () => void;
  isLoading?: boolean;
}

import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";

export function LandingPage({
  onGetStarted,
  isLoading = false,
}: LandingPageProps) {
  const t = useTranslations("landing");
  const tc = useTranslations("common");
  const th = useTranslations("common.header");

  const locale = useLocale();
  const isGlobal = locale !== "ko";

  return (
    <div className="min-h-screen bg-background">
      <BetaBanner />
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <div className="relative h-6 w-24">
                <Image
                  src={
                    isGlobal
                      ? "/global/logo-for-light.svg"
                      : "/logo-for-light.svg"
                  }
                  alt="ApplyGogo"
                  fill
                  className="object-contain dark:hidden"
                  priority
                />
                <Image
                  src={
                    isGlobal
                      ? "/global/logo-for-black.svg"
                      : "/logo-for-dark.svg"
                  }
                  alt="ApplyGogo"
                  fill
                  className="object-contain hidden dark:block"
                  priority
                />
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/blog"
                className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {th("blog")}
              </Link>
              <LanguageSwitcher />
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <Button onClick={onGetStarted} size="sm" isLoading={isLoading}>
                {t("header.getStarted")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted mb-6">
              <Sparkles className="size-4 text-muted-foreground" />
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

      {/* Cost Hook Section */}
      <section className="py-20 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary/5 via-primary/5 to-background rounded-3xl p-8 lg:p-12 overflow-hidden relative border border-primary/10">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-6 text-center lg:text-left">
                <Badge
                  variant="outline"
                  className="bg-background text-primary border-primary/30 px-3 py-1"
                >
                  {t("cost.badge")}
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                  {t("cost.title1")}
                  <br />
                  <span className="text-primary">{t("cost.title2")}</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  {t("cost.description")}
                </p>

                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-3 bg-background/50 rounded-lg p-3 shadow-sm border border-border">
                    <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                      <span className="text-red-600 dark:text-red-400 font-bold text-sm">
                        {t("cost.oldLabel")}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-muted-foreground">
                        {t("cost.oldLabel")} Cost
                      </div>
                      <div className="font-semibold text-sm line-through text-muted-foreground decoration-red-500/50">
                        {t("cost.oldPrice")}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="hidden sm:block size-5 text-muted-foreground self-center" />
                  <div className="flex items-center gap-3 bg-background rounded-lg p-3 shadow-sm border border-primary/20 ring-1 ring-primary/10">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-sm">
                        {t("cost.nowLabel")}
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-muted-foreground">
                        {t("cost.ourName")}
                      </div>
                      <div className="font-bold text-lg text-primary">
                        {PLAN_PRODUCTS.PASS_30DAY.price.toLocaleString()}
                        {tc("currency")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side Visual */}
              <div className="relative mx-auto lg:ml-auto w-full max-w-sm">
                <div className="bg-background rounded-2xl shadow-xl border border-border overflow-hidden transform hover:scale-105 transition-transform duration-500">
                  <div className="p-6 border-b border-border bg-muted/30">
                    <div className="text-sm font-medium text-center text-muted-foreground">
                      {t("cost.compareTitle")}
                    </div>
                  </div>
                  <div className="p-8 space-y-8">
                    {/* Bar 1 */}
                    <div className="space-y-2 opacity-60">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t("cost.otherService")}
                        </span>
                        <span className="font-medium">
                          {t("cost.oldPrice")}+
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gray-400 w-full" />
                      </div>
                    </div>
                    {/* Bar 2 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-base">
                        <span className="font-bold text-primary">
                          {t("cost.ourName")}
                        </span>
                        <span className="font-bold text-primary">
                          {PLAN_PRODUCTS.PASS_30DAY.price.toLocaleString()}
                          {tc("currency")}
                        </span>
                      </div>
                      <div className="h-4 bg-primary/10 rounded-full overflow-hidden relative">
                        <div className="h-full bg-primary w-[10%] rounded-full relative">
                          <div className="absolute -right-1 top-0 bottom-0 w-2 bg-white/50 blur-[2px] animate-pulse" />
                        </div>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-primary font-bold pr-3">
                          {t("cost.saveBadge", { percent: 87 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                <div className="text-4xl font-bold">₩0</div>
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
                  ₩{PLAN_PRODUCTS.PASS_7DAY.originalPrice?.toLocaleString()}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold">
                    ₩{PLAN_PRODUCTS.PASS_7DAY.price.toLocaleString()}
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
                  ₩{PLAN_PRODUCTS.PASS_30DAY.originalPrice?.toLocaleString()}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-primary">
                    ₩{PLAN_PRODUCTS.PASS_30DAY.price.toLocaleString()}
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
