# 🌏 글로벌 확장 컨텍스트 요약 (2026-01-16)

## 🎯 목표 (Objective)

"Two-Track" 격리 전략을 사용하여 영문 이력서를 한국어 서사(Narrative)로 변환하는 "ApplyGoGo Global"을 런칭하는 것.

## 🏗️ 아키텍처 (현재 상태)

- **브랜치 전략:**
  - `main`: 한국 서비스 (안정 버전).
  - `epic/global`: 글로벌 서비스 (활발히 개발 중).
- **데이터베이스:**
  - **KR:** 기존 Supabase (서울).
  - **Global:** 신규 Supabase 프로젝트 (`applygogo-global`) (서울).
- **데이터 스키마 (리팩토링됨):**
  - 컬럼명을 언어 중립적으로 변경: `_kr` -> `_original` (원본), `_en` -> `_translated` (대상).
  - 이를 통해 KR->EN (번역) 및 EN->KO (서사 생성) 흐름을 모두 지원합니다.

## ✅ 완료된 작업 (Accomplished)

1. **인프라 격리:**
   - 글로벌 Supabase 생성 (`fnhpqu...`).
   - `epic/global` 브랜치용 `.env` 추적 설정 완료.
2. **Supabase & Storage 수정:**
   - 클라이언트 초기화 및 버킷 이름 하드코딩 문제 해결.
   - 업로드 기능 정상 작동.
3. **글로벌 DB 스키마 리팩토링 (주요):**
   - **스키마 업데이트:** `prisma/schema.prisma`를 `_original`/`_translated`로 리팩토링.
   - **코드 마이그레이션:** 모든 의존성 파일 업데이트 (`actions.ts`, `api/resumes/...`, `prompts.ts`, `page.tsx`).
   - **UI 호환성:** `edit/page.tsx` 등에서 새 DB 컬럼을 레거시 UI props에 매핑하여 오류 방지.
   - **DB 동기화:** 캐시 삭제 후 `prisma db push` 및 `generate`를 통해 글로벌 DB와 코드 동기화 완료.
4. **서사 생성 로직 구현 (핵심):**
   - **Two-Track 처리:**
     - **Track A (한국어):** `추출(KR)` -> `정제` -> `번역(KR->EN)`.
     - **Track B (영어):** `추출(EN)` -> `서사 생성(EN->KO)`.
   - **언어 감지:** 1단계에서 `detected_language` 자동 감지.
   - **새 프롬프트:** 전체 이력서 서사 생성(STAR 기법, 풍부한 확장)을 위한 `getResumeNarrativePrompt` 추가.

## 📋 다음 단계 (즉시 실행 필요)

1. **출력 품질 검증:**
   - 영문 이력서가 풍부한 국문 서사로 올바르게 변환되는지 테스트.
   - 기존 한국어 이력서가 번역(KR->EN)을 여전히 문제없이 수행하는지(회귀 테스트) 확인.
2. **PDF 다운로드 기능:**
   - 생성된 국문 이력서를 PDF로 다운로드하는 기능 구현.

## 🔑 주요 자격 증명 (Global)

- **Project Ref:** `fnhpqufnhqoiowoadxpd`
- **Region:** Seoul (aws-1-ap-northeast-2)
- **Bucket:** `applygogo`
