# 📂 Project Context: ApplyGogo (가칭) (Master PRD)

> **Last Updated:** 2026-01-12
> **Status:** Active Development (Beta Phase)

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

현재 **핵심 기능 구현 및 백엔드 연동**이 진행 중인 Beta 단계입니다.

### ✅ 구현 완료 사항

- **워크플로우:** PDF 업로드 → AI 처리(Gemini API) → 요약 편집 → 번역 편집 → 템플릿 선택 → 다운로드.
- **페이지:**
  - 랜딩페이지, 로그인(Google Auth), 대시보드.
  - 워크플로우 페이지 (Upload, Processing, Edit, Preview).
  - 계정 관리 (프로필, 설정, 이용권 결제 및 관리, 환불 요청).
- **Backend & Infra:**
  - **Auth:** Next-Auth (Auth.js 5) + Google Provider + Prisma Adapter.
  - **Database:** PostgreSQL (Supabase) + Prisma ORM.
  - **AI:** Google Gemini Pro API 연동 완료 (번역/요약).
  - **Payment:** PortOne 결제 연동 완료 (이용권 구매).
- **기능:**
  - **다크모드:** 시스템 연동 및 수동 토글 완벽 지원.
  - **이용권 시스템:** Pass(기간제) + Credit(충전) 모델 구현.
  - **피드백:** 유저 피드백 및 평점 수집 기능.

### 🚧 향후 개발 필요 (Backlog)

- [ ] **Refinement:** AI 번역 퀄리티 튜닝 및 프롬프트 개선.
- [ ] **Mobile Optimization:** 모바일 웹 뷰 디테일 개선.
- [ ] **Performance:** 대용량 PDF 처리 최적화.

---

## 4. Business Rules & Logic (비즈니스 로직)

### 4.1 Payment Model (Pass + Credit System)

기존 구독 모델에서 **기간제 이용권(Pass)** 모델로 변경되었습니다.

| 상품명 (Product)     | 가격 (VAT 포함) | 제공 혜택                  | 유효 기간 | 비고          |
| :------------------- | :-------------- | :------------------------- | :-------- | :------------ |
| **Free Plan** (기본) | 무료            | 가입 시 **10 크레딧** 제공 | 무제한    | 체험용        |
| **7일 이용권**       | **9,900원**     | **50 크레딧** + 무제한 DB  | **7일**   | 단기 집중용   |
| **30일 이용권**      | **12,900원**    | **300 크레딧** + 무제한 DB | **30일**  | 여유로운 준비 |
| **크레딧 충전 (50)** | **3,900원**     | **50 크레딧** 추가         | 영구      | 부족 시 충전  |

- **Credit 차감 정책:**
  - **AI Processing (이력서 생성):** 5 크레딧 차감.
  - **Re-translation (AI 재번역):** 1 크레딧 차감.
  - **Download:** 차감 없음(무제한).

### 4.2 Template Access Control

- **Free 유저:** **Modern** 템플릿만 선택 가능. (Classic, Minimal 잠금)
- **Pass 유저 (7일/30일):** **All Access** (Modern, Classic, Minimal, Professional 등 모든 템플릿 사용 가능).
- **Upsell:** Free 유저가 잠긴 템플릿 선택 시 이용권 구매 팝업 노출.

### 4.3 Cancellation & Refund Policy (취소 및 환불 규정)

- **환불 원칙:**
  - **전액 환불:** 구매 후 **7일 이내**이며, **사용 내역(크레딧 차감, AI 생성 등)이 전혀 없는 경우**.
  - **환불 불가:** 7일이 경과했거나, 1회라도 크레딧을 사용한 경우 (부분 환불 없음).
- **프로세스:**
  - 사용자가 '설정 > 결제 내역'에서 조건 충족 시 '환불 요청' 버튼 활성화.
  - 즉시 환불 처리(Optimistic UI) 및 이용권 권한 회수.

---

## 5. User Stories & Workflows (기능 명세)

### 5.1 Resume Creation Workflow (5 Steps)

1.  **Step 1: Upload (업로드)**
    - PDF 파일 드래그 앤 드롭 (5MB 제한).
2.  **Step 2: AI Processing (처리)**
    - Gemini AI를 통한 텍스트 추출, 요약, 번역 수행.
3.  **Step 3: Edit Summary (요약 편집)**
    - AI가 추출한 핵심 경력 요약 확인 및 수정 (Bullet points).
4.  **Step 4: Edit Translation (번역 편집)**
    - **Split View:** 좌측(한글 원본) vs 우측(영문 번역).
    - AI 번역 결과 수정 및 재번역 요청.
5.  **Step 5: Preview & Download (완료)**
    - 템플릿 선택 (플랜에 따라 제한).
    - 실시간 미리보기 및 PDF 다운로드.

### 5.2 Key Features Update

- **피드백 시스템:** 사이드바 메뉴를 통해 서비스 개선 요청 및 버그 리포트 제출 가능.
- **결제 관리:** 이용권 구매 내역 확인, 영수증 출력(PortOne), 환불 요청 기능.

---

## 6. Technical Architecture (기술 아키텍처)

### 6.1 Tech Stack (Current: v1.0)

- **Framework:** Next.js 16.1 (App Router).
- **Language:** TypeScript 5.9.
- **Authentication:** Auth.js (Next-Auth) v5 Beta.
- **Styling:** Tailwind CSS v4, Shadcn UI, Motion (Framer Motion).
- **Database:** PostgreSQL (Supabase), Prisma ORM v7.2.
- **AI:** Google Gemini Pro API (`gemini-1.5-pro` or latest).
- **PDF Generation:** `@react-pdf/renderer`.
- **Payment:** PortOne V2 SDK.

### 6.2 Database Schema (Current Status)

`prisma/schema.prisma`의 주요 모델 구조입니다.

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  // ...Auth fields...

  // Pass & Credits
  planType      String    @default("FREE") // 'FREE', 'PASS_7DAY', 'PASS_30DAY'
  planExpiresAt DateTime? // 이용권 만료일
  credits       Int       @default(10)

  resumes       Resume[]
  paymentHistories PaymentHistory[]
}

model PaymentHistory {
  id              String   @id @default(cuid())
  userId          String
  status          String   // 'PAID', 'REFUNDED', etc.
  amount          Float
  initialCredits  Int      @default(0) // 구매 당시 지급된 크레딧 (환불 검증용)
  remainingCredits Int     @default(0) // 해당 결제로 지급된 크레딧 중 잔여량
  // ...
}

model Resume {
  id              String         @id @default(cuid())
  status          ResumeStatus   @default(IDLE)
  current_step    ResumeStep     @default(UPLOAD)
  selected_template ResumeTemplate?
  // ...Content fields (Summary, WorkExperience, etc.)
}

model Feedback {
  id        String   @id @default(cuid())
  content   String
  rating    Int
  // ...
}
```
