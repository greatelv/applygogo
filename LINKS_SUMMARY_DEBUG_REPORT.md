# 링크 및 Professional Summary 미표시 문제 해결 보고서

## 🔍 문제 진단

### 이력서 ID

`bb3a4840-1549-4325-b856-d1b67ac2499a`

### 증상

- 편집 화면에서 **링크(Links)** 정보가 표시되지 않음
- 편집 화면에서 **Professional Summary**가 표시되지 않음

## 📊 원인 분석

### 1. 프론트엔드 코드 검토

- ✅ `src/app/[locale]/(authenticated)/resumes/[id]/edit/page.tsx`: 서버에서 데이터를 올바르게 가져옴
- ✅ `src/app/components/resume-edit-page.tsx`: `personalInfo.links`와 `personalInfo.summary_source/target`를 올바르게 렌더링
- ✅ `src/app/components/resume-edit/use-resume-editor.ts`: 초기화 로직 정상

### 2. API 및 데이터베이스 구조 검토

- ✅ `src/app/api/resumes/[id]/translate/route.ts`: 번역 API가 `personal_info.links`, `personal_info.summary_source`, `personal_info.summary_target`를 데이터베이스에 저장
- ✅ Prisma Schema: `Resume` 모델에 `links`, `summary_source`, `summary_target` 필드 존재

### 3. AI 프롬프트 검토 ⚠️

**문제 발견!**

`src/lib/prompts.ts`의 `getTranslationPrompt` 함수에서:

- ❌ **번역 프롬프트의 OUTPUT FORMAT에 `email`, `phone`, `links` 필드가 명시되지 않음**
- ✅ `summary_source`와 `summary_target`는 명시되어 있음

```typescript
// 수정 전 (라인 170-181)
"personal_info": {
  "name_source": "...",
  "name_target": "Translated Name",
  "summary_source": "...",
  "summary_target": "Translated Summary"
  ...  // <- 여기에 email, phone, links가 없음!
},
```

AI가 프롬프트에 명시되지 않은 필드를 생략할 수 있어, 번역 결과에 `links`, `email`, `phone`이 포함되지 않았을 가능성이 높습니다.

## ✅ 해결 조치

### 1. 프롬프트 수정 (완료)

`src/lib/prompts.ts`의 번역 프롬프트를 수정하여 모든 필드를 명시:

```typescript
"personal_info": {
  "name_source": "...",
  "name_target": "Translated Name",
  "email": "...",
  "phone": "...",
  "links": [
    { "label": "...", "url": "..." }
  ],
  "summary_source": "...",
  "summary_target": "Translated Summary"
},
```

### 2. 기존 이력서 해결 방법

#### 옵션 A: 이력서 재처리 (권장)

1. 이력서를 다시 업로드
2. 수정된 프롬프트로 처리
3. 모든 데이터가 올바르게 저장됨

#### 옵션 B: 수동 입력

1. 편집 화면에서 "+ 링크 추가" 버튼 클릭
2. 링크 정보 수동 입력
3. Professional Summary 필드에 직접 입력
4. 저장

#### 옵션 C: 데이터 복구 스크립트 (개발자용)

원본 PDF를 다시 추출하여 누락된 필드만 업데이트하는 스크립트 작성

## 🎯 향후 예방 조치

### 1. 프롬프트 검증

- 모든 AI 프롬프트의 OUTPUT FORMAT에 필요한 모든 필드를 명시
- 추출, 정제, 번역 프롬프트 간 일관성 유지

### 2. 데이터 검증

번역 API에 데이터 검증 로직 추가:

```typescript
// 번역 후 필수 필드 확인
if (!translatedData.personal_info.email) {
  translatedData.personal_info.email = refinedData.personal_info.email;
}
if (!translatedData.personal_info.links) {
  translatedData.personal_info.links = refinedData.personal_info.links || [];
}
```

### 3. 테스트

- 다양한 이력서 형식으로 전체 프로세스 테스트
- 각 단계(Extract, Refine, Translate)의 출력 검증

## 📝 요약

**근본 원인**: 번역 프롬프트에서 `email`, `phone`, `links` 필드를 명시하지 않아 AI가 이 필드들을 생략

**해결**: 프롬프트 수정 완료 (향후 이력서는 정상 처리됨)

**기존 이력서**: 재업로드 또는 수동 입력 필요
