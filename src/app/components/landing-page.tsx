import {
  ArrowRight,
  Check,
  Sparkles,
  FileText,
  Globe,
  Download,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { SiteFooter } from "./site-footer";
import { TemplatePreviewDialog } from "./template-preview-dialog";
import { PLAN_PRODUCTS } from "@/lib/constants/plans";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img
                src="/logo-for-light.svg"
                alt="지원고고"
                className="h-6 w-auto dark:hidden"
              />
              <img
                src="/logo-for-dark.svg"
                alt="지원고고"
                className="h-6 w-auto hidden dark:block"
              />
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button onClick={onGetStarted} size="sm">
                시작하기
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted mb-6">
              <Sparkles className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                AI 기반 이력서 변환 서비스
              </span>
            </div>

            <h2 className="text-4xl lg:text-6xl tracking-tight mb-6">
              한국어 이력서를
              <br />
              <span className="text-muted-foreground">
                글로벌 스탠다드 영문으로
              </span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI가 자동으로 <strong>국문 이력서 영문 변환</strong>을 수행하여,
              채용 담당자가 주목하는
              <br />
              프로페셔널한 <strong>영문 이력서(CV)</strong>를 몇 분 안에
              완성해드립니다.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Button onClick={onGetStarted} size="lg">
                무료로 시작하기
                <ArrowRight className="size-4" />
              </Button>
              <TemplatePreviewDialog
                onSelectTemplate={() => onGetStarted()}
                trigger={
                  <Button variant="outline" size="lg">
                    샘플 보기
                  </Button>
                }
              />
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              신용카드 없이 무료로 시작 • 최초 2회 무료 변환
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
                  압도적인 가성비
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                  외주보다 빠르고,
                  <br />
                  비용은 <span className="text-primary">1/10</span> 수준으로
                </h2>
                <p className="text-lg text-muted-foreground">
                  "외주 마켓에서 영문 이력서 한 장에 <strong>5~10만원</strong>
                  ..."
                  <br className="hidden lg:block" />
                  이제 비싼 비용과 긴 대기시간 없이, 합리적인 가격으로
                  <br className="hidden lg:block" />
                  <strong>전문가 수준의 결과물</strong>을 즉시 받아보세요.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-3 bg-background/50 rounded-lg p-3 shadow-sm border border-border">
                    <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                      <span className="text-red-600 dark:text-red-400 font-bold text-sm">
                        기존
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-muted-foreground">
                        평균 비용
                      </div>
                      <div className="font-semibold text-sm line-through text-muted-foreground decoration-red-500/50">
                        100,000원
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="hidden sm:block size-5 text-muted-foreground self-center" />
                  <div className="flex items-center gap-3 bg-background rounded-lg p-3 shadow-sm border border-primary/20 ring-1 ring-primary/10">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-sm">
                        Now
                      </span>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-muted-foreground">
                        지원고고
                      </div>
                      <div className="font-bold text-lg text-primary">
                        {PLAN_PRODUCTS.PASS_30DAY.price.toLocaleString()}원
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
                      제작 비용 비교
                    </div>
                  </div>
                  <div className="p-8 space-y-8">
                    {/* Bar 1 */}
                    <div className="space-y-2 opacity-60">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          기타 외주 서비스
                        </span>
                        <span className="font-medium">100,000원+</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gray-400 w-full" />
                      </div>
                    </div>
                    {/* Bar 2 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-base">
                        <span className="font-bold text-primary">지원고고</span>
                        <span className="font-bold text-primary">
                          {PLAN_PRODUCTS.PASS_30DAY.price.toLocaleString()}원
                        </span>
                      </div>
                      <div className="h-4 bg-primary/10 rounded-full overflow-hidden relative">
                        <div className="h-full bg-primary w-[10%] rounded-full relative">
                          <div className="absolute -right-1 top-0 bottom-0 w-2 bg-white/50 blur-[2px] animate-pulse" />
                        </div>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-primary font-bold pr-3">
                          87% SAVE
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
            <h3 className="text-3xl tracking-tight mb-4">왜 지원고고인가요?</h3>
            <p className="text-muted-foreground">
              단순 번역이 아닌, 채용 시장에 최적화된 이력서를 만듭니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="inline-flex items-center justify-center size-12 rounded-lg bg-primary/10 mb-4">
                <Sparkles className="size-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-2">AI 기반 요약</h4>
              <p className="text-muted-foreground text-sm">
                Gemini Pro가 경력사항을 분석하여 핵심 성과 중심의 3~4줄 불릿
                포인트로 재구성합니다. 채용 담당자가 원하는 형식 그대로.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="inline-flex items-center justify-center size-12 rounded-lg bg-primary/10 mb-4">
                <Globe className="size-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-2">전문 번역</h4>
              <p className="text-muted-foreground text-sm">
                Split View로 한글/영문을 동시에 비교하며 수정 가능. 직접
                편집으로 완벽한 커스터마이징까지.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="inline-flex items-center justify-center size-12 rounded-lg bg-primary/10 mb-4">
                <Download className="size-6 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-2">프로 템플릿</h4>
              <p className="text-muted-foreground text-sm">
                Modern, Professional, Executive 등 다양한 템플릿 중 선택하여
                즉시 PDF로 다운로드. 지원 기업에 바로 제출하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl tracking-tight mb-4">3단계로 완성</h3>
            <p className="text-muted-foreground">
              복잡한 과정 없이 빠르고 간편하게
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary text-primary-foreground mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="text-lg font-semibold mb-2">PDF 업로드</h4>
              <p className="text-muted-foreground text-sm">
                한국어 이력서 PDF를 드래그 앤 드롭으로 업로드
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary text-primary-foreground mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="text-lg font-semibold mb-2">AI 변환</h4>
              <p className="text-muted-foreground text-sm">
                요약과 번역을 AI가 자동으로 처리. 직접 수정도 가능
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary text-primary-foreground mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="text-lg font-semibold mb-2">PDF 다운로드</h4>
              <p className="text-muted-foreground text-sm">
                마음에 드는 템플릿으로 PDF 내보내기 완료
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended For (New Section 1) */}
      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl tracking-tight mb-6 leading-tight">
                글로벌 커리어를 꿈꾸는
                <br />
                모든 분들을 위해 준비했습니다
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Globe className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">
                      외국계 기업 이력서 & CV 작성
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      <strong>외국계 이력서 양식</strong>과{" "}
                      <strong>CV 번역</strong>에 익숙하지 않아 막막하신 분들께
                      글로벌 스탠다드 포맷을 제공합니다.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <Sparkles className="size-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">
                      빠른 국문 이력서 영문 변환
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      이직 기회는 왔는데 <strong>영어 이력서 변환</strong>할
                      시간이 부족하신가요? 기존 <strong>한국 이력서</strong>만
                      올리면 5분 안에 완성됩니다.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <FileText className="size-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">
                      전문적인 AI 영문 이력서 첨삭
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      단순 <strong>이력서 번역</strong>이 아닌, '채용 문법'에
                      맞는 세련된 영어 표현으로 당신의{" "}
                      <strong>영문 경력기술서</strong>를 완성해드립니다.
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
            <h3 className="text-3xl tracking-tight font-bold">심플한 이용권</h3>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 text-foreground text-sm font-medium">
              <span>🎉</span>
              <span>오픈 기념 한정 특가 진행 중</span>
            </div>
            <p className="text-muted-foreground">
              지금 아니면 만날 수 없는 가격, 합리적인 이용권으로 시작하세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* 무료 체험 */}
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <h4 className="text-lg font-semibold mb-2">무료 체험</h4>
              <div className="text-4xl font-bold mb-4">₩0</div>
              <p className="text-sm text-muted-foreground mb-6">
                서비스를 체험해보세요
              </p>
              <ul className="space-y-2.5 mb-6 text-sm text-muted-foreground text-left">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  <span className="font-semibold text-foreground">10</span>{" "}
                  크레딧 제공
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  기본 템플릿 사용
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  재번역 1 크레딧
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  무제한 기간
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full"
                onClick={onGetStarted}
              >
                무료로 시작하기
              </Button>
            </div>

            {/* 7일 이용권 */}
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <h4 className="text-lg font-semibold mb-2">7일 이용권</h4>
              <div className="flex flex-col items-center justify-center mb-4">
                <span className="text-lg font-medium text-muted-foreground/60 line-through mb-1">
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
                일주일 동안 모든 기능 사용
              </p>
              <ul className="space-y-2.5 mb-6 text-sm text-muted-foreground text-left">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  <span className="font-semibold text-foreground">
                    {PLAN_PRODUCTS.PASS_7DAY.credits}
                  </span>{" "}
                  크레딧 포함
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  모든 템플릿 사용
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  재번역 무제한
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  7일간 이용
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full"
                onClick={onGetStarted}
              >
                시작하기
              </Button>
            </div>

            {/* 30일 이용권 (추천) */}
            <div className="bg-card border border-primary rounded-lg p-6 text-center shadow-lg relative ring-1 ring-primary/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium">
                추천
              </div>
              <h4 className="text-lg font-semibold mb-2">30일 이용권</h4>
              <div className="flex flex-col items-center justify-center mb-4">
                <span className="text-lg font-medium text-muted-foreground/60 line-through mb-1">
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
                한 달 동안 모든 기능 사용
              </p>
              <ul className="space-y-2.5 mb-6 text-sm text-muted-foreground text-left">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  <span className="font-semibold text-foreground">
                    {PLAN_PRODUCTS.PASS_30DAY.credits}
                  </span>{" "}
                  크레딧 포함
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  모든 템플릿 사용
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  재번역 무제한
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600 shrink-0" />
                  30일간 이용
                </li>
              </ul>
              <Button className="w-full" onClick={onGetStarted}>
                시작하기
              </Button>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            * 이력서 생성 시 5 크레딧, 재번역 시 무료(이용권 보유자) 또는 1
            크레딧(무료 사용자)이 차감됩니다.
          </p>
        </div>
      </section>

      {/* FAQ (New Section 2) */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl tracking-tight mb-4">자주 묻는 질문</h3>
            <p className="text-muted-foreground">궁금한 점을 확인하세요</p>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-border p-6 bg-card">
              <h4 className="font-semibold mb-2">
                Q. 한글 이력서 양식은 상관없나요?
              </h4>
              <p className="text-sm text-muted-foreground">
                네, PDF 형식의 이력서라면 자유 양식, 잡코리아/사람인 다운로드
                양식 등 대부분 지원합니다. AI가 텍스트를 추출하여 내용을
                분석하므로 형식이 복잡해도 괜찮습니다.
              </p>
            </div>
            <div className="rounded-lg border border-border p-6 bg-card">
              <h4 className="font-semibold mb-2">
                Q. 번역된 내용은 제가 수정할 수 있나요?
              </h4>
              <p className="text-sm text-muted-foreground">
                물론입니다. AI 변환 후 제공되는 편집기에서 요약된 내용과 영문
                번역을 자유롭게 수정하실 수 있습니다. Split View를 통해 원문과
                비교하며 섬세하게 다듬어보세요.
              </p>
            </div>
            <div className="rounded-lg border border-border p-6 bg-card">
              <h4 className="font-semibold mb-2">
                Q. 무료 플랜으로도 충분한가요?
              </h4>
              <p className="text-sm text-muted-foreground">
                체험을 위해 월 10 크레딧을 제공합니다. 이력서를 완성하고
                다운로드하기에 충분하지만, 다양한 템플릿과 무제한 수정을
                원하시면 Pro 플랜을 추천드립니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl tracking-tight mb-4">
            지금 바로 글로벌 커리어를 시작하세요
          </h3>
          <p className="text-muted-foreground mb-8">
            지원고고와 함께라면 영문 이력서 걱정은 이제 그만
          </p>
          <Button onClick={onGetStarted} size="lg">
            무료로 시작하기
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
