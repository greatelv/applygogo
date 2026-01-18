"use client";

import { Sparkles, Rocket, ArrowRight, Lock } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Badge } from "@/app/components/ui/badge";
import { PublicHeader } from "@/app/components/header";
import { SiteFooter } from "@/app/components/site-footer";

export default function CompanyPage() {
  const t = useTranslations("company");

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge
              variant="outline"
              className="bg-background/50 backdrop-blur border-primary/20 text-primary px-4 py-1.5 text-sm"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
              {t("hero.badge")}
            </Badge>

            <h1 className="text-4xl lg:text-7xl font-bold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 whitespace-pre-line">
              {t.rich("hero.title", {
                highlight: (chunks) => (
                  <span className="text-primary">{chunks}</span>
                ),
              })}
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
              {t("hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                {t("about.title")}
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  {t.rich("about.p1", {
                    br: () => <br />,
                  })}
                </p>
                <p>
                  {t.rich("about.p2", {
                    br: () => <br />,
                  })}
                </p>
                <p>
                  {t.rich("about.p3", {
                    br: () => <br />,
                    strong: (chunks) => (
                      <strong className="text-foreground">{chunks}</strong>
                    ),
                  })}
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                <div className="text-center space-y-2 p-8 bg-background/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-2xl">
                  <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                    Keique
                  </div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                    Corporation
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Roadmap Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {t("roadmap.title")}
            </h2>
            <p className="text-muted-foreground">{t("roadmap.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. ApplyGoGo (Active) */}
            <div className="group relative bg-background border border-primary/20 rounded-2xl p-8 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ring-1 ring-primary/10">
              <div className="absolute top-0 right-0 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-bl-xl">
                {t("roadmap.active.badge")}
              </div>
              <div className="mb-6 inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Rocket className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {t("roadmap.active.title")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("roadmap.active.description")}
              </p>
              <Link
                href="/"
                className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
              >
                {t("roadmap.active.link")}{" "}
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </div>

            {/* Coming Soon Services */}
            {Array.from({ length: 9 }).map((_, idx) => (
              <div
                key={idx}
                className="group relative bg-background/50 border border-border rounded-2xl p-8 hover:bg-background transition-colors duration-300"
              >
                <div className="absolute top-0 right-0 bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
                  {t("roadmap.comingSoon.badge")}
                </div>
                <div className="mb-6 inline-flex items-center justify-center size-12 rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                  <Lock className="size-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground/80 group-hover:text-foreground">
                  {t("roadmap.comingSoon.title")}
                </h3>
                <p className="text-sm text-muted-foreground group-hover:text-foreground/70">
                  {t("roadmap.comingSoon.description")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
