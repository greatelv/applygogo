# Resume Language Logic Refactoring Summary

## ✅ 완료된 작업

### 1. 중앙 유틸리티 함수 생성

**파일**: `/Users/kei/workspaces/applygogo/src/lib/resume-language.ts`

비즈니스 로직을 명확하게 정의:

- **`app_locale === "ko"`** → 영문 이력서 출력 (`_target` 사용)
- **`app_locale === "en"` 또는 `"ja"`** → 한국어 이력서 출력 (`_source` 사용)

주요 함수:

- `shouldUseTargetData(locale)`: locale에 따라 target/source 선택
- `getLocalizedValue(source, target, locale)`: 적절한 값 반환
- `getSectionTitle(koTitle, enTitle, locale)`: 섹션 제목 반환

### 2. PDF 템플릿 리팩토링

#### ✅ Modern PDF (`modern-pdf.tsx`)

- `shouldUseTargetData` 유틸리티 import
- `locale` prop 타입을 `AppLocale`로 변경
- `useTarget` 변수로 로직 통일

#### ✅ Classic PDF (`classic-pdf.tsx`)

- `shouldUseTargetData` 유틸리티 import
- `locale` prop 추가
- 모든 데이터 필드에 `useTarget` 조건 적용
- 섹션 제목도 locale에 따라 한/영 전환

#### ⏳ Minimal PDF (`minimal-pdf.tsx`)

- **TODO**: 동일한 패턴 적용 필요

#### ⏳ Professional PDF (`professional-pdf.tsx`)

- **TODO**: 동일한 패턴 적용 필요

#### ⏳ Executive PDF (`executive-pdf.tsx`)

- **TODO**: 동일한 패턴 적용 필요

### 3. 화면 템플릿 (HTML)

**TODO**: 다음 파일들도 동일한 로직 적용 필요

- `modern-template.tsx`
- `classic-template.tsx`
- `minimal-template.tsx`
- `professional-template.tsx`
- `executive-template.tsx`

## 📋 다음 단계

### 남은 PDF 템플릿 수정

Minimal, Professional, Executive PDF에 다음 변경 적용:

```typescript
// 1. Import 추가
import { shouldUseTargetData, type AppLocale } from "@/lib/resume-language";

// 2. Props 인터페이스에 locale 추가
interface XxxPdfProps {
  // ...
  locale?: AppLocale;
}

// 3. 컴포넌트에서 useTarget 계산
export const XxxPdf = ({ ..., locale = "ko" }: XxxPdfProps) => {
  const useTarget = shouldUseTargetData(locale);

  // 4. 모든 데이터 필드에 조건 적용
  // 예: {useTarget ? data.field_target : data.field_source}
}
```

### HTML 템플릿 수정

동일한 패턴으로 모든 HTML 템플릿 수정

## 🎯 기대 효과

1. **일관성**: 모든 템플릿이 동일한 로직 사용
2. **유지보수성**: 비즈니스 로직 변경 시 한 곳만 수정
3. **명확성**: 코드만 봐도 어떤 언어가 출력되는지 명확
4. **타입 안전성**: `AppLocale` 타입으로 오타 방지
