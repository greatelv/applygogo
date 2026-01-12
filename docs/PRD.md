# 📂 Project Context: ApplyGogo (가칭) (Master PRD)

> **Last Updated:** 2026-01-07
> **Status:** Active Development (Phase 2 Preparation)

## 1. Product Overview (제품 개요)

- **Product Name:** 지원고고 (ApplyGogo) (가칭)
- **Definition:** 한국어 이력서(PDF)를 입력받아 AI(LLM)를 통해 **요약(Summarization), 번역(Translation), 서식화(Formatting)**를 수행하여 Global Standard에 맞는 영문 이력서(PDF)로 변환해 주는 Micro SaaS.
- **Core Value:** "나를 채용해야 하는 이유"를 증명하는 마케팅 브로셔 관점의 영문 이력서 자동 생성.
- **Design Philosophy:**
  - **Aesthetic:** Vercel & Linear-inspired Modern & Minimal Design.
  - **Values:** Clean typography, monochrome color palette with subtle accents, decluttered UI, and smooth micro-interactions.
  - **Target Audience:**
    - 글로벌 기업 지원자 (영어 이력서 작성에 부담을 느끼는 한국인).
    - 급하게 영문 이력서를 제출해야 하는 직장인.
    - 기존 번역기/LLM 채팅의 한계(PDF 미지원, 서식 깨짐)를 느끼는 유저.

---

## 2. Implementation & Design Guidelines (구현 및 디자인 지침) ⚠️ CRITICAL

이 프로젝트의 프론트엔드 코드는 **Figma에서 정교하게 설계된 프로토타입**을 기반으로 합니다. 향후 개발 시 다음 원칙을 **반드시** 준수해야 합니다.

### 2.1 UI/UX 보존 원칙 (UI Preservation)

> **"Look & Feel을 절대 변경하지 마세요."**

- **현재 디자인 유지:** 컴포넌트의 레이아웃, 여백(Spacing), 타이포그래피, 색상, 인터랙션 등 시각적 요소를 임의로 변경하거나 "개선"하려 하지 마세요.
- **구조 유지:** `src/app/components` 내의 기존 컴포넌트 구조를 최대한 재사용하세요.
- **스타일 변경 금지:** Tailwind 클래스나 CSS 변수를 불필요하게 수정하여 기존 디자인이 깨지는 일이 없도록 주의하세요.

### 2.2 데이터 연동 전략 (Data Integration Strategy)

> **"껍데기는 그대로, 내용물만 실제 데이터로 교체하세요."**

- 현재의 하드코딩된 Mock Data나 로컬 상태(useState)를 실제 백엔드 API 데이터(Supabase/React Query)로 교체하는 것에 집중하세요.
- **Skeleton Loading:** 데이터 로딩 중에는 기존 디자인의 Layout을 유지하는 Skeleton UI를 적극 활용하여 Layout Shift를 방지하세요.

---

## 3. Current Status (현재 구현 상태)

현재 **프론트엔드 프로토타입 (v1.0)** 구현이 완료된 상태입니다.

### ✅ 구현 완료 사항

- **워크플로우 전체:** PDF 업로드 → AI 처리(Mock) → 요약 편집 → 번역 편집(Split View) → 템플릿 선택 → 다운로드.
- **페이지:**
  - 랜딩페이지, 로그인, 대시보드 (이력서 목록).
  - 워크플로우 페이지 (Upload, Processing, Edit, Preview).
  - 계정 관리 (프로필, 설정, 결제 관리, 도움말).
- **기능:**
  - **다크모드:** 시스템 연동 및 수동 토글 완벽 지원.
  - **반응형:** 데스크톱(사이드바) / 모바일(햄버거 메뉴) 대응.
  - **편집기:** `contenteditable` 기반의 실시간 텍스트 수정.

### 🚧 향후 개발 필요 (Backlog)

- [ ] **Backend:** Next.js API Routes, Supabase 연동.
- [ ] **AI:** Google Gemini API 연동 (요약/번역 실제 처리).
- [ ] **PDF:** 실제 PDF 파일 파싱 및 생성 로직.
- [ ] **Auth:** 실제 Google OAuth 연동.
- [ ] **Payment:** PortOne 결제 연동.

---

## 4. Business Rules & Logic (비즈니스 로직)

### 4.1 Subscription Model (2-Tier Strategy)

| Plan                | Price (VAT 포함) | Credits    | Storage | Template Access    | 비고          |
| :------------------ | :--------------- | :--------- | :------ | :----------------- | :------------ |
| **Free** (체험)     | 무료             | 월 **10**  | 1개     | Modern, Classic    | 서비스 체험용 |
| **Pro** (합격 패스) | 월 **9,900원**   | 월 **100** | 무제한  | **All** (+Minimal) | 파워 유저용   |

- **Credit 차감 정책:**
  - **AI Processing (생성):** 5 크레딧 차감.
  - **Re-translation (재번역):** 1 크레딧 차감.
  - **Download:** 차감 없음.

### 4.2 Template Access Control

- **Free 유저:** Modern, Classic 템플릿만 선택 가능.
- **Pro 유저:** 모든 템플릿(Minimal 포함) 선택 가능.
- **Upsell:** Free 유저가 Pro 템플릿 선택 시 업그레이드 유도 UI 표시.

---

## 5. User Stories & Workflows (기능 명세)

### 5.1 Resume Creation Workflow (5 Steps)

1.  **Step 1: Upload (업로드)**
    - PDF 파일 드래그 앤 드롭 또는 선택.
    - 유효성 검사 (10MB 제한).
2.  **Step 2: AI Processing (처리)**
    - 진행율 표시 (Parsing → Summary → Review → Translating).
    - 6~7초 후 자동 전환 (Mock).
3.  **Step 3: Edit Summary (요약 편집)**
    - AI가 추출한 핵심 경력 요약 확인.
    - 불릿 포인트 추가/삭제/수정.
4.  **Step 4: Edit Translation (번역 편집)**
    - **Split View:** 좌측(한글 원본) vs 우측(영문 번역).
    - 영문 텍스트 직접 수정 가능.
5.  **Step 5: Preview & Download (완료)**
    - 템플릿 변경에 따른 실시간 미리보기.
    - 최종 PDF 다운로드.

### 5.2 Key User Stories

#### Epic 1: Auth & Onboarding

- **Story 1.2:** 사용자는 Google 계정으로 원클릭 가입/로그인을 할 수 있어야 한다. (Auth.js)

#### Epic 2: Resume Management

- **Story 2.6:** 사용자는 대시보드에서 내 이력서 목록을 상태별(완료, 진행중)로 확인하고 관리할 수 있어야 한다.

#### Epic 3: Payment

- **Story 3.1:** 사용자는 '결제 관리' 페이지에서 자신의 플랜과 잔여 크레딧을 확인하고, Pro 플랜으로 업그레이드할 수 있어야 한다.
- **Story 3.2 (Future):** 구독 해지 시 즉시 종료되지 않고, 결제 주기 말일(`cancel_at_period_end`)까지 권한이 유지되어야 한다.

---

## 6. Technical Architecture (기술 아키텍처)

### 6.1 Tech Stack (Migration Target: v2.0)

- **Frontend/Backend:** Next.js 16 (App Router), TypeScript.
- **Rendering Strategy:**
  - **Public Pages (Landing, Login)**: Server-Side Rendering (SSR) for SEO.
  - **Authenticated Pages (/resumes/**)**: **Client-Side Rendering (SSR Disabled)\*\* via `next/dynamic` (`ssr: false`) to prevent hydration mismatches and handle complex client-side state.
- **Styling:** Tailwind CSS v4, Shadcn UI.
- **Database:** PostgreSQL (Supabase), Prisma ORM.
- **AI:** Google Gemini Pro API (Model: `gemini-2.5-flash` - **DO NOT CHANGE**).
- **Storage:** Supabase Storage (AWS S3 Compatible).

### 6.2 Database Schema (Prisma Draft)

```prisma
// User & Auth
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  provider      String    // 'google'
  providerId    String
  createdAt     DateTime  @default(now())

  subscription  Subscription?
  resumes       Resume[]
}

// Subscription (2-Tier)
model Plan {
  code          String    @id // 'FREE', 'PRO'
  monthlyQuota  Float
  maxResumes    Int       // -1 for unlimited
  subscriptions Subscription[]
}

model Subscription {
  id                String    @id @default(uuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id])
  planCode          String
  plan              Plan      @relation(fields: [planCode], references: [code])

  status            String    // 'ACTIVE', 'CANCELED', 'PAST_DUE'
  currentPeriodEnd  DateTime
  cancelAtPeriodEnd Boolean   @default(false)
}

// Resume Core
model Resume {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])

  status          String    // 'IDLE', 'PROCESSING', 'COMPLETED', 'FAILED'
  currentStep     String    // 'UPLOAD', 'PROCESSING', 'EDIT', 'TEMPLATE', 'COMPLETED'
  selectedTemplate String   // 'MODERN', 'CLASSIC', 'MINIMAL'

  workExperiences WorkExperience[]
}

### 4.3 Cancellation & Refund Policy (취소 및 환불 규정)

- **환불 원칙:**
  - **전액 환불:** 구매 후 7일 이내이며 하위 이용 내역이 전혀 없는 경우 (크레딧 미사용, AI 처리 미수행).
  - **환불 불가:** 7일이 경과했거나, 1회 이상의 크레딧 사용 또는 AI 처리가 발생한 경우 (디지털 콘텐츠 특성상 부분 환불 없음).
- **프로세스:**
  - 사용자가 설정 페이지에서 직접 '환불 요청' 버튼을 통해 접수.
  - 조건 충족 시 API를 통해 자동 환불 및 이용권 권한 즉시 회수.

---

## 7. Design System (디자인 시스템)

`/src/styles/theme.css`에서 CSS 변수로 색상을 관리합니다. 디자인 일관성을 위해 Tailwind 유틸리티 대신 정의된 변수(`bg-background`, `text-foreground` 등)를 사용하세요.

### 7.1 Key Colors

- **Background:** `bg-background` (White / Black)
- **Foreground:** `text-foreground` (Black / White)
- **Primary:** `bg-primary` (Brand Color)
- **Muted:** `bg-muted` (Subtle grays for secondary UI)
- **Border:** `border-border`

### 7.2 Dark Mode

시스템 설정을 따르거나 유저가 명시적으로 토글할 수 있습니다 (`next-themes`). 모든 컴포넌트는 다크모드에서의 가독성을 고려하여 구현되어야 합니다.

---

## 8. Directory Structure (참고)

```

src/
├── app/
│ ├── components/ # Presentational Components (Keep UI as is!)
│ │ ├── ui/ # Shadcn UI Primitives
│ │ ├── ...pages... # Page Templates
│ └── ...
├── styles/
│ ├── theme.css # Design Tokens (CSS Variables)
│ └── tailwind.css

```

```
