# 📋 Task List: 지원고고 (ApplyGoGo)

## ✅ 완료된 작업 (Completed)

### 1. 인프라 및 핵심 로직

- [x] Next.js 15 + Prisma + PostgreSQL 환경 구성
- [x] Supabase Storage를 통한 PDF 업로드 기능
- [x] Gemini API 연동: 이력서 텍스트 추출 및 구조화된 JSON 데이터 생성
- [x] AI 분석 결과 DB 저장 시 방어 코드 적용 (누락 필드 기본값 할당)
- [x] NextAuth.js 기반 인증 시스템 구축

### 2. URL 기반 워크플로우 (개편 완료)

- [x] `/resumes/new`: 파일 업로드 및 분석 시작
- [x] `/resumes/[id]/processing`: AI 분석 대기 UI 및 서버 상태 연동
- [x] `/resumes/[id]/edit`: 이력서 데이터 편집 (한글/영문 동기화 및 재번역)
- [x] `/resumes/[id]/templates`: 디자인 템플릿 선택 및 미리보기
- [x] `/resumes/[id]`: 최종 상세 보기
- [x] **이력서 삭제**: 상세 페이지 및 목록 페이지에서 삭제 기능 완성 (API 및 DB Delete)

### 3. 기능 및 UI 연동

- [x] 이력서 목록 (`/resumes`): 실제 DB 데이터 기반 리스트 구현
- [x] 이력서 상세 (`/resumes/[id]`): 실제 데이터 기반 상세 조회 및 미리보기
- [x] 글로벌 클릭 요소 `cursor: pointer` 스타일 일괄 적용
- [x] 편집 페이지 실시간 데이터 저장 (PUT API 호출)

---

## 🚧 현재 진행 중 / 예정 작업 (Pending)

### 1. 핵심 기능 완성

- [ ] **PDF 다운로드**: HTML 템플릿을 PDF 파일로 변환하여 다운로드하는 서버/클라이언트 로직 구현

### 2. 비즈니스 모델 및 운영

- [ ] **플랜/크레딧 시스템**: PRD에 정의된 요금제(Free 3개, Pro 100개)에 따른 실질적인 크레딧 차감 및 권한 제어 로직 구현
- [ ] **결제 연동**: PortOne 등 결제 게이트웨이 연동 및 구독 결제 처리
- [ ] **프로필 관리**: 사용자 이름, 프로필 이미지 등 정보 수정 페이지 완성

### 3. 디자인 및 사용성 개선

- [ ] **추가 템플릿**: Modern 외에 Minimal, Classic 등 다양한 디자인 템플릿 완성도 제고
- [ ] **로딩 상태 개선**: 서버 컴포넌트 데이터 로딩 시 Skeleton UI 보완
- [ ] **SEO 최적화**: 기술 스택 및 키워드 기반 메타 태크 동적 생성

### 4. 글로벌 확장 (Global Expansion) - New!

- [ ] **Two-Track 전략 실행**:
  - [ ] `epic/global` 브랜치 격리
  - [ ] 싱가포르 DB 연결 및 스키마 독립
- [ ] **글로벌 전용 기능**:
  - [ ] 영문 이력서 -> 국문 자소서 자동 변환 API
  - [ ] 글로벌 결제 (PayPal) 연동

---

## 🛠️ 기술적 참고 사항 (Tech Notes)

- **AI 프롬프트**: `src/app/api/resumes/[id]/analyze/route.ts` 내의 `RESUME_ANALYSIS_PROMPT`가 데이터 구조를 정의함.
- **데이터 흐름**: `PUT /api/resumes/[id]` 호출 시 `work_experiences` 등을 트랜잭션으로 삭제 후 재생성하여 일관성 유지.
- **스타일**: `src/styles/theme.css`가 메인 테마이며, Tailwind 클래스와 유기적으로 결합되어 있음.
