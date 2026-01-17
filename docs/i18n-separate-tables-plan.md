# 🌏 지원고고 다국어 지원 구현 계획서 v2 (별도 테이블 전략)

> **Last Updated:** 2026-01-17  
> **Status:** Planning Phase  
> **Epic:** Multi-language Support (Separate Tables)  
> **전략**: 기존 테이블 보존 + 다국어 전용 테이블 신규 생성

---

## 📋 핵심 전략: 완전 분리 아키텍처

### ✅ 왜 별도 테이블인가?

**기존 접근 (컬럼 확장)**의 문제점:

- ❌ 기존 `Resume` 테이블 수정 필요 → 리스크
- ❌ 컬럼명 변경 (`_kr` → `_ko`) → 마이그레이션 복잡
- ❌ 비즈니스 로직이 다른데 같은 테이블 사용 → 혼란

**별도 테이블 전략**의 장점:

- ✅ **제로 리스크**: 기존 한국향 서비스에 영향 없음
- ✅ **완전한 격리**: 비즈니스 로직이 다르므로 테이블 레벨에서 분리
- ✅ **독립적 배포**: 다국어 기능을 언제든 On/Off 가능
- ✅ **롤백 용이**: 문제 발생 시 새 테이블만 삭제하면 됨
- ✅ **명확한 분석**: 한국향 vs 다국어 지표 분리 추적
- ✅ **비즈니스 로직 분리**: 다른 워크플로우, 다른 프롬프트, 다른 템플릿

---

## 🗄️ Phase 1: 데이터베이스 스키마 설계

### 1.1 기존 테이블 (한국향 전용) - 변경 없음

```prisma
// ✅ 기존 테이블 그대로 유지 (절대 건드리지 않음)
model Resume {
  id                String         @id @default(cuid())
  userId            String         @map("user_id")
  title             String
  original_file_url String
  target_role       String?
  status            ResumeStatus   @default(IDLE)
  failure_message   String?
  current_step      ResumeStep     @default(UPLOAD)
  selected_template ResumeTemplate?
  created_at        DateTime       @default(now())
  updated_at        DateTime       @updatedAt

  // 기존 필드 그대로
  email             String?
  links             Json?
  name_en           String?
  name_kr           String         @default("")
  phone             String?
  summary           String?        @default("")
  summary_kr        String?        @default("")

  // Relations (기존 그대로)
  additionalItems   AdditionalItem[]
  educations        Education[]
  user              User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  skills            Skill[]
  work_experiences  WorkExperience[]

  @@map("resumes")
}

// WorkExperience, Education, Skill, AdditionalItem 등도 모두 기존 그대로 유지
```

**핵심**: 기존 한국향 서비스는 **단 한 줄도 변경하지 않음**

---

### 1.2 다국어 전용 테이블 (신규 생성)

#### GlobalResume (다국어 이력서)

```prisma
// 🆕 다국어 전용 이력서 테이블
model GlobalResume {
  id                String              @id @default(cuid())
  userId            String              @map("user_id")

  // 언어 정보
  sourceLocale      String              // 'en', 'ja' (원본 언어)
  detectedLocale    String?             // 🆕 AI가 자동 감지한 언어 (검증용)
  targetLocale      String              @default("ko") // 목표 언어 (항상 한국어)

  // 메타데이터
  title             String
  original_file_url String              @map("original_file_url")
  target_role       String?             @map("target_role")

  // 워크플로우 상태
  status            GlobalResumeStatus  @default(IDLE)
  failure_message   String?             @map("failure_message")
  current_step      GlobalResumeStep    @default(UPLOAD)
  selected_template GlobalResumeTemplate? @map("selected_template")

  // 타임스탬프
  created_at        DateTime            @default(now()) @map("created_at")
  updated_at        DateTime            @updatedAt @map("updated_at")

  // 개인 정보
  email             String?
  phone             String?
  links             Json?               // { linkedin, github, portfolio }

  // 이름 (원본 언어 + 한국어 번역)
  name_original     String              @map("name_original")
  name_translated   String?             @map("name_translated") // AI 번역된 한국어 이름

  // 요약 (원본 언어 + 한국어 번역)
  summary_original  String?             @default("") @map("summary_original")
  summary_translated String?            @default("") @map("summary_translated")

  // Relations
  user              User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  work_experiences  GlobalWorkExperience[]
  educations        GlobalEducation[]
  skills            GlobalSkill[]
  additionalItems   GlobalAdditionalItem[]

  @@index([userId, sourceLocale])
  @@map("global_resumes")
}
```

**핵심 차이점**:

- `sourceLocale`은 'en', 'ja'만 (한국어는 기존 `Resume` 사용)
- `targetLocale`은 항상 'ko' (다국어 → 한국어 변환 전용)
- `_original` / `_translated` 네이밍으로 명확한 구분
- 별도 Enum 사용 (`GlobalResumeStatus`, `GlobalResumeStep`)

---

#### GlobalWorkExperience (다국어 경력)

```prisma
model GlobalWorkExperience {
  id              String        @id @default(cuid())
  resumeId        String        @map("resume_id")

  // 회사명 (원본 + 번역)
  company_name_original    String  @map("company_name_original")
  company_name_translated  String? @map("company_name_translated")

  // 역할 (원본 + 번역)
  role_original     String  @map("role_original")
  role_translated   String? @map("role_translated")

  // 기간
  start_date        String  @map("start_date")
  end_date          String  @map("end_date")

  // 업무 내용 (원본 + 번역)
  bullets_original     Json  @map("bullets_original")     // ["Developed...", "Led..."]
  bullets_translated   Json? @map("bullets_translated")   // ["개발했습니다...", "리드했습니다..."]

  order             Int     @default(0)
  resume            GlobalResume @relation(fields: [resumeId], references: [id], onDelete: Cascade)

  @@map("global_work_experiences")
}
```

---

#### GlobalEducation (다국어 학력)

```prisma
model GlobalEducation {
  id             String        @id @default(cuid())
  resumeId       String        @map("resume_id")

  // 학교명 (원본 + 번역)
  school_name_original    String  @map("school_name_original")
  school_name_translated  String? @map("school_name_translated")

  // 전공 (원본 + 번역)
  major_original     String  @map("major_original")
  major_translated   String? @map("major_translated")

  // 학위 (원본 + 번역)
  degree_original    String  @map("degree_original")
  degree_translated  String? @map("degree_translated")

  // 기간
  start_date         String  @map("start_date")
  end_date           String  @map("end_date")

  order              Int     @default(0)
  resume             GlobalResume @relation(fields: [resumeId], references: [id], onDelete: Cascade)

  @@map("global_educations")
}
```

---

#### GlobalSkill (다국어 스킬)

```prisma
model GlobalSkill {
  id       String        @id @default(cuid())
  resumeId String        @map("resume_id")

  // 스킬명 (원본, 번역 불필요 - 기술 용어는 그대로)
  name     String
  level    String?       // 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'

  order    Int           @default(0)
  resume   GlobalResume  @relation(fields: [resumeId], references: [id], onDelete: Cascade)

  @@map("global_skills")
}
```

---

#### GlobalAdditionalItem (다국어 추가 항목)

```prisma
model GlobalAdditionalItem {
  id             String        @id @default(cuid())
  resumeId       String        @map("resume_id")
  type           ItemType      @default(OTHER) // 기존 enum 재사용

  // 이름 (원본 + 번역)
  name_original     String   @map("name_original")
  name_translated   String?  @map("name_translated")

  // 설명 (원본 + 번역)
  description_original    String?  @default("") @map("description_original")
  description_translated  String?  @default("") @map("description_translated")

  date           String?
  order          Int        @default(0)
  resume         GlobalResume @relation(fields: [resumeId], references: [id], onDelete: Cascade)

  @@map("global_additional_items")
}
```

---

### 1.3 새로운 Enum 정의

```prisma
// 다국어 전용 Enum (기존 Enum과 분리)
enum GlobalResumeStatus {
  IDLE
  PROCESSING
  COMPLETED
  FAILED
}

enum GlobalResumeStep {
  UPLOAD
  PROCESSING
  EDIT_ORIGINAL    // 🆕 원본 확인/수정 (기존에 없음)
  EDIT_TRANSLATION // 🆕 번역 확인/수정
  TEMPLATE
  COMPLETED
}

enum GlobalResumeTemplate {
  MODERN        // 기존 템플릿 재사용
  CLASSIC       // 기존 템플릿 재사용
  MINIMAL       // 기존 템플릿 재사용
  PROFESSIONAL  // 기존 템플릿 재사용
  EXECUTIVE     // 기존 템플릿 재사용
}
```

**차이점**:

- `EDIT_ORIGINAL`: 원본 언어 데이터 확인 단계 (영어/일본어 원문 검토)
- `EDIT_TRANSLATION`: 번역된 한국어 확인 단계
- 템플릿도 한국식 레이아웃 전용 (학력 우선, 사진 고려 등)

---

### 1.4 User 모델 (공유)

```prisma
model User {
  id               String             @id @default(cuid())
  email            String             @unique
  name             String?
  emailVerified    DateTime?
  image            String?
  phone_number     String?
  linkedin_url     String?
  portfolio_url    String?
  created_at       DateTime           @default(now())
  updated_at       DateTime           @updatedAt

  // 이용권 및 크레딧 (언어 무관 공유)
  planType         String             @default("FREE") @map("plan_type")
  planExpiresAt    DateTime?          @map("plan_expires_at")
  credits          Int                @default(10) // 🔑 단일 지갑

  // Relations
  accounts         Account[]
  sessions         Session[]
  usage_logs       UsageLog[]
  paymentHistories PaymentHistory[]
  feedbacks        Feedback[]

  // 🔑 한국향 이력서 (기존)
  resumes          Resume[]

  // 🆕 다국어 이력서 (신규)
  globalResumes    GlobalResume[]

  @@map("users")
}
```

**핵심**:

- `credits`는 단일 지갑 (한국향, 다국어 모두 공유)
- `resumes` vs `globalResumes`로 명확히 구분

---

### 1.5 PaymentHistory 모델 (공유)

```prisma
model PaymentHistory {
  id               String   @id @default(cuid())
  userId           String   @map("user_id")
  paymentId        String   @unique @map("payment_id")
  orderName        String   @map("order_name")
  amount           Float
  currency         String   @default("KRW") // 'KRW', 'USD', 'JPY'
  status           String
  method           String?  // 'CARD', 'PAYPAL', etc.
  paidAt           DateTime @default(now()) @map("paid_at")
  receiptUrl       String?  @map("receipt_url")
  initialCredits   Int      @default(0) @map("initial_credits")
  remainingCredits Int      @default(0) @map("remaining_credits")
  details          Json?

  // 🆕 구매 당시 언어 (분석용)
  purchaseLocale   String?  @default("ko") @map("purchase_locale")

  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("payment_histories")
}
```

---

### 1.6 비즈니스 로직 차이점

#### 한국향 (기존 Resume)

| 항목           | 내용                                                                |
| -------------- | ------------------------------------------------------------------- |
| **방향**       | 한국어 → 영어                                                       |
| **목적**       | 한국인이 해외 취업할 때 사용                                        |
| **사용자**     | 한국인                                                              |
| **프롬프트**   | "마케팅 브로셔처럼 어필"                                            |
| **템플릿**     | 서구식 레이아웃 (경력 우선)                                         |
| **가격**       | KRW, 국내 PG                                                        |
| **워크플로우** | Upload → AI → Edit Summary → Edit Translation → Template → Download |

#### 다국어 (GlobalResume)

| 항목           | 내용                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| **방향**       | 영어/일본어 → 한국어                                                        |
| **목적**       | 외국인이 한국 취업할 때 사용                                                |
| **사용자**     | 외국인 (영어권, 일본인)                                                     |
| **프롬프트**   | "한국 기업 문화에 맞게 겸손하게"                                            |
| **템플릿**     | 한국식 레이아웃 (학력 우선, 사진 고려)                                      |
| **가격**       | USD/JPY, PayPal                                                             |
| **워크플로우** | Upload → AI (추출→번역→정제 3단계) → Edit Translation → Template → Download |

**핵심 차이**:

- 다국어는 AI 프로세싱이 **3단계**로 구성:
  1. **추출 (Extract)**: PDF에서 텍스트 및 구조 추출
  2. **번역 (Translate)**: 원본 언어 → 한국어 번역
  3. **정제 (Refine)**: 한국 기업 문화에 맞게 톤 조정
- 프롬프트 톤이 정반대 (어필 vs 겸손)
- 템플릿은 기존 것 재사용 (MODERN, CLASSIC 등)

---

### 1.7 마이그레이션 전략

```bash
# 1. 새 테이블 생성 (기존 테이블 영향 없음)
npx prisma migrate dev --name add_global_resume_tables

# 2. 기존 데이터는 그대로 유지
# 3. 새 테이블은 비어있는 상태로 시작
# 4. 롤백 필요 시 새 테이블만 DROP
```

**완전 무위험**:

- ✅ 기존 `resumes` 테이블 전혀 건드리지 않음
- ✅ 기존 코드 전혀 수정 불필요
- ✅ 기존 서비스 100% 정상 작동 보장
- ✅ 롤백 시 `DROP TABLE global_resumes CASCADE;`만 실행

---

## 🛣️ Phase 2: 라우팅 및 API 분리

### 2.1 API 엔드포인트 분리

**기존 한국향 API** (변경 없음):

```
/api/resume          → Resume 테이블 사용
/api/resume/[id]     → Resume 테이블 사용
/api/resume/upload   → Resume 테이블 사용
```

**다국어 API** (신규):

```
/api/global-resume          → GlobalResume 테이블 사용
/api/global-resume/[id]     → GlobalResume 테이블 사용
/api/global-resume/upload   → GlobalResume 테이블 사용
```

**예시**:

```typescript
// 🆕 src/app/api/global-resume/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "en";

  const resumes = await prisma.globalResume.findMany({
    where: {
      userId: session.user.id,
      sourceLocale: locale, // 'en' or 'ja'
    },
    include: {
      work_experiences: true,
      educations: true,
      skills: true,
      additionalItems: true,
    },
    orderBy: { created_at: "desc" },
  });

  return Response.json(resumes);
}
```

---

### 2.2 라우팅 구조

```
src/app/
├── (korean)/                # 한국향 (기존)
│   ├── page.tsx            # 랜딩페이지
│   ├── dashboard/          # Resume 테이블 사용
│   ├── resume/[id]/        # Resume 테이블 사용
│   └── login/
│
├── [locale]/               # 다국어 (신규)
│   ├── page.tsx            # /en, /ja 랜딩페이지
│   ├── dashboard/          # GlobalResume 테이블 사용
│   ├── global-resume/[id]/ # GlobalResume 테이블 사용
│   └── login/
│
└── api/
    ├── resume/             # Resume 테이블 API
    └── global-resume/      # GlobalResume 테이블 API
```

**핵심**:

- 한국향: `/resume` 경로 사용
- 다국어: `/global-resume` 경로 사용
- 완전히 분리된 워크플로우

---

## 🤖 Phase 3: AI 프롬프트 분리

### 3.1 한국향 프롬프트 (기존 유지)

```typescript
// src/lib/ai/korean-resume-prompt.ts
export const KOREAN_TO_ENGLISH_PROMPT = `
You are a professional resume translator.
Translate the following Korean resume to English.

CRITICAL REQUIREMENTS:
- Make it sound like a marketing brochure
- Emphasize achievements and impact
- Use action verbs and quantifiable results
- Western-style format (experience first)

Source Resume (Korean):
{content}
`;
```

---

### 3.2 다국어 프롬프트 (신규)

```typescript
// src/lib/ai/global-resume-prompt.ts
export const ENGLISH_TO_KOREAN_PROMPT = `
You are a professional resume translator specializing in Korean job market.
Translate the following English resume to Korean.

CRITICAL REQUIREMENTS:
- Use humble and professional tone suitable for Korean corporate culture (겸손한 톤)
- Emphasize concrete achievements with numbers
- Adapt to Korean resume format:
  * Education section FIRST (학력 우선)
  * Consider photo placement (사진 고려)
  * Use formal Korean business language (존댓말)
- Avoid overly self-promotional language
- Focus on team collaboration and company contribution

Source Resume (English):
{content}

Provide the translation in JSON format with structured fields.
`;

export const JAPANESE_TO_KOREAN_PROMPT = `
일본어 이력서를 한국어로 번역합니다.
일본 기업 문화와 한국 기업 문화의 차이를 고려하여 번역하세요.

주요 요구사항:
- 일본식 겸양어(謙譲語)를 한국식 존댓말로 자연스럽게 변환
- 일본 기업 특유의 표현을 한국 기업 용어로 적응
- 연공서열 중심 → 성과 중심으로 재구성
- 한국 이력서 포맷에 맞게 조정 (학력 우선)

원본 이력서 (일본어):
{content}

JSON 형식으로 구조화된 번역 결과를 제공하세요.
`;
```

---

## 💳 Phase 4: 결제 시스템 분리

### 4.1 한국향 결제 (기존 유지)

```typescript
// src/app/api/payment/prepare/route.ts (기존)
export async function POST(request: Request) {
  const { planType } = await request.json();

  // 한국 PG (기존 로직 그대로)
  const channelKey = process.env.PORTONE_CHANNEL_KEY_KR;
  const currency = "KRW";
  const amount = planType === "PASS_7DAY" ? 9900 : 12900;

  // ...
}
```

---

### 4.2 다국어 결제 (신규 - PayPal)

```typescript
// src/app/api/global-payment/prepare/route.ts (신규)
export async function POST(request: Request) {
  const { locale, planType } = await request.json();

  // PayPal 전용
  const channelKey = process.env.PORTONE_CHANNEL_KEY_PAYPAL;

  // 언어별 통화 및 가격
  const pricing = {
    en: { currency: "USD", amount: planType === "PASS_7DAY" ? 9 : 12 },
    ja: { currency: "JPY", amount: planType === "PASS_7DAY" ? 1200 : 1500 },
  };

  const { currency, amount } = pricing[locale as keyof typeof pricing];

  // PortOne PayPal 결제
  const portone = new PortOne({
    apiSecret: process.env.PORTONE_API_SECRET!,
  });

  const payment = await portone.payment.prepare({
    storeId: process.env.PORTONE_STORE_ID_PAYPAL,
    channelKey,
    orderName: `ApplyGoGo Global ${planType}`,
    totalAmount: amount,
    currency,
    paymentMethod: "PAYPAL",
  });

  return Response.json(payment);
}
```

---

## 📊 Phase 5: 크레딧 차감 로직

### 5.1 공통 크레딧 시스템

```typescript
// src/lib/credits.ts
import { prisma } from "@/lib/prisma";

/**
 * 크레딧 차감 (한국향, 다국어 공통)
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user || user.credits < amount) {
    throw new Error("Insufficient credits");
  }

  // 크레딧 차감
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: amount } },
  });

  // 사용 로그 기록
  await prisma.usageLog.create({
    data: {
      userId,
      amount: -amount,
      description,
    },
  });
}
```

**사용 예시**:

```typescript
// 한국향 이력서 생성
await deductCredits(userId, 5, "Korean Resume AI Processing");

// 다국어 이력서 생성
await deductCredits(userId, 5, "Global Resume AI Processing (EN→KO)");
```

---

## 🧪 Phase 6: 테스트 전략

### 6.1 기존 서비스 무영향 검증

```typescript
// tests/e2e/korean-service.spec.ts
import { test, expect } from "@playwright/test";

test("기존 한국향 서비스 정상 작동", async ({ page }) => {
  // 1. 랜딩페이지 접근
  await page.goto("/");
  await expect(page).toHaveTitle(/지원고고/);

  // 2. 로그인
  await page.goto("/login");
  // ... 로그인 로직

  // 3. 대시보드 접근
  await page.goto("/dashboard");
  await expect(page.locator("h1")).toContainText("내 이력서");

  // 4. 기존 이력서 목록 표시 확인
  const resumeCards = page.locator('[data-testid="resume-card"]');
  await expect(resumeCards.first()).toBeVisible();

  // 5. 이력서 생성 플로우
  await page.click('[data-testid="create-resume-button"]');
  await page.goto("/resume/upload");
  // ... 업로드 로직

  // ✅ 모든 기존 기능이 정상 작동해야 함
});
```

---

### 6.2 다국어 서비스 격리 검증

```typescript
// tests/e2e/global-service.spec.ts
test("다국어 서비스 독립 작동", async ({ page }) => {
  // 1. 영어 랜딩페이지
  await page.goto("/en");
  await expect(page).toHaveTitle(/ApplyGoGo/);

  // 2. 영어 대시보드
  await page.goto("/en/dashboard");
  await expect(page.locator("h1")).toContainText("My Resumes");

  // 3. 한국향 이력서는 표시 안 됨
  const koreanResumes = page.locator('[data-resume-type="korean"]');
  await expect(koreanResumes).toHaveCount(0);

  // 4. 다국어 이력서만 표시
  const globalResumes = page.locator('[data-resume-type="global"]');
  await expect(globalResumes.first()).toBeVisible();
});
```

---

## 📈 Phase 7: 점진적 롤아웃

### 7.1 배포 단계

**Week 1: 데이터베이스 마이그레이션**

```bash
# 1. Staging 환경에서 마이그레이션 테스트
npx prisma migrate dev --name add_global_resume_tables

# 2. 기존 서비스 정상 작동 확인
npm run test:e2e

# 3. Production 마이그레이션
npx prisma migrate deploy
```

**Week 2: API 엔드포인트 추가**

- `/api/global-resume` 엔드포인트 배포
- Feature Flag로 비활성화 상태 유지
- 내부 테스트만 진행

**Week 3: UI 배포 (베타)**

- `/en` 경로 활성화
- 소수 베타 테스터에게만 공개
- 피드백 수집

**Week 4: 공식 런칭**

- `/en`, `/ja` 경로 전체 공개
- 마케팅 시작

---

### 7.2 Feature Flag 설정

```typescript
// src/lib/feature-flags.ts
export const FEATURES = {
  GLOBAL_RESUME: process.env.NEXT_PUBLIC_ENABLE_GLOBAL_RESUME === 'true',
} as const;

// 사용 예시
import { FEATURES } from '@/lib/feature-flags';

export function LanguageSwitcher() {
  if (!FEATURES.GLOBAL_RESUME) return null;

  return (
    <DropdownMenu>
      {/* 언어 전환 UI */}
    </DropdownMenu>
  );
}
```

**환경 변수**:

```bash
# .env (Production)
NEXT_PUBLIC_ENABLE_GLOBAL_RESUME=false  # 초기에는 비활성화

# 준비되면 활성화
NEXT_PUBLIC_ENABLE_GLOBAL_RESUME=true
```

---

## ⚠️ 리스크 분석

### 🟢 리스크 없음

1. **기존 테이블 변경 없음** → 기존 서비스 영향 0%
2. **기존 코드 변경 없음** → 버그 발생 가능성 0%
3. **독립적인 API** → 충돌 가능성 0%
4. **롤백 용이** → 새 테이블만 삭제하면 됨

### 🟡 관리 필요

1. **코드 중복**: Resume vs GlobalResume 로직 중복
   - **대응**: 공통 유틸리티 함수 추출
2. **테스트 부담**: 두 개의 워크플로우 테스트
   - **대응**: E2E 테스트 자동화
3. **데이터베이스 용량**: 테이블 2배
   - **대응**: 초기에는 무시 가능한 수준

---

## 🎯 성공 지표

### 기존 한국향 서비스 보호

- ✅ `/` 경로 검색 트래픽: 변화 없음
- ✅ 이탈률: 변화 없음
- ✅ 에러율: 증가 없음
- ✅ 응답 속도: 변화 없음

### 다국어 서비스 성장

- 🎯 `/en` 경로 MAU: 100명 이상 (3개월 내)
- 🎯 영어 → 한국어 이력서 변환: 월 50건 이상
- 🎯 PayPal 결제 성공률: 95% 이상

---

## 📝 다음 단계

1. **Prisma 스키마 작성** (`GlobalResume` 등)
2. **마이그레이션 파일 생성** 및 Staging 테스트
3. **API 엔드포인트 구현** (`/api/global-resume`)
4. **AI 프롬프트 작성** (영어→한국어, 일본어→한국어)
5. **UI 컴포넌트 구현** (`/en/dashboard` 등)

준비되시면 첫 번째 단계부터 시작하겠습니다! 🚀
