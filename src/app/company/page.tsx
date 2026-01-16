"use client";

import {
  Sparkles,
  Rocket,
  ArrowRight,
  Layers,
  Lock,
  Target,
  MessageSquare,
  Search,
  BarChart,
  Globe,
  Zap,
  Briefcase,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { SiteFooter } from "@/app/components/site-footer";
import { Logo } from "@/app/components/logo";

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo href="/" alt="지원고고" />
            <div className="flex items-center gap-4">
              <Link
                href="/introduction"
                className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                서비스 소개
              </Link>
              <Link
                href="/blog"
                className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                블로그
              </Link>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

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
              케익코퍼레이션 (Cake Corporation)
            </Badge>

            <h1 className="text-4xl lg:text-7xl font-bold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              채용 시장에
              <br />
              <span className="text-primary">가장 달콤한 혁신</span>을
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              우리는 구직자와 기업 모두가 만족할 수 있는
              <br className="hidden sm:block" />
              새로운 채용 생태계를 만들어갑니다.
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
                Cake Corporation
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  채용 과정은 고통스러워야 할 필요가 없습니다. <br />
                  마치 케이크 한 조각을 즐기듯, 달콤하고 만족스러운 경험이어야
                  합니다.
                </p>
                <p>
                  케익코퍼레이션은 최첨단 AI 기술을 통해 <br />
                  구직자의 불안을 확신으로, 기업의 채용 난이도를 즐거움으로
                  바꿉니다.
                </p>
                <p>
                  우리는 단순한 유틸리티 툴을 넘어, <br />
                  <strong className="text-foreground">
                    "Wow!"를 외치게 만드는 경험
                  </strong>
                  을 디자인하고 제공합니다.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                <div className="text-center space-y-2 p-8 bg-background/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-2xl">
                  <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                    Cake.
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
              Future Roadmap
            </h2>
            <p className="text-muted-foreground">
              구직 시장의 비효율을 하나씩 해결해 나갈 10개의 프로젝트
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. ApplyGoGo (Active) */}
            <div className="group relative bg-background border border-primary/20 rounded-2xl p-8 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ring-1 ring-primary/10">
              <div className="absolute top-0 right-0 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-bl-xl">
                LIVE
              </div>
              <div className="mb-6 inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Rocket className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">지원고고</h3>
              <p className="text-sm text-muted-foreground mb-4">
                AI 기반 국문 이력서 영문 변환 및 번역 서비스. 글로벌 커리어의
                시작점.
              </p>
              <Link
                href="/"
                className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
              >
                서비스 바로가기 <ArrowRight className="ml-1 size-4" />
              </Link>
            </div>

            {/* Coming Soon Services */}
            {Array.from({ length: 9 }).map((_, idx) => (
              <div
                key={idx}
                className="group relative bg-background/50 border border-border rounded-2xl p-8 hover:bg-background transition-colors duration-300"
              >
                <div className="absolute top-0 right-0 bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
                  COMING SOON
                </div>
                <div className="mb-6 inline-flex items-center justify-center size-12 rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                  <Lock className="size-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground/80 group-hover:text-foreground">
                  비공개 프로젝트
                </h3>
                <p className="text-sm text-muted-foreground group-hover:text-foreground/70">
                  현재 준비 중인 혁신적인 마이크로서비스입니다.
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
