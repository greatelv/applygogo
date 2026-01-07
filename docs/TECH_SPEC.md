# 📘 ApplyGogo (가칭) Technical Specification (v2.0)

## 1. 개요 (Overview)

- **Product Name:** 지원고고 (ApplyGogo) (가칭)
- **Description:** 한국어 이력서(PDF)를 입력받아 AI(LLM)를 통해 **요약(Summarization), 번역(Translation), 서식화(Formatting)**를 수행하여 Global Standard에 맞는 영문 이력서(PDF)로 변환해 주는 Micro SaaS.
- **Target:** 글로벌 취업을 희망하거나 급하게 영문 이력서가 필요한 한국인 구직자.

## 2. 기술 스택 (Tech Stack)

### 2.1 Production Stack (Planned)

- **Frontend & Backend:** Next.js 16 (App Router), TypeScript, **Tailwind CSS v4**.
- **UI Library:** **Shadcn UI** (New York Style, Zinc Theme).
- **Styling:** Tailwind Utility First (CSS Modules for rare exceptions).
- **Database:** PostgreSQL (Supabase or Neon).
- **ORM:** Prisma.
- **AI Engine:** Google Gemini Pro API (Structured Output).
- **Auth:** Auth.js (NextAuth) v5 - Google Provider.
- **Storage:** AWS S3 compatible (Supabase Storage) - PDF 원본 및 결과물 저장.
- **Payment:** PortOne (Billing Key 방식).

---

## 2.2 UI/UX Design Strategy (Linear/Vercel Style)

- **Basis:** Figma Prototype 기반으로 구현된 기존 디자인 계승.
- **Theme:** Minimalist, Content-First.
- **Typography:** **Inter** (Google Fonts) - Clean, legible, professional.
- **Color Palette:**
  - **Background:** Pure White (`#FFFFFF`) / Hints of Gray (`#FAFAFA`).
  - **Foreground:** High contrast Text (`#171717`), Muted Text (`#737373`).
  - **Accents:** Subtle Primary Brand Color (e.g., Indigo or Monochrome Black).
  - **Borders:** Thin, subtle borders (`#E5E5E5`).
- **Components:**
  - **Buttons:** Sharp or slightly rounded corners, subtle hover states.
  - **Inputs:** Minimalist with focus rings.
  - **Cards:** Flat or subtle shadow (`shadow-sm`).
- **Interactions:** Fast, snappy transitions, skeleton loaders instead of spinners.

---

## 3. 데이터베이스 설계 (Database Schema)

구독 상태 관리의 정합성과 이력서 데이터의 다국어 병기(Side-by-Side) 편집을 지원하기 위한 스키마입니다. (PRD v2.0 반영)

### 3.1 Users & Auth

사용자 기본 정보 및 영문 이력서 헤더에 들어갈 프로필 정보를 관리합니다.

| Table     | Column          | Type     | Description                |
| --------- | --------------- | -------- | -------------------------- |
| **Users** | `id`            | UUID     | PK                         |
|           | `email`         | String   | Unique Email               |
|           | `name`          | String   | 사용자 이름                |
|           | `provider`      | String   | 'google'                   |
|           | `provider_id`   | String   | OAuth Sub ID               |
|           | `phone_number`  | String   | 이력서용 연락처 (Optional) |
|           | `linkedin_url`  | String   | 이력서 헤더용 (Optional)   |
|           | `portfolio_url` | String   | 이력서 헤더용 (Optional)   |
|           | `created_at`    | DateTime | 가입일                     |

### 3.2 Subscription & Billing

**2-Tier Plan (Free, Pro)** 구조를 지원합니다.

| Table             | Column                     | Type     | Description                               |
| ----------------- | -------------------------- | -------- | ----------------------------------------- |
| **Plans**         | `code`                     | String   | PK ('FREE', 'PRO')                        |
|                   | `monthly_quota`            | Double   | 월 제공 크레딧 (3.0, 100.0)               |
|                   | `max_resumes`              | Int      | 이력서 보관 개수 (1, -1=무제한)           |
| **Subscriptions** | `id`                       | UUID     | PK                                        |
|                   | `user_id`                  | UUID     | FK (Users)                                |
|                   | `plan_code`                | String   | FK (Plans)                                |
|                   | `status`                   | Enum     | 'ACTIVE', 'PAST_DUE', 'CANCELED'          |
|                   | `current_period_start`     | DateTime | 현재 결제 주기 시작일                     |
|                   | **`current_period_end`**   | DateTime | **권한 만료 예정일**                      |
|                   | **`cancel_at_period_end`** | Boolean  | **해지 예약 여부 (True면 만료일에 해지)** |
|                   | `billing_key`              | String   | 정기 결제용 빌링키                        |

### 3.3 Resume Core (State Machine)

5단계 워크플로우(`UPLOAD` -> `PROCESSING` -> `EDIT` -> `TEMPLATE` -> `COMPLETED`)를 반영합니다.

| Table       | Column                | Type     | Description                                             |
| ----------- | --------------------- | -------- | ------------------------------------------------------- |
| **Resumes** | `id`                  | UUID     | PK                                                      |
|             | `user_id`             | UUID     | FK (Users)                                              |
|             | `title`               | String   | 프로젝트명                                              |
|             | `original_file_url`   | String   | 업로드된 PDF 경로                                       |
|             | `target_role`         | String   | 지원 희망 직무 (프롬프트 튜닝용)                        |
|             | `status`              | Enum     | 'IDLE', 'PROCESSING', 'COMPLETED', **'FAILED'**         |
|             | **`failure_message`** | String   | **AI 처리 실패 사유 (User Feedback용)**                 |
|             | `current_step`        | Enum     | 'UPLOAD', 'PROCESSING', 'EDIT', 'TEMPLATE', 'COMPLETED' |
|             | `selected_template`   | Enum     | 'MODERN', 'CLASSIC', 'MINIMAL'                          |
|             | `updated_at`          | DateTime | 최종 수정일                                             |

### 3.4 Resume Details (Data)

한글(Source)과 영문(Target)을 1:1로 매핑하여 Split View 편집을 지원합니다.

| Table               | Column                | Type   | Description                                |
| ------------------- | --------------------- | ------ | ------------------------------------------ |
| **WorkExperiences** | `id`                  | UUID   | PK                                         |
|                     | `resume_id`           | UUID   | FK                                         |
|                     | `company_name_kr`     | String | 회사명 (한글)                              |
|                     | **`company_name_en`** | String | **회사명 (영문 번역)**                     |
|                     | `role_kr`             | String | 직무 (한글)                                |
|                     | **`role_en`**         | String | **직무 (영문 번역)**                       |
|                     | `start_date`          | String | YYYY.MM                                    |
|                     | `end_date`            | String | YYYY.MM or Present                         |
|                     | `bullets_kr`          | JSONB  | `["성과1", "성과2"]` (한글 원본/수정본)    |
|                     | **`bullets_en`**      | JSONB  | **`["Result1", "Result2"]` (영문 번역본)** |
|                     | `order`               | Int    | 정렬 순서                                  |

---

## 4. 핵심 비즈니스 로직 (Core Business Logic)

### 4.1 작업 흐름 (5-Step Workflow)

유저는 각 단계(`current_step`)에 따라 순차적으로 진행하며, 이전 단계로 돌아가 데이터를 수정할 수 있습니다.

1.  **UPLOAD:**
    - PDF 업로드 및 유효성 검사.
    - `Resumes` 레코드 생성 (Status: IDLE).
2.  **AI PROCESSING:**
    - **Trigger:** 사용자가 "처리 시작" 버튼 클릭.
    - **Action:** PDF 텍스트 추출 -> Gemini Pro API 호출 (요약 및 번역 수행).
    - **Quota:** **이 시점에 1.0 크레딧 차감.**
    - **Status:** PROCESSING -> 완료 시 EDIT으로 자동 전환.
3.  **EDIT (실시간 편집):**
    - **UI:** Split View (좌측 한글 / 우측 영문).
    - **Logic:** `WorkExperiences`의 `bullets_kr`/`bullets_en`을 contenteditable로 수정.
    - **Re-translation:** 특정 항목 재번역 요청 시 **0.5 크레딧 차감**.
    - 데이터 변경 시 자동 저장.
4.  **TEMPLATE SELECTION:**
    - **Logic:** `Resumes.selected_template` 업데이트.
    - **Access Control:**
      - Free: Modern, Classic.
      - Pro: Modern, Classic, Minimal (Pro Only).
5.  **COMPLETED:**
    - 최종 PDF 생성 및 다운로드.
    - 이력서 보관함에 저장 확인.
    - **Quota:** 다운로드 시 차감 없음.

### 4.2 구독 및 쿼타 정책 (Subscription Policy)

- **크레딧 차감 정책:**
  - AI Processing (전체 처리): **-1.0 Credit**
  - AI Re-translation (재번역): **-0.5 Credit**
- **쿼타 상세:**
  - `FREE` 플랜: 월 3.0 크레딧 제공.
  - `PRO` 플랜: 월 100.0 크레딧 제공. (사실상 무제한급)
  - 잔여 쿼타 = `Plan.monthly_quota` - `Sum(UsageLogs.amount where current_month)`.
- **해지 로직 (Grace Period):**
  - 유저가 해지 요청 시: `cancel_at_period_end` = `true`로 설정.
  - Daily Batch Job: `current_period_end` < `Now()` AND `cancel_at_period_end` is `true` 인 구독을 찾아 `status` = 'CANCELED'로 변경 및 권한 박탈.

---

## 5. API 설계 가이드 (Server Actions / Route Handlers)

Next.js App Router 사용을 가정합니다.

| Method     | Endpoint                       | Description                                            |
| ---------- | ------------------------------ | ------------------------------------------------------ |
| **POST**   | `/api/resumes/upload`          | PDF 업로드, Resume 생성 (Step 1)                       |
| **POST**   | `/api/resumes/{id}/process`    | **[AI]** 텍스트 추출+요약+번역 실행 (Step 2, Quota -1) |
| **PUT**    | `/api/resumes/{id}/experience` | 유저의 한글/영문 데이터 수동 수정 저장 (Step 3)        |
| **PATCH**  | `/api/resumes/{id}/template`   | 템플릿 선택 업데이트 (Step 4)                          |
| **GET**    | `/api/resumes/{id}/preview`    | 선택된 템플릿으로 PDF Preview 생성                     |
| **POST**   | `/api/billing/subscription`    | 구독 생성 및 변경 (PortOne Webhook)                    |
| **DELETE** | `/api/billing/subscription`    | 구독 해지 예약 (`cancel_at_period_end = true`)         |

---

## 6. 개발 우선순위 (Implementation Phases)

1. **Phase 1 (Core MVP):**

   - 회원가입/로그인 (Google).
   - PDF 텍스트 추출 + Gemini API 연동.
   - 5단계 워크플로우 기본 구현.
   - 무료 플랜 로직 적용.

2. **Phase 2 (Payment & Polish):**

   - PG사 연동 및 2-Tier 구독 모델 구현.
   - 이력서 템플릿 5종 디자인 및 PDF 생성기 구현.
   - 템플릿별 접근 제어 로직.

3. **Phase 3 (Optimization):**
   - SEO 최적화.
   - One-Click 기능 안정화 (Background Job).

이 문서는 **2026년 1월 6일 기준**의 PRD v2.0 요구사항을 반영하고 있습니다.
