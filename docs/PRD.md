# 📂 Project Context: ApplyGogo (가칭) (Master PRD - v2.0)

## 1. Product Overview

- **Product Name:** 지원고고 (ApplyGogo) (가칭)
- **Definition:** 한국어 이력서(PDF)를 입력받아 AI(LLM)를 통해 **요약(Summarization), 번역(Translation), 서식화(Formatting)**를 수행하여 Global Standard에 맞는 영문 이력서(PDF)로 변환해 주는 Micro SaaS.
- **Core Value:** "나를 채용해야 하는 이유"를 증명하는 마케팅 브로셔 관점의 영문 이력서 자동 생성.
- **Design Philosophy:**
  - **Aesthetic:** Vercel & Linear-inspired Modern & Minimal Design.
  - **Values:** Clean typography, monochrome color palette with subtle accents, decluttered UI, and smooth micro-interactions.
  - **Goal:** 세련된 SaaS 디자인이 나왔으면 한다.
  - **Dark Mode:** 시스템 설정 연동 및 토글 지원으로 사용자 선호도 반영.
- **Target Audience:**
  - 글로벌 기업 지원자 (영어 이력서 작성에 부담을 느끼는 한국인).
  - 급하게 영문 이력서를 제출해야 하는 직장인.
  - 기존 번역기/LLM 채팅의 한계(PDF 미지원, 서식 깨짐)를 느끼는 유저.

## 2. Technical Stack & Constraints (For AI Engineer)

이 프로젝트는 다음 기술 스택을 기반으로 **프론트엔드 프로토타입**으로 구현되었다.

### 2.1. Current Implementation (v1.0 Prototype)

- **Frontend:** React 18 + Vite, TypeScript, **Tailwind CSS v4**, **Shadcn UI**.
- **State Management:** React useState/Context (Local State).
- **Routing:** Client-side page navigation (SPA).
- **Auth:** Mock Google OAuth UI (실제 인증 없음).
- **AI Engine:** Mock Processing (실제 API 호출 없음, 시뮬레이션).
- **Storage:** Browser Memory (새로고침 시 데이터 손실).
- **Theme:** next-themes (다크모드 지원).
- **Icons:** lucide-react.
- **Deployment:** Vercel (Static Hosting).

### 2.2. Future Production Stack (v2.0 Roadmap)

실제 서비스 런칭 시 다음 기술로 전환 예정:

- **Frontend/Backend:** Next.js 16 (App Router), TypeScript.
- **Database:** PostgreSQL (Supabase or Neon), Prisma ORM.
- **Auth:** Auth.js v5 (Google OAuth).
- **AI Engine:** Google Gemini Pro API (Structured Output).
- **Storage:** AWS S3 Compatible (Supabase Storage) - PDF 파일 관리.
- **Payments:** PortOne (Subscription Model).
- **Deployment:** Vercel.

> **⚠️ Note:** 현재 버전은 **기능 검증 및 UX 테스트를 위한 인터랙티브 프로토타입**입니다.

## 3. Business Rules & Logic

### 3.1. Subscription Model (3-Tier Strategy)

다양한 사용자 니즈를 고려하여 **단계별 플랜 구조**를 제공한다.

- **Quota Cost:**

  - 복잡한 차감 로직(1, 2점 등)을 제거하고, 횟수 기반으로 단순화.
  - 1회 = 업로드 → AI 처리 → 편집 → 템플릿 선택 → PDF 다운로드 전체 워크플로우.

- **Plan Tiers:**

1. **Free (체험):**

   - 월 **2회** 전체 기능 이용 가능.
   - 이력서 보관 1개.
   - 모든 템플릿 중 **Basic 템플릿만** 사용 가능.
   - _목적: 서비스 퀄리티 검증 및 Hooking._

2. **Standard (표준):**

   - **가격:** 월 **5,900원** (VAT 포함).
   - 월 **10회** 이용 가능.
   - 이력서 보관 10개.
   - 모든 템플릿 사용 가능.
   - _목적: 중간 사용자 타겟, 가격 접근성 확보._

3. **Pro (합격 패스):**
   - **가격:** 월 **9,900원** (VAT 포함).
   - 월 **무제한** 이용 (Fair Use Policy 적용: 일 50회).
   - 이력서 보관 무제한 + PDF 무제한 다운로드.
   - **PRO 전용 템플릿** 포함 (고급 디자인).
   - _목적: 파워 유저 및 취업 준비생 집중 지원._

### 3.2. Template Access Control

- **FREE:** Modern (Basic) 템플릿만 사용 가능.
- **STANDARD:** Modern, Classic, Minimal 템플릿 사용 가능.
- **PRO:** 모든 템플릿 + Executive, Creative (PRO 전용) 사용 가능.
- PRO 템플릿 선택 시 FREE/STANDARD 유저는 **업그레이드 유도 UI** 표시.

### 3.3. Cancellation Policy (Grace Period) - Future

- 구독 해지 시 즉시 권한이 박탈되지 않는다.
- **`cancel_at_period_end` = true**로 설정되며, 현재 결제 주기의 마지막 날(`current_period_end`)까지는 해당 플랜 기능을 유지한다.
- 결제일 다음날 배치(Batch) 혹은 접속 시점 체크를 통해 최종 권한을 Free로 강등한다.

---

# 📝 Refined User Stories (Functional Specs)

AI가 구현해야 할 기능을 **Epic(기능 단위)**별로 분류하고, 명확한 **Acceptance Criteria(인수 조건)**를 추가했습니다.

## Epic 1: Auth & Onboarding

**Story 1.1: 랜딩 페이지**

- **As a** 방문자, **I want to** 서비스의 가치를 빠르게 이해하고 시작하고 싶다.
- **Acceptance Criteria:**
  - Hero Section: 주요 가치 제안 및 CTA 버튼.
  - Features Section: 핵심 기능 3가지 소개.
  - Pricing Section: 플랜별 비교표.
  - Footer: 회사 정보 및 링크.
  - 모든 CTA는 로그인 페이지로 연결.

**Story 1.2: 구글 로그인**

- **As a** 방문자, **I want to** 구글 계정으로 간편하게 가입/로그인하고 싶다.
- **Acceptance Criteria (Current - Mock):**
  - 로그인 버튼 클릭 시 Google OAuth UI 표시 (Mock).
  - "Google로 계속하기" 버튼 클릭 시 즉시 대시보드로 진입.
  - 기본 플랜은 'FREE', 크레딧은 2로 설정.
- **Acceptance Criteria (Future - Production):**
  - 실제 Google OAuth 인증 흐름.
  - 가입 시 `Users` 테이블에 정보 생성, `Plans`는 기본 'FREE'.
  - 로그인 성공 시 `/dashboard`로 리다이렉트.

**Story 1.3: 반응형 레이아웃 (App Shell)**

- **As a** 로그인한 유저, **I want to** 일관된 레이아웃을 모든 기기에서 경험하고 싶다.
- **Acceptance Criteria:**
  - **Header:**
    - 좌측: 로고 + 서비스명.
    - 우측: 테마 토글, 플랜 뱃지(데스크톱), 크레딧 표시(데스크톱/모바일 모두), 사용자 드롭다운.
    - 모바일: 햄버거 메뉴 버튼.
  - **Desktop Sidebar (고정):**
    - 네비게이션: 이력서 관리, 새 이력서 만들기, 결제 관리, 프로필, 도움말.
    - 하단: 로그아웃 버튼.
  - **Mobile Drawer:**
    - 햄버거 클릭 시 좌측에서 슬라이드.
    - 동일한 네비게이션 항목 포함.
  - **다크모드:**
    - 시스템 설정 연동.
    - 토글로 Light/Dark/System 모드 전환.
    - CSS 변수 기반 테마 시스템.

## Epic 2: Resume Workflow (5-Step Process)

전체 워크플로우는 **5단계**로 구성된다:

1. **Upload** → 2. **AI Processing** → 3. **Edit** → 4. **Template Selection** → 5. **Complete**

**Story 2.1: Step 1 - PDF 업로드**

- **As a** 유저, **I want to** PDF 이력서를 업로드하여 작업을 시작하고 싶다.
- **Acceptance Criteria:**
  - **드래그 앤 드롭 지원**: 파일을 드래그하여 업로드 영역에 드롭.
  - **파일 선택 버튼**: 클릭하여 파일 탐색기 열기.
  - **파일 검증**: PDF만 허용, 크기 제한 10MB.
  - **업로드 피드백**: 파일명 표시, 업로드 중 프로그레스 바.
  - **다음 단계**: "업로드 및 처리 시작" 버튼 클릭 시 Processing 단계로 이동.
  - **크레딧 체크**: 크레딧이 0이면 업그레이드 유도 메시지.

**Story 2.2: Step 2 - AI 처리 (Processing)**

- **As a** 유저, **I want to** AI가 이력서를 분석하는 과정을 시각적으로 확인하고 싶다.
- **Acceptance Criteria (Current - Mock):**
  - **애니메이션**: AI 처리 중임을 나타내는 로딩 애니메이션.
  - **단계 표시**: "PDF 파싱 중...", "경력 요약 중...", "영문 번역 중..." 등 단계별 메시지.
  - **자동 진행**: 3-5초 후 자동으로 Edit 단계로 전환.
  - **크레딧 차감**: 처리 시작 시 크레딧 1 차감 (Mock).
- **Acceptance Criteria (Future - Production):**
  - 실제 PDF 텍스트 추출 API 호출.
  - Gemini API를 통한 요약 및 번역.
  - `Resumes` 테이블에 상태 저장 (IDLE → PROCESSING → COMPLETED).
  - 실패 시 에러 메시지 및 재시도 옵션.

**Story 2.3: Step 3 - 실시간 편집 (contenteditable)**

- **As a** 유저, **I want to** AI가 생성한 한글/영문 텍스트를 직접 수정하고 싶다.
- **Acceptance Criteria:**
  - **Split View UI**: 좌측(한글), 우측(영문).
  - **Contenteditable**: 각 불릿 포인트를 클릭만 하면 즉시 편집 가능.
  - **자동 저장 표시**: 편집 시 "변경사항 자동 저장됨" 시각적 피드백 (현재는 상태 관리).
  - **추가/삭제**: 경력 항목 추가 버튼, 삭제 버튼.
  - **실시간 동기화**: 한글 수정 시 영문은 그대로 유지 (독립적 편집).
  - **네비게이션**: "이전" 버튼(Processing으로), "다음" 버튼(Template Selection으로).

**Story 2.4: Step 4 - 템플릿 선택 및 미리보기**

- **As a** 유저, **I want to** 완성된 내용을 다양한 템플릿으로 미리보고 선택하고 싶다.
- **Acceptance Criteria:**
  - **템플릿 목록**: 좌측에 템플릿 카드 (Modern, Classic, Minimal, Executive, Creative).
  - **PRO 뱃지**: PRO 전용 템플릿에 배지 표시.
  - **실시간 미리보기**: 우측에 선택한 템플릿의 실제 렌더링 결과 표시.
  - **접근 제어**:
    - FREE: Modern만 선택 가능.
    - STANDARD: Modern, Classic, Minimal 선택 가능.
    - PRO: 모든 템플릿 선택 가능.
    - PRO 템플릿 선택 시 FREE/STANDARD는 업그레이드 유도 UI + "PRO로 업그레이드" 버튼.
  - **네비게이션**: "이전" 버튼(Edit으로), "다음" 버튼(Complete로) or "PRO로 업그레이드".

**Story 2.5: Step 5 - 완료 및 다운로드**

- **As a** 유저, **I want to** 최종 결과물을 확인하고 PDF로 다운로드하고 싶다.
- **Acceptance Criteria:**
  - **완료 배너**: "이력서가 성공적으로 생성되었습니다!" 성공 메시지.
  - **미리보기**: 선택한 템플릿으로 렌더링된 전체 이력서.
  - **PDF 다운로드**: "PDF 다운로드" 버튼 클릭 시 브라우저 다운로드 트리거 (Future: 실제 PDF 생성).
  - **액션 버튼**:
    - "수정" 버튼: Step 3 (Edit)로 이동.
    - "목록으로" 버튼: 이력서 관리 페이지로.
    - "삭제" 버튼: 삭제 확인 후 목록으로 (Toast 피드백).
  - **저장**: 이력서 목록에 자동 저장 (현재는 브라우저 상태).

**Story 2.6: 이력서 목록 관리**

- **As a** 유저, **I want to** 생성한 이력서들을 한눈에 보고 관리하고 싶다.
- **Acceptance Criteria:**
  - **카드 레이아웃**: 이력서 제목, 생성일, 상태(완료/진행중), 템플릿 정보.
  - **Empty State**: 이력서가 없을 때 "첫 이력서를 만들어보세요" 메시지.
  - **플랜별 제한 표시**:
    - FREE: "1/1 이력서 보관 중" + 업그레이드 유도.
    - STANDARD: "3/10 이력서 보관 중".
    - PRO: "무제한" 표시.
  - **액션**: 각 카드 클릭 시 Detail 페이지로.
  - **삭제 후 피드백**: Toast 메시지 "이력서가 삭제되었습니다".

## Epic 3: Subscription & Payment (UI Prototype)

**Story 3.1: 결제 관리 페이지**

- **As a** 유저, **I want to** 현재 플랜을 확인하고 업그레이드하고 싶다.
- **Acceptance Criteria (Current - Mock):**
  - **현재 플랜 카드**: FREE/STANDARD/PRO 표시, 남은 크레딧.
  - **플랜 비교표**: 3개 플랜의 기능 비교.
  - **업그레이드 버튼**: 클릭 시 "결제 기능은 개발 예정입니다" Alert.
- **Acceptance Criteria (Future - Production):**
  - PortOne 결제 모달 연동.
  - 카드 정보 입력 및 PG사 승인.
  - DB `Subscriptions` 테이블 업데이트 및 즉시 크레딧 지급.
  - 결제 성공 시 "업그레이드 완료" Toast + 헤더 플랜 뱃지 실시간 업데이트.

**Story 3.2: 구독 해지 (Future)**

- **As a** 구독자, **I want to** 다음 달부터 결제가 되지 않도록 해지하고 싶다.
- **Acceptance Criteria:**
  - '해지하기' 버튼 클릭 시 즉시 권한이 사라지면 안 됨.
  - DB의 `cancel_at_period_end`를 true로 변경.
  - UI에는 "YYYY-MM-DD에 해지될 예정입니다"라는 문구 표시.
  - 해지 예정 기간 동안은 해당 플랜 기능 유지.

**Story 3.3: 결제 이력 확인 (Future)**

- **As a** 유저, **I want to** 내 결제 내역과 영수증을 확인하고 싶다.
- **Acceptance Criteria:**
  - 결제 날짜, 금액, 플랜명, 상태(성공/환불) 리스트 제공.
  - PG사가 제공하는 영수증 URL 링크 제공.
  - 월별 필터링 및 검색 기능.

## Epic 4: UX Enhancements (Quality of Life)

**Story 4.1: 다크모드**

- **As a** 유저, **I want to** 눈의 피로를 줄이기 위해 다크모드를 사용하고 싶다.
- **Acceptance Criteria:**
  - 헤더에 테마 토글 버튼 (Sun/Moon 아이콘).
  - Light, Dark, System 모드 지원.
  - CSS 변수 기반 테마 (--background, --foreground 등).
  - 모든 컴포넌트에서 일관된 색상 적용.
  - 사용자 설정 localStorage 저장 (새로고침 후에도 유지).

**Story 4.2: 반응형 디자인**

- **As a** 모바일 유저, **I want to** 모든 기능을 모바일에서도 사용하고 싶다.
- **Acceptance Criteria:**
  - 모바일: 햄버거 메뉴, 크레딧 컴팩트 표시.
  - 태블릿: 적절한 레이아웃 조정.
  - 데스크톱: 고정 사이드바, 넓은 화면 활용.
  - Split View: 모바일에서는 탭 전환 (한글/영문).

**Story 4.3: 로딩 및 피드백**

- **As a** 유저, **I want to** 시스템 상태를 항상 명확히 알고 싶다.
- **Acceptance Criteria:**
  - Processing 단계: 애니메이션 + 진행 메시지.
  - 버튼 클릭: 로딩 스피너 (해당되는 경우).
  - 성공/실패: Toast 메시지 (sonner 라이브러리).
  - 삭제 확인: confirm 다이얼로그.

**Story 4.4: 용어 일관성**

- **As a** 유저, **I want to** 혼란스럽지 않은 일관된 용어를 보고 싶다.
- **Acceptance Criteria:**
  - "새로 만들기" → "새 이력서 만들기" 통일.
  - "크레딧" 용어 전체 일관 사용.
  - 버튼 레이블 명확성 유지.

**Story 4.5: 프로필 및 도움말**

- **As a** 유저, **I want to** 내 정보를 확인하고 서비스 사용법을 배우고 싶다.
- **Acceptance Criteria:**
  - **프로필 페이지**: 사용자 이름, 이메일, 가입일 표시 (Mock).
  - **도움말 페이지**: FAQ, 사용 가이드, 문의 방법.

---

## 4. Design System & Components

### 4.1. CSS 변수 기반 테마

`/src/styles/theme.css`에 정의된 CSS 변수를 사용하여 색상 관리:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --muted: 0 0% 96.1%;
  /* ... */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --muted: 0 0% 14.9%;
  /* ... */
}
```

### 4.2. 주요 컴포넌트

- **Layout:**
  - `dashboard-layout.tsx`: 메인 레이아웃 (헤더 + 사이드바/드로어).
  - `header.tsx`: 플랜 뱃지, 크레딧, 유저 메뉴.
- **Pages:**
  - `landing-page.tsx`: 랜딩 페이지.
  - `resumes-page.tsx`: 이력서 목록.
  - `new-resume-page.tsx`: PDF 업로드.
  - `processing-page.tsx`: AI 처리 애니메이션.
  - `resume-edit-page.tsx`: contenteditable 편집.
  - `resume-preview-page.tsx`: 템플릿 선택 및 미리보기.
  - `resume-detail-page.tsx`: 완료 및 다운로드.
  - `billing-page.tsx`: 결제 관리.
- **Templates:**
  - `modern-template.tsx`: 모던 디자인.
  - (추가 템플릿 확장 가능).

### 4.3. Shadcn UI 컴포넌트

- Button, Badge, Card, Dialog, DropdownMenu, Sheet (Drawer), Separator 등 활용.

---

## 5. Known Limitations & Future Improvements

### 5.1. Current Prototype Limitations

- ✅ **데이터 영속성 없음**: 새로고침 시 모든 데이터 손실 (localStorage 미사용).
- ✅ **실제 인증 없음**: 구글 로그인 UI만 존재, 실제 세션 관리 없음.
- ✅ **AI 처리 Mock**: 실제 PDF 파싱 및 Gemini API 호출 없음.
- ✅ **결제 기능 없음**: 결제 UI만 존재, PG 연동 없음.
- ✅ **PDF 생성 없음**: "다운로드" 버튼은 Alert만 표시.

### 5.2. Production Roadmap (v2.0)

1. **Backend 구축:**

   - Next.js API Routes + Prisma ORM.
   - PostgreSQL DB 스키마 설계.
   - AWS S3 PDF 스토리지.

2. **실제 기능 구현:**

   - Google OAuth 인증.
   - PDF 파싱 (pdf-parse 라이브러리).
   - Gemini API 연동.
   - PortOne 결제 연동.
   - HTML to PDF (puppeteer 또는 jsPDF).

3. **성능 최적화:**

   - 서버 사이드 렌더링 (SSR).
   - 이미지 최적화.
   - API Rate Limiting.

4. **보안:**

   - CSRF 토큰.
   - API Key 환경 변수 관리.
   - 사용자 데이터 암호화.

5. **Analytics & Monitoring:**
   - Google Analytics / Mixpanel.
   - Sentry 에러 트래킹.

---

## 6. Success Metrics (향후 측정 지표)

- **Conversion Rate:** 랜딩 페이지 방문 → 회원가입 → 유료 전환.
- **Activation Rate:** 가입 후 첫 이력서 생성 완료율.
- **Retention Rate:** 월간 활성 사용자(MAU).
- **ARPU:** Average Revenue Per User.
- **NPS:** Net Promoter Score (유저 만족도).

---

### 💡 AI Agent를 위한 프롬프트 가이드 (Tip)

향후 개발을 시작할 때, AI에게 다음과 같이 지시하면 위 문서를 가장 효과적으로 활용할 수 있습니다.

> "위의 `Project Context`와 `Refined User Stories`를 바탕으로, 우선 **Database Schema(Prisma schema)**를 작성해 줘. 특히 Subscription 모델의 `cancel_at_period_end` 로직과 Resume의 `JSONB` 데이터 구조, 그리고 3-tier 플랜(FREE/STANDARD/PRO)을 신경 써서 설계해 줘. 템플릿 접근 제어 로직도 포함해."

> "현재 프로토타입의 `/src/app/components` 구조를 기반으로 Next.js 15 App Router 구조로 마이그레이션하고, Supabase Auth를 연동해 줘. Mock 함수들을 실제 API 호출로 교체하는 작업부터 시작해."

이 문서는 개발자가 바로 작업에 착수할 수 있는 수준의 **Implementation Guide**입니다.

---

## 📋 Changelog

### v2.0 (2026-01-06)

- ✅ 3-tier 플랜 구조 추가 (FREE/STANDARD/PRO).
- ✅ 5단계 워크플로우 명확화 (Upload → Processing → Edit → Template → Complete).
- ✅ contenteditable 기반 실시간 편집 방식 반영.
- ✅ 템플릿 선택 및 PRO 접근 제어 로직 추가.
- ✅ 다크모드 지원 명시.
- ✅ 반응형 레이아웃 (데스크톱 사이드바 + 모바일 햄버거) 상세화.
- ✅ 현재 프로토타입과 향후 프로덕션 스택 분리.
- ✅ UX 개선사항 반영 (Toast 피드백, 용어 통일, 크레딧 모바일 표시 등).
- ✅ 기술 스택을 React + Vite 기반으로 업데이트.

### v1.0 (Initial)

- 초기 PRD 작성 (Next.js 기반, 2-tier 플랜).
