# 📂 Project Context: ApplyGogo (지원고고) (Master PRD)

> **Last Updated:** 2026-01-18
> **Status:** Active Development (Global Beta Phase)

## 1. Product Overview (제품 개요)

- **Product Name:** 지원고고 (ApplyGogo)
- **Definition:** 다국어 이력서(PDF)를 입력받아 AI(LLM)를 통해 **요약(Summarization), 번역(Translation), 서식화(Formatting)**를 수행하여 글로벌 스탠다드에 맞는 이력서로 변환해 주는 Micro SaaS.
- **Core Value:** "국경을 넘는 취업의 첫걸음" - 언어 장벽을 허물고 마케팅 브로셔 관점의 최적화된 이력서 자동 생성.
- **Design Philosophy:**
  - **Aesthetic:** Vercel & Linear-inspired Modern & Minimal Design.
  - **Values:** Clean typography, monochrome color palette with subtle accents, decluttered UI, and smooth micro-interactions.
  - **Target Audience:**
    - **국내 유저 (ko):** 글로벌 기업 지원을 희망하는 한국인 (한 -> 영 변환).
    - **글로벌 유저 (en, ja):** 한국 기업 취업을 희망하는 외국인 (영/일 -> 한 변환).
    - 전문적인 서식과 문장 정제(Refinement)가 필요한 경력직 지원자.

---

## 2. Implementation & Design Guidelines (구현 및 디자인 지침) ⚠️ CRITICAL

### 2.1 UI/UX 보존 및 다국어 대응 원칙

- **i18n 적용:** 모든 유저 노출 텍스트는 `next-intl`을 통해 관리하며, `ko`, `en`, `ja` 로캘을 지원합니다.
- **Locale-aware Routing:** `/[locale]/...` 구조의 다이나믹 라우팅을 준수합니다.
- **Look & Feel 유지:** 다국어 텍스트 길이에 따른 레이아웃 깨짐을 방지하기 위해 유연한 디자인 시스템을 유지합니다. HTML 태그가 포함된 번역은 `t.rich()`를 사용하여 안전하게 렌더링합니다.

### 2.2 Global Business Logic

- **통화 및 가격:** 로캘에 따라 원화(₩) 또는 달러($)를 자동 적용합니다.
- **AI 프롬프트 분리:** 로캘별 최적화된 추출/번역 프롬프트를 사용합니다 (`src/lib/global-prompts.ts` 활용).

---

## 3. Current Status (현재 구현 상태)

현재 **글로벌 확장 및 다국어 최적화**가 완료된 Beta 단계입니다.

### ✅ 구현 완료 사항 (글로벌 대응 포함)

- **다국어 지원 (i18n):** 한국어, 영어, 일본어 완벽 지원 및 언어별 UI/UX 최적화.
- **글로벌 결제:** 로캘별 가격 차별화 (KRW/USD) 및 PortOne 기반 결제 연동.
- **워크플로우:** PDF 업로드 → AI 언어 감지 및 추출 → 요약/번역 편집 → 템플릿 선택 → PDF 다운로드.
- **AI 로직 고도화:** `src/lib/global-prompts.ts`를 통한 글로벌 전용 프롬프트 관리.
- **베타 프로모션:** 3일 무제한 패스 프로모션 연장 (2026.01.25까지).

---

## 4. Business Rules & Logic (비즈니스 로직)

### 4.1 Payment Model (Pass + Credit System)

| 상품명 (Product)     | 한국 (ko)    | 글로벌 (en, ja) | 제공 혜택              | 유효 기간 |
| :------------------- | :----------- | :-------------- | :--------------------- | :-------- |
| **Free Plan**        | 무료         | Free            | 가입 시 10 크레딧      | 무제한    |
| **7일 이용권**       | **9,900원**  | **$9**          | 50 크레딧 + 무제한 DB  | 7일       |
| **30일 이용권**      | **12,900원** | **$12**         | 300 크레딧 + 무제한 DB | 30일      |
| **크레딧 충전 (50)** | **3,900원**  | **$4**          | 50 크레딧 추가         | 영구      |

- **베타 혜택:** 프로모션 기간 내 가입 시 3일 무제한 이용권 제공.

### 4.2 Localized AI Processing

- **ko 로캘:** 한국어 이력서를 업로드받아 영문 이력서로 변환.
- **en/ja 로캘:** 영문 또는 일문 이력서를 업로드받아 한국어 이력서로 변환 (한국 취업 타겟).
- **검증:** 업로드된 파일의 언어가 현재 로캘 설정과 일치하지 않을 경우 유효성 에러 반환.

---

## 5. User Stories & Workflows (기능 명세)

### 5.1 Resume Creation Workflow

1. **Step 1: Upload (업로드)**
   - 로캘에 맞는 언어의 PDF 파일 업로드 (5MB 제한).
2. **Step 2: AI Extraction & Translation (AI 처리)**
   - `global-prompts.ts`의 로직에 따라 타겟 언어로 번역 및 경력 추출.
3. **Step 3: Edit Summary & Experience (편집)**
   - 원문과 번역문을 비교하며 편집할 수 있는 Split View 제공.
4. **Step 4: Preview & Download (완료)**
   - 글로벌 기준에 맞는 템플릿 선택 및 PDF 생성.

---

## 6. Technical Architecture (기술 아키텍처)

### 6.1 Tech Stack (Current: v1.1)

- **Framework:** Next.js 16.1 (App Router)
- **i18n:** `next-intl` (Locale-aware routing & translation)
- **Authentication:** Auth.js v5 Beta (Google, Email/Magic Link)
- **Database:** PostgreSQL (Supabase), Prisma ORM v7.2
- **AI:** Google Gemini 1.5 Pro (Custom Prompts for i18n)
- **Payment:** PortOne V2 (Multi-currency support)

### 6.2 Key Directories

- `src/messages/`: 로캘별 번역 파일 (.json)
- `src/lib/global-prompts.ts`: 글로벌 타겟 AI 프롬프트 로직
- `src/components/i18n/`: 다국어 관련 공통 컴포넌트
