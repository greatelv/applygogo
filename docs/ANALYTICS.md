# Analytics 통합 가이드

이 프로젝트에는 Google Analytics 4 (GA4)와 Microsoft Clarity가 통합되어 있습니다.

## 설정 방법

### 1. Google Analytics 4 설정

1. [Google Analytics](https://analytics.google.com/)에 로그인
2. 새 속성(Property) 생성 또는 기존 속성 선택
3. 데이터 스트림 생성 (웹)
4. 측정 ID (Measurement ID) 복사 (형식: `G-XXXXXXXXXX`)
5. `.env` 파일에 추가:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
   ```

### 2. Microsoft Clarity 설정

1. [Microsoft Clarity](https://clarity.microsoft.com/)에 로그인
2. 새 프로젝트 생성
3. 프로젝트 ID 복사
4. `.env` 파일에 추가:
   ```
   NEXT_PUBLIC_CLARITY_PROJECT_ID="your-project-id"
   ```

## 작동 방식

- **Google Analytics**: 페이지뷰, 이벤트, 전환 추적
- **Microsoft Clarity**: 세션 리플레이, 히트맵, 사용자 행동 분석

두 스크립트 모두 `strategy="afterInteractive"`로 설정되어 있어 페이지 로딩 성능에 영향을 최소화합니다.

## 파일 구조

```
src/app/components/analytics/
├── google-analytics.tsx    # GA4 스크립트 컴포넌트
├── microsoft-clarity.tsx   # Clarity 스크립트 컴포넌트
└── index.ts                # Export 파일
```

## 주의사항

- 환경 변수가 설정되지 않으면 스크립트가 로드되지 않습니다 (개발 환경에서 유용)
- 프로덕션 배포 전 반드시 환경 변수를 설정하세요
- GDPR/개인정보보호 규정 준수를 위해 쿠키 동의 배너 추가를 고려하세요
