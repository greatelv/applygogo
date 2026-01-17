"use client";

import {
  Rocket,
  ArrowRight,
  Globe,
  CheckCircle2,
  Zap,
  LayoutTemplate,
  Languages,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { SiteFooter } from "@/app/components/site-footer";

export default function IntroductionPage() {
  const t = useTranslations("introduction");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <div className="relative h-6 w-24">
                <Image
                  src="/logo-for-light.svg"
                  alt="지원고고"
                  fill
                  className="object-contain dark:hidden"
                  priority
                />
                <Image
                  src="/logo-for-dark.svg"
                  alt="지원고고"
                  fill
                  className="object-contain hidden dark:block"
                  priority
                />
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/company"
                className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
              >
                {t("header.company")}
              </Link>
              <Link
                href="/blog"
                className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("header.blog")}
              </Link>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <Button asChild size="sm">
                <Link href="/">{t("header.cta")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge
                variant="outline"
                className="bg-background/50 backdrop-blur border-primary/20 text-primary px-4 py-1.5 text-sm"
              >
                <Rocket className="w-3.5 h-3.5 mr-2 inline-block" />
                {t("hero.badge")}
              </Badge>

              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight whitespace-pre-line">
                {t("hero.title")}
              </h1>

              <div
                className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{
                  __html: t("hero.description").replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>",
                  ),
                }}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/">
                    {t("hero.cta")}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/company">{t("hero.companyCta")}</Link>
                </Button>
              </div>
            </div>
            <div className="relative lg:h-[600px] rounded-2xl bg-muted/30 border border-border overflow-hidden p-8 flex items-center justify-center">
              {/* Visual Element Placeholder */}
              <div className="relative w-full max-w-md aspect-[3/4] bg-background rounded-xl shadow-2xl border border-border p-6 space-y-4">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <div className="size-12 rounded-full bg-gray-100 dark:bg-gray-800" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded" />
                  <div className="h-3 w-5/6 bg-gray-100 dark:bg-gray-800 rounded" />
                  <div className="h-3 w-4/6 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
                <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                  <div className="bg-background/80 backdrop-blur px-6 py-3 rounded-full border border-primary/20 shadow-lg flex items-center gap-2">
                    <CheckCircle2 className="text-green-500 size-5" />
                    <span className="font-semibold text-sm">
                      AI Optimized Resume
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {t("values.title")}
            </h2>
            <p className="text-muted-foreground">{t("values.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
              <div className="size-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mb-6">
                <Globe className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                {t("values.items.0.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("values.items.0.description")}
              </p>
            </div>
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
              <div className="size-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center mb-6">
                <Languages className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                {t("values.items.1.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("values.items.1.description")}
              </p>
            </div>
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
              <div className="size-12 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center mb-6">
                <LayoutTemplate className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                {t("values.items.2.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("values.items.2.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works (Brief) */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-border overflow-hidden p-8 flex items-center justify-center">
                <div className="w-full h-full bg-background rounded-xl border border-border shadow-lg p-6 flex flex-col gap-4">
                  {/* Mock UI for process */}
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-red-400" />
                      <div className="size-3 rounded-full bg-amber-400" />
                      <div className="size-3 rounded-full bg-green-400" />
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-4">
                    <div className="text-center space-y-2">
                      <div className="mx-auto size-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                        KR
                      </div>
                      <div className="text-xs font-medium">
                        {t("process.pdfLabel")}
                      </div>
                    </div>
                    <ArrowRight className="text-muted-foreground animate-pulse" />
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      AI
                    </div>
                    <ArrowRight className="text-muted-foreground animate-pulse" />
                    <div className="text-center space-y-2">
                      <div className="mx-auto size-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                        EN
                      </div>
                      <div className="text-xs font-medium text-primary">
                        {t("process.resumeLabel")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Zap className="size-4" />
                {t("process.badge")}
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight whitespace-pre-line">
                {t("process.title")}
              </h2>
              <p className="text-lg text-muted-foreground whitespace-pre-line">
                {t("process.description")}
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  t("process.items.0"),
                  t("process.items.1"),
                  t("process.items.2"),
                  t("process.items.3"),
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl font-bold tracking-tight whitespace-pre-line">
            {t("cta.title")}
          </h2>
          <p className="text-muted-foreground whitespace-pre-line">
            {t("cta.description")}
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/">
                {t("cta.start")} <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/company">{t("cta.company")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
