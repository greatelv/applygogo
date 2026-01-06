# 지원고고 워크플로우 가이드

## 📋 목차

1. [전체 워크플로우](#전체-워크플로우)
2. [페이지 구조](#페이지-구조)
3. [상태 관리](#상태-관리)
4. [사용자 여정](#사용자-여정)

## 🔄 전체 워크플로우

### 이력서 생성 워크플로우

```
1. 새 이력서 만들기 (NewResumePage)
   ↓ PDF 업로드

2. AI 처리중 (ProcessingPage)
   - PDF 업로드 완료
   - 텍스트 추출 중
   - AI 분석 중
   - 경력 요약 중
   ↓ 자동 진행 (6~7초) (1 크레딧 차감)

3. 경력사항 요약 확인 (ResumeSummaryPage)
   - AI가 요약한 경력사항 확인
   - 각 경력별 불릿 포인트 수정 가능
   - 불릿 포인트 추가/삭제 가능
   ↓ "다음: 영문 번역" 클릭

4. 영문 번역 확인 (ResumeTranslatePage)
   - Split View (한글 | 영문)
   - 영문 번역 내용 수정 가능
   - 재번역 기능 (0.5 크레딧 차감)
   ↓ "다음: 템플릿 선택" 클릭

5. 템플릿 선택 & 미리보기 (ResumePreviewPage)
   - Modern / Classic / Minimal(Pro) 템플릿 선택
   - 실시간 미리보기
   ↓ "PDF 다운로드" 클릭

6. 완료
   - 이력서 목록에 추가
   - 차감 없음 (다운로드 무료)
   - 완성 알림
```

### 상태 흐름

```
UPLOAD → PROCESSING → SUMMARIZED → TRANSLATED → COMPLETED
```

## 📄 페이지 구조

### 1. 인증 & 랜딩

- **LandingPage** (`landing-page.tsx`)
  - 히어로 섹션
  - 주요 기능 소개
  - 가격 플랜 미리보기
  - CTA 버튼
- **LoginPage** (`login-page.tsx`)
  - Google OAuth 로그인
  - 서비스 소개

### 2. 대시보드

- **DashboardLayout** (`dashboard-layout.tsx`)
  - Header + Sidebar + Content 구조
  - 모든 페이지의 공통 레이아웃
- **Header** (`header.tsx`)
  - 테마 토글 버튼
  - 플랜 뱃지
  - 남은 크레딧 표시
  - 사용자 프로필 드롭다운
- **Sidebar** (`sidebar.tsx`)
  - 네비게이션 메뉴
  - 데스크톱: 고정 사이드바
  - 모바일: 햄버거 메뉴

### 3. 이력서 관리

- **ResumesPage** (`resumes-page.tsx`)

  - 이력서 목록 표시
  - 상태별 뱃지 (완료, 번역완료 등)
  - 새 이력서 만들기 버튼
  - 빈 상태 (Empty State)

- **ResumeDetailPage** (`resume-detail-page.tsx`)
  - 완성된 이력서 상세 보기
  - PDF 다운로드
  - 이력서 삭제
  - 한글 원본 토글

### 4. 이력서 생성 워크플로우

- **NewResumePage** (`new-resume-page.tsx`)

  - PDF 업로드 (드래그 앤 드롭 지원)
  - 파일 선택 버튼

- **ProcessingPage** (`processing-page.tsx`)

  - 단계별 진행 상태 표시
  - 로딩 애니메이션
  - 자동 다음 단계 이동

- **ResumeSummaryPage** (`resume-summary-page.tsx`)

  - 경력사항별 요약 확인
  - 불릿 포인트 편집 (추가/수정/삭제)
  - 이전/다음 버튼

- **ResumeTranslatePage** (`resume-translate-page.tsx`)

  - Split View (한글 원본 | 영문 번역)
  - 영문 번역 편집
  - 재번역 버튼
  - 이전/다음 버튼

- **ResumePreviewPage** (`resume-preview-page.tsx`)
  - 템플릿 선택 (Modern, Classic, Minimal)
  - 실시간 미리보기
  - PDF 다운로드
  - 이전 버튼

### 5. 계정 & 설정

- **BillingPage** (`billing-page.tsx`)

  - 현재 플랜 정보
  - 플랜 업그레이드
  - 결제 내역

- **ProfilePage** (`profile-page.tsx`)

  - 사용자 정보
  - 계정 정보
  - 구독 정보
  - 사용 통계

- **SettingsPage** (`settings-page.tsx`)

  - 알림 설정
  - 언어 설정
  - 테마 설정 (안내)
  - 데이터 & 개인정보
  - 계정 삭제

- **HelpPage** (`help-page.tsx`)
  - 자주 묻는 질문 (FAQ)
  - 카테고리별 필터
  - 빠른 링크
  - 문의하기

## 🎯 상태 관리

### App.tsx 주요 State

```typescript
// 인증
- showLanding: boolean
- isAuthenticated: boolean

// 네비게이션
- currentPage: string
- selectedResumeId: string | null

// 사용자 정보
- plan: "FREE" | "PRO"
- quota: number
- resumes: Resume[]

// 워크플로우
- workflowStep: "upload" | "processing" | "summary" | "translate" | "preview" | null
- currentResumeTitle: string
- currentExperiences: Experience[]
- currentTranslated: TranslatedExperience[]
```

### 워크플로우 상태 전환

```typescript
// 업로드 시작
workflowStep = "upload" → "processing"

// AI 처리 완료
workflowStep = "processing" → "summary"

// 요약 확인 후
workflowStep = "summary" → "translate"

// 번역 확인 후
workflowStep = "translate" → "preview"

// 다운로드 완료
workflowStep = "preview" → null (완료)
currentPage = "resumes"
```

## 👤 사용자 여정

### 신규 사용자

```
1. 랜딩페이지 방문
2. "무료로 시작하기" 클릭
3. Google 로그인
4. 대시보드 진입 (이력서 목록 비어있음)
5. "새 이력서 만들기" 클릭
6. PDF 업로드
7. AI 처리 대기 (자동)
8. 요약 확인 및 수정
9. 번역 확인 및 수정
10. 템플릿 선택
11. PDF 다운로드 ✅
```

### 재방문 사용자

```
1. 랜딩페이지 "시작하기" 클릭
2. Google 로그인 (자동)
3. 대시보드 진입 (기존 이력서 목록)
4. 옵션 A: 새 이력서 만들기
   옵션 B: 기존 이력서 상세 보기
   옵션 C: 설정/프로필 관리
```

### 플랜 업그레이드

```
1. 대시보드에서 "결제 관리" 메뉴 클릭
2. 플랜 비교 및 선택
3. "업그레이드" 버튼 클릭
4. 크레딧 자동 갱신
5. 더 많은 기능 사용 가능
```

## 🔑 주요 기능

### 1. 다크모드

- 헤더의 테마 토글 버튼 (🌙/☀️)
- 시스템 설정 자동 연동
- 모든 컴포넌트 다크모드 지원

### 2. 반응형 디자인

- 데스크톱: 고정 사이드바
- 모바일: 햅버거 메뉴
- 모든 페이지 모바일 최적화

### 3. 실시간 편집

- 요약 단계: 불릿 포인트 추가/수정/삭제
- 번역 단계: 영문 번역 직접 수정
- Split View로 원본과 비교

### 4. 크레딧 시스템

- Free: 월 3 크레딧
- Pro: 월 100 크레딧
- 이력서 1개 생성 = 크레딧 1개 소모

## 📝 다음 단계 (향후 개발)

1. **Supabase 연동**

   - 실제 데이터베이스 저장
   - 사용자 인증 (Google OAuth)
   - 파일 스토리지

2. **AI API 연동**

   - Gemini Pro API (요약)
   - Google Translate API (번역)
   - 실시간 처리

3. **PDF 생성**

   - 템플릿별 PDF 생성
   - 한글 폰트 지원
   - 다운로드 기능

4. **결제 시스템**

   - Stripe 연동
   - 구독 관리
   - 자동 결제

5. **추가 기능**
   - 이력서 버전 관리
   - 템플릿 커스터마이징
   - 이메일 알림
   - 이력서 공유

---

**지원고고와 함께 글로벌 커리어를 시작하세요!** 🚀
