# 🌏 지원고고 다국어 지원 구현 계획서 (Complete Implementation Plan)

> **Last Updated:** 2026-01-17  
> **Status:** In Progress  
> **Epic:** Multi-language Support (Separate Tables Strategy)

---

## 📋 프로젝트 개요

### 목표

기존 한국향 applygogo.com의 **모든 UI/UX 자산을 보존**하면서, 애플리케이션 내에서 다국어(영어, 일본어)를 지원하여 **다국어 이력서 → 한국 이력서 변환** 기능 제공

### 핵심 원칙 (CRITICAL)

#### 1. 🎨 디자인 보존 (UI/UX Preservation)

- ✅ **기존 FE 구현체, 컴포넌트 구조, 스타일, 테마, 톤앤매너 100% 유지**
- ✅ Tailwind 클래스, CSS 변수, 레이아웃, 여백 등 **시각적 요소 절대 변경 금지**
- ✅ 다국어 지원은 **텍스트 콘텐츠만 교체**, 디자인 시스템은 불변
- ✅ 컴포넌트 구조 리팩토링 최소화, 기존 파일 구조 최대한 재사용

#### 2. 🔒 데이터 완전 격리 (Complete Data Isolation)

- ✅ **기존 Resume 테이블 절대 건드리지 않음** (제로 리스크)
- ✅ **GlobalResume 별도 테이블 생성** (완전 분리)
- ✅ User 및 결제 데이터는 언어 간 공유
- ✅ 비즈니스 로직이 다르므로 테이블 레벨에서 분리

#### 3. 🌐 언어 전환 제한 (Language Switching Rules)

- ✅ **콘솔 밖(랜딩페이지, 로그인 페이지)에서만 언어 전환 가능**
- ✅ **콘솔 안(대시보드, 이력서 편집 등)에서는 언어 전환 UI 숨김**
- ✅ 이유: 언어별 이력서 데이터가 격리되어 있어 혼란 방지

#### 4. 💳 결제 시스템 (Payment Integration)

- ✅ 한국어: PortOne + 국내 PG (기존 유지)
- ✅ 영어/일본어: **PortOne + PayPal**
- ✅ 언어별 채널 키 분리
- ✅ User의 credits는 언어 무관 공유 (단일 지갑)
- ✅ 가격: $9 (7일), $12 (30일)

#### 5. 🔍 SEO 보호 (SEO Preservation)

- ✅ 기존 `/` 경로의 SEO, 권위, 유입 절대 보호
- ✅ `/en`, `/ja` 경로의 독립적인 SEO 최적화
- ✅ hreflang, canonical, sitemap 완벽 설정

---

## 🗄️ Phase 1: 데이터베이스 스키마 설계 (✅ 완료)

### 핵심 전략: 기존 테이블 보존 + 다국어 전용 테이블 신규 생성

**장점**:

- ✅ **제로 리스크**: 기존 한국향 서비스에 영향 없음
- ✅ **완전한 격리**: 비즈니스 로직이 다르므로 테이블 레벨에서 분리
- ✅ **독립적 배포**: 다국어 기능을 언제든 On/Off 가능
- ✅ **롤백 용이**: 문제 발생 시 새 테이블만 삭제하면 됨

### 1.1 기존 테이블 (한국향 전용) - 변경 없음

```prisma
// ✅ 기존 테이블 그대로 유지 (절대 건드리지 않음)
model Resume {
  id                String         @id @default(cuid())
  userId            String         @map("user_id")
  // ... 기존 필드 그대로 유지

  @@map("resumes")
}
```

### 1.2 다국어 전용 테이블 (신규 생성) - ✅ 완료

```prisma
model GlobalResume {
  id                String              @id @default(cuid())
  userId            String              @map("user_id")

  // 언어 정보
  sourceLocale      String              // 'en', 'ja'
  detectedLocale    String?             // AI 자동 감지
  targetLocale      String              @default("ko")

  // 원본 + 번역 데이터
  name_original     String
  name_translated   String?
  summary_original  String?
  summary_translated String?

  // Relations
  work_experiences  GlobalWorkExperience[]
  educations        GlobalEducation[]
  skills            GlobalSkill[]
  additionalItems   GlobalAdditionalItem[]

  @@map("global_resumes")
}
```

**상세 스키마**: `docs/i18n-separate-tables-plan.md` 참조

---

## 🛣️ Phase 2: 라우팅 아키텍처

### 2.1 폴더 구조 설계

**목표**: 기존 `/` 경로 보존, 다국어는 `/[locale]` 추가

```
src/app/
├── (marketing)/              # 콘솔 밖 (언어 전환 가능)
│   ├── page.tsx             # / (한국어 기본)
│   ├── login/
│   └── [locale]/            # 🆕 /en, /ja
│       ├── page.tsx
│       └── login/
│
├── (console)/               # 콘솔 안 (언어 전환 불가)
│   ├── dashboard/           # /dashboard (한국어)
│   ├── resume/[id]/         # Resume 테이블 사용
│   └── settings/
│
├── [locale]/                # 🆕 다국어 콘솔
│   └── (console)/
│       ├── dashboard/       # /en/dashboard, /ja/dashboard
│       ├── global-resume/[id]/  # GlobalResume 테이블 사용
│       └── settings/
│
└── api/
    ├── resume/              # 한국향 API
    └── global-resumes/      # 🆕 다국어 API (✅ 완료)
```

### 2.2 Middleware 설정

```typescript
// middleware.ts
const SUPPORTED_LOCALES = ["en", "ja"] as const;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API, static 파일 스킵
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // 기본 경로(/)는 한국어로 처리 (변경 없음)
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (!pathnameHasLocale) {
    return NextResponse.next(); // 기존 로직 유지
  }

  // 다국어 경로는 그대로 통과
  return NextResponse.next();
}
```

---

## 🎨 Phase 3: UI/UX 다국어화 (디자인 보존)

### 3.1 i18n 라이브러리 설정

**선택**: `next-intl` (Next.js App Router 최적화)

```bash
pnpm add next-intl
```

**설정**:

```typescript
// src/i18n.ts
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
}));
```

**메시지 파일 구조**:

```
messages/
├── ko.json          # 한국어
├── en.json          # 영어
└── ja.json          # 일본어
```

### 3.2 컴포넌트 다국어 처리 (디자인 불변)

**원칙**: 텍스트만 교체, 스타일/레이아웃 절대 변경 금지

```tsx
// Before (기존)
<h1 className="text-4xl font-bold">
  AI로 이력서를 한국 기업에 맞게 변환하세요
</h1>;

// After (다국어 - 스타일 동일)
import { useTranslations } from "next-intl";

const t = useTranslations("Landing");
<h1 className="text-4xl font-bold">{t("hero.title")}</h1>;
```

### 3.3 언어 전환 UI (콘솔 밖에만 표시)

```tsx
// src/app/components/language-switcher.tsx
export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (locale: string) => {
    if (locale === "ko") {
      router.push(pathname.replace(/^\/(en|ja)/, "") || "/");
    } else {
      router.push(`/${locale}${pathname}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Globe className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleLanguageChange("ko")}>
          🇰🇷 한국어
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange("ja")}>
          🇯🇵 日本語
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**사용 위치**:

- ✅ 랜딩페이지 헤더
- ✅ 로그인 페이지 헤더
- ❌ 대시보드 (숨김)
- ❌ 이력서 편집 (숨김)

---

## 🔍 Phase 4: 데이터 쿼리 격리

### 4.1 공통 유틸리티 함수

```typescript
// src/lib/global-resume-utils.ts
export async function getUserGlobalResumes(locale: "en" | "ja") {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.globalResume.findMany({
    where: {
      userId: session.user.id,
      sourceLocale: locale, // 🔒 언어별 격리
    },
    include: {
      work_experiences: true,
      educations: true,
      skills: true,
      additionalItems: true,
    },
    orderBy: { created_at: "desc" },
  });
}
```

### 4.2 대시보드 페이지

```tsx
// src/app/[locale]/dashboard/page.tsx
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: "en" | "ja" }>;
}) {
  const { locale } = await params;
  const resumes = await getUserGlobalResumes(locale);

  return (
    <div className="container py-8">
      <h1>{locale === "en" ? "My Resumes" : "マイ履歴書"}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resumes.map((resume) => (
          <GlobalResumeCard key={resume.id} resume={resume} />
        ))}
      </div>
    </div>
  );
}
```

---

## 💳 Phase 5: 결제 시스템 (PayPal Integration)

### 5.1 환경 변수

```bash
# 한국어 (기존)
PORTONE_CHANNEL_KEY_KR=channel-key-xxx
PORTONE_STORE_ID_KR=store-xxx

# 영어/일본어 (PayPal)
PORTONE_CHANNEL_KEY_PAYPAL=channel-key-paypal-xxx
PORTONE_STORE_ID_PAYPAL=store-paypal-xxx
```

### 5.2 언어별 결제 로직

```typescript
// src/app/api/global-payment/prepare/route.ts
export async function POST(request: Request) {
  const { locale, planType } = await request.json();

  const pricing = {
    en: { currency: "USD", amount: planType === "PASS_7DAY" ? 9 : 12 },
    ja: { currency: "JPY", amount: planType === "PASS_7DAY" ? 1200 : 1500 },
  };

  const { currency, amount } = pricing[locale as keyof typeof pricing];

  const portone = new PortOne({
    apiSecret: process.env.PORTONE_API_SECRET!,
  });

  return portone.payment.prepare({
    storeId: process.env.PORTONE_STORE_ID_PAYPAL,
    channelKey: process.env.PORTONE_CHANNEL_KEY_PAYPAL,
    orderName: `ApplyGoGo Global ${planType}`,
    totalAmount: amount,
    currency,
    paymentMethod: "PAYPAL",
  });
}
```

---

## 🤖 Phase 6: AI 번역 로직 (✅ 완료)

### 3단계 프로세싱: 추출 → 번역 → 정제

**상세 내용**: `docs/i18n-ai-seo-strategy.md` 참조

1. **Stage 1: 추출 (Extract)**
   - PDF에서 구조화된 데이터 추출
   - 언어 자동 감지 (`detectedLocale`)

2. **Stage 2: 번역 (Translate)**
   - 원본 언어 → 한국어 직역
   - 영어/일본어 별도 프롬프트

3. **Stage 3: 정제 (Refine)**
   - 한국 기업 문화에 맞게 톤 조정
   - 겸손한 표현, 팀 중심, 존댓말

**API**: `/api/global-resumes/[id]/process` (✅ 완료)

---

## 🔍 Phase 7: SEO 최적화

### 7.1 메타데이터 설정

```tsx
// src/app/[locale]/layout.tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const metadata = {
    ko: {
      title: "지원고고 - AI 이력서 번역 서비스",
      description: "영문 이력서를 한국 기업에 맞게 AI로 자동 번역",
    },
    en: {
      title: "ApplyGoGo - AI Resume Translation to Korean",
      description: "Transform your English resume for Korean companies with AI",
    },
    ja: {
      title: "ApplyGoGo - AI履歴書翻訳サービス",
      description: "英語の履歴書を韓国企業向けにAI翻訳",
    },
  };

  const { title, description } =
    metadata[locale as keyof typeof metadata] || metadata.ko;

  return {
    title,
    description,
    alternates: {
      canonical: `https://applygogo.com/${locale === "ko" ? "" : locale}`,
      languages: {
        ko: "https://applygogo.com",
        en: "https://applygogo.com/en",
        ja: "https://applygogo.com/ja",
      },
    },
  };
}
```

### 7.2 Sitemap

```typescript
// src/app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://applygogo.com";
  const locales = ["", "en", "ja"];
  const routes = ["", "login", "pricing"];

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}/${route}`.replace(/\/+$/, ""),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1.0 : 0.8,
      alternates: {
        languages: {
          ko: `${baseUrl}/${route}`,
          en: `${baseUrl}/en/${route}`,
          ja: `${baseUrl}/ja/${route}`,
        },
      },
    })),
  );
}
```

---

## 🧪 Phase 8: 테스트 체크리스트

### 8.1 기능 테스트

**데이터 격리**:

- [ ] 한국어 대시보드에서 GlobalResume 표시 안 됨
- [ ] 영어 대시보드에서 Resume 표시 안 됨
- [ ] URL 직접 접근 시 권한 검증

**언어 전환**:

- [ ] 랜딩페이지에서 언어 전환 가능
- [ ] 대시보드에서 언어 전환 UI 숨김

**결제**:

- [ ] 한국어: KRW + 국내 PG
- [ ] 영어: USD + PayPal
- [ ] 크레딧 공유 확인

**AI 번역**:

- [ ] 영어 → 한국어 3단계 프로세싱
- [ ] 일본어 → 한국어 3단계 프로세싱
- [ ] 언어 자동 감지

### 8.2 디자인 보존 검증

- [ ] 랜딩페이지: 레이아웃, 여백, 폰트, 색상 동일
- [ ] 대시보드: 카드 디자인, 그리드, 간격 동일
- [ ] 다크모드: 모든 언어에서 정상 작동

---

## 📊 진행 상황

| Phase   | 작업                | 상태       |
| ------- | ------------------- | ---------- |
| Phase 1 | 데이터베이스 스키마 | ✅ 완료    |
| Phase 2 | API 엔드포인트      | ✅ 완료    |
| Phase 3 | 라우팅 설정         | ⏳ 진행 중 |
| Phase 4 | UI 컴포넌트         | ⏳ 대기    |
| Phase 5 | 결제 통합           | ⏳ 대기    |
| Phase 6 | AI 프로세싱         | ✅ 완료    |
| Phase 7 | SEO 최적화          | ⏳ 대기    |
| Phase 8 | 테스트              | ⏳ 대기    |

---

## 📝 다음 단계

1. **`next-intl` 설치** 및 설정
2. **메시지 파일 생성** (`ko.json`, `en.json`, `ja.json`)
3. **`[locale]` 폴더 구조** 생성
4. **랜딩페이지 다국어화** (디자인 보존)
5. **대시보드 페이지** 구현

---

## 📚 관련 문서

- **상세 스키마**: `docs/i18n-separate-tables-plan.md`
- **AI & SEO 전략**: `docs/i18n-ai-seo-strategy.md`
- **PRD**: `docs/PRD.md`

준비되시면 다음 단계를 진행하겠습니다! 🚀
