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
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { SiteFooter } from "@/app/components/site-footer";

export default function IntroductionPage() {
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
                회사 소개
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
              <Button asChild size="sm">
                <Link href="/">지금 시작하기</Link>
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
                Global Career Starter
              </Badge>

              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
                세계로 향하는 문,
                <br />
                <span className="text-primary">가장 빠르고 확실하게</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed">
                <strong>지원고고</strong>는 언어의 장벽과 형식의 복잡함 때문에
                <br className="hidden sm:block" />
                글로벌 커리어의 기회를 놓치는 인재들을 위해 탄생했습니다.
                <br />
                최고의 AI 기술로 당신의 경력을 세계에 증명하세요.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/">
                    무료로 이력서 변환하기
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/company">회사 소개 보기</Link>
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
              왜 지원고고인가요?
            </h2>
            <p className="text-muted-foreground">
              단순한 번역을 넘어, 채용 시장에서 통하는 가치를 만듭니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
              <div className="size-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mb-6">
                <Globe className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">글로벌 스탠다드</h3>
              <p className="text-muted-foreground">
                국가별, 산업별로 선호하는 이력서 양식과 표현 방식은 다릅니다.
                지원고고 AI는 글로벌 채용 트렌드를 학습하여 가장 효과적인 포맷을
                제공합니다.
              </p>
            </div>
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
              <div className="size-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center mb-6">
                <Languages className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">맥락을 이해하는 번역</h3>
              <p className="text-muted-foreground">
                단순 1:1 직역이 아닌, 업무 성과와 역량이 돋보이는 'Business
                English'로 재구성합니다. 전문 용어와 뉘앙스까지 섬세하게
                다룹니다.
              </p>
            </div>
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
              <div className="size-12 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center mb-6">
                <LayoutTemplate className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">압도적인 시간 단축</h3>
              <p className="text-muted-foreground">
                며칠씩 걸리던 국문 이력서 영문 변환 작업을 단 5분으로
                단축합니다. 더 중요한 '면접 준비'와 '직무 분석'에 시간을
                투자하세요.
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
                      <div className="text-xs font-medium">국문 PDF</div>
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
                        Pro Resume
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Zap className="size-4" />
                Seamless Process
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                복잡한 과정은 덜어내고 <br />
                핵심에만 집중했습니다
              </h2>
              <p className="text-lg text-muted-foreground">
                기존의 국문 이력서 PDF 파일 하나만 준비하세요.
                <br />
                나머지는 지원고고의 AI 엔진이 알아서 처리합니다.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  "별도의 회원가입 없이 PDF 업로드만으로 시작",
                  "AI가 자동으로 섹션 구분 및 내용 요약",
                  "실시간 미리보기와 직관적인 수정 에디터",
                  "ATS(채용 담당자 시스템) 친화적 포맷팅",
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
          <h2 className="text-3xl font-bold tracking-tight">
            당신의 커리어는 <br className="sm:hidden" />더 넓은 무대에서 빛나야
            합니다
          </h2>
          <p className="text-muted-foreground">
            지금 바로 지원고고와 함께 글로벌 도전을 시작하세요.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/">
                지금 무료로 시작하기 <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/company">회사 소개 보기</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
