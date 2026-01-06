import { ArrowRight, Check, Sparkles, Globe, Download } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";

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
            <h1 className="text-xl tracking-tight font-semibold">지원고고</h1>
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
              AI가 자동으로 경력을 요약하고 번역하여, 채용 담당자가 주목하는
              <br />
              프로페셔널한 영문 이력서를 몇 분 안에 만들어드립니다.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Button onClick={onGetStarted} size="lg">
                무료로 시작하기
                <ArrowRight className="size-4" />
              </Button>
              <Button variant="outline" size="lg">
                샘플 보기
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              신용카드 없이 무료로 시작 • 월 2회 무료 변환
            </p>
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
                Modern, Classic, Minimal 3가지 템플릿 중 선택하여 즉시 PDF로
                다운로드. 지원 기업에 바로 제출하세요.
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

      {/* Pricing Preview */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl tracking-tight mb-4">간단한 가격 정책</h3>
            <p className="text-muted-foreground">필요한 만큼만 사용하세요</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <h4 className="text-lg font-semibold mb-2">Free</h4>
              <div className="text-3xl font-bold mb-4">무료</div>
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600" />월 2 크레딧
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600" />
                  이력서 1개 보관
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

            <div className="bg-card border border-foreground rounded-lg p-6 text-center shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                인기
              </div>
              <h4 className="text-lg font-semibold mb-2">Standard</h4>
              <div className="text-3xl font-bold mb-4">₩9,900</div>
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600" />월 6 크레딧
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600" />
                  이력서 3개 보관
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600" />
                  모든 템플릿
                </li>
              </ul>
              <Button className="w-full" onClick={onGetStarted}>
                시작하기
              </Button>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <h4 className="text-lg font-semibold mb-2">Pro</h4>
              <div className="text-3xl font-bold mb-4">₩29,900</div>
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600" />월 20 크레딧
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600" />
                  무제한 보관
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-600" />
                  커스텀 템플릿
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

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2026 지원고고. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground">
                서비스 약관
              </a>
              <a href="#" className="hover:text-foreground">
                개인정보 처리방침
              </a>
              <a href="#" className="hover:text-foreground">
                문의
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
