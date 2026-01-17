# 📂 Project Context: ApplyGogo (Master PRD)

> **Last Updated:** 2026-01-16
> **Status:** Active Development (Global Expansion Phase)

## 1. Product Overview (제품 개요)

- **Product Name:** ApplyGogo
- **Definition:** 영문 또는 해외 이력서(PDF)를 입력받아 AI(LLM)를 통해 **요약(Summarization), 번역(Translation), 한국 시장 최적화(Localizing)**를 수행하여 국내 대기업 및 글로벌 기업 한국 지사에 최적화된 **Global Standard 한국어 이력서(PDF)**로 변환해 주는 Micro SaaS.
- **Core Value:** 한국 채용 시장의 문법과 관행(Action Verb, 핵심 성과 중심)을 완벽히 반영하여 "한국 기업이 채용하고 싶은 인재"로 포지셔닝하는 전문적인 국문 이력서 자동 생성.
- **Design Philosophy:**
  - **Aesthetic:** Vercel & Linear-inspired Modern & Minimal Design.
  - **Values:** Clean typography, monochrome color palette with subtle accents, decluttered UI, and smooth micro-interactions.
  - **Target Audience:**
    - 한국 기업에 지원하고자 하는 글로벌 인재 (외국인 및 해외 경험자).
    - 전문적인 한국어 비즈니스 화법이 필요한 해외 거주 한인 또는 유학생.
    - 기존 번역기의 어색한 직역이나 서식 깨짐 없이 즉시 제출 가능한 국문 이력서가 필요한 유저.

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

현재 **글로벌 확장(Global Expansion)**을 위한 핵심 기능 고도화 단계입니다.

### ✅ 구현 완료 사항

- **워크플로우:** PDF 업로드 → AI 처리(Gemini API) → 요약 편집 → 번역 편집 → 템플릿 선택 → 다운로드.
- **글로벌 최적화:** `next-intl` 기반 다국어 지원, 언어 중립적 데이터 구조(`_original`, `_translated`) 구축 완료.
- **페이지:**
  - 랜딩페이지 (영어/글로벌 타겟 문구 반영), 로그인(Google Auth), 대시보드.
  - 워크플로우 페이지 (Upload, Processing, Edit, Preview).
  - 계정 관리 (프로필, 설정, 이용권 결제 및 관리, 환불 요청).
- **Backend & Infra:**
  - **Auth:** Next-Auth v5 + Google/Naver Provider + Prisma Adapter.
  - **Database:** PostgreSQL (Supabase) + Prisma ORM.
  - **AI:** Google Gemini Pro API 연동 (영문 기반 국문 분석/정제/번역).
  - **Payment:** PortOne 결제 연동 완료 (글로벌 사용자용 결제 수단 지원 예정).
- **기능:**
  - **다크모드:** 완벽 지원.
  - **이용권 시스템:** Pass(기간제) + Credit(충전) 모델 구현.
  - **피드백:** 유저 피드백 및 평점 수집 기능.

### 🚧 향후 개발 필요 (Backlog)

- [ ] **AI Refinement:** 한국 채용 시장 특유의 자기소개서 및 경력기술서 문체 고도화.
- [ ] **Payment Support:** 해외 카드 및 글로벌 페이먼트 연동 확대.
- [ ] **Template Variety:** 국내 기업 선호 양식(자유양식 상위 템플릿) 추가.

---

## 4. Business Rules & Logic (비즈니스 로직)

### 4.1 Payment Model (Pass + Credit System)

| Product               | Price (USD) | Benefits                       | Validity    | Note        |
| :-------------------- | :---------- | :----------------------------- | :---------- | :---------- |
| **Free Plan**         | Free        | **10 Credits** provided        | Unlimited   | Trial       |
| **7-Day Pass**        | **$9.00**   | **50 Credits** + Unlimited DB  | **7 Days**  | Short-term  |
| **30-Day Pass**       | **$12.00**  | **300 Credits** + Unlimited DB | **30 Days** | Recommended |
| **50 Credits Top-up** | **$3.90**   | **50 Credits** added           | Permanent   | Top-up      |

- **Credit 차감 정책:**
  - **AI Processing (이력서 생성):** 5 크레딧 차감.
  - **Re-translation (AI 재번역):** 1 크레딧 차감.
  - **Download:** 차감 없음.

### 4.2 Template Access Control

- **Free 유저:** **Modern** 템플릿만 선택 가능.
- **Pass 유저:** **All Access** (Modern, Classic, Minimal, Professional 등 모든 템플릿).

### 4.3 Cancellation & Refund Policy (취소 및 환불 규정)

- **환불 원칙:** 구매 후 7일 이내, 사용 내역이 없는 경우 전액 환불. 1회라도 크레딧 사용 시 환불 불가.

---

## 5. User Stories & Workflows (기능 명세)

### 5.1 Resume Creation Workflow (5 Steps)

1.  **Step 1: Upload (업로드)**
    - 영문/해외 이력서 PDF 업로드 (5MB 제한).
2.  **Step 2: AI Processing (처리)**
    - Gemini AI를 통한 텍스트 추출 및 한국 채용 문법에 맞는 요약/변역.
3.  **Step 3: Edit Summary (요약 편집)**
    - AI가 정제한 한국어 핵심 경력 요약 확인 및 수정.
4.  **Step 4: Edit Translation (번역 편집)**
    - **Split View:** 좌측(영문/원문) vs 우측(한국어 정제/번역문).
    - 실시간 수정 및 동기화 기반 재번역 요청.
5.  **Step 5: Preview & Download (완료)**
    - 국내 기업 선호 템플릿 선택 및 PDF 다운로드.

---

## 6. Technical Architecture (기술 아키텍처)

### 6.1 Tech Stack (Current: v1.0)

- **Framework:** Next.js 15+ (App Router).
- **Language:** TypeScript.
- **Internationalization:** `next-intl`.
- **Database:** PostgreSQL (Supabase), Prisma ORM.
- **AI:** Google Gemini Pro API (국문 로컬라이징 특화 프롬프트 적용).
- **Payment:** PortOne V2.

### 6.2 Language-Neutral Schema (이력서 모델)

다국어 확장을 위해 기존 `_kr`/`_en` 접미사 대신 언어 중립적인 필드명을 사용합니다.

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  planType      String    @default("FREE")
  planExpiresAt DateTime?
  credits       Int       @default(10)
}

model Resume {
  id                String         @id @default(cuid())
  status            ResumeStatus   @default(IDLE)
  current_step      ResumeStep     @default(UPLOAD)
  source_lang       String         @default("en") // 원본 언어

  // 공통 정보 (언어 중립 필드)
  name_original     String?
  name_translated   String?
  summary_original  String?
  summary_translated String?

  experiences       WorkExperience[]
  educations        Education[]
  // ...
}

model WorkExperience {
  id                String   @id @default(cuid())
  resumeId          String
  company_original  String
  company_translated String
  role_original     String
  role_translated   String
  bullets_original  String[]
  bullets_translated String[]
  // ...
}
```
