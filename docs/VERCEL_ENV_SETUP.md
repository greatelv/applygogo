# Vercel 환경 변수 설정 가이드

## Analytics 환경 변수 추가하기

프로덕션 환경에서 Google Analytics와 Microsoft Clarity가 작동하려면 Vercel 대시보드에 환경 변수를 추가해야 합니다.

### 1. Vercel 대시보드 접속

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 (`applygogo`)
3. **Settings** 탭 클릭
4. 왼쪽 메뉴에서 **Environment Variables** 클릭

### 2. 환경 변수 추가

다음 두 개의 환경 변수를 추가하세요:

#### Google Analytics

- **Key**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- **Value**: `G-SH0J737NTX`
- **Environment**: `Production`, `Preview`, `Development` 모두 체크

#### Microsoft Clarity

- **Key**: `NEXT_PUBLIC_CLARITY_PROJECT_ID`
- **Value**: `v0omyutwcm`
- **Environment**: `Production`, `Preview`, `Development` 모두 체크

### 3. 재배포

환경 변수 추가 후:

- **자동 재배포**: 다음 커밋/푸시 시 자동으로 적용됨
- **수동 재배포**: Deployments 탭에서 최신 배포의 `...` 메뉴 → `Redeploy` 클릭

### 4. 확인

재배포 후 프로덕션 사이트에서:

1. 브라우저 개발자 도구(F12) 열기
2. **Network** 탭에서 다음 확인:
   - `googletagmanager.com` 요청
   - `clarity.ms` 요청
3. **Console** 탭에서 에러 없는지 확인

## 주의사항

- `NEXT_PUBLIC_` 접두사가 있는 환경 변수는 클라이언트 사이드에 노출됩니다
- Analytics ID는 공개되어도 안전합니다 (원래 클라이언트에서 사용하도록 설계됨)
- 환경 변수 변경 시 반드시 재배포가 필요합니다

## CLI로 추가하기 (선택사항)

Vercel CLI를 사용하는 경우:

```bash
# Vercel CLI 설치 (없는 경우)
npm i -g vercel

# 환경 변수 추가
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID
# 값 입력: G-SH0J737NTX
# Environment 선택: Production, Preview, Development

vercel env add NEXT_PUBLIC_CLARITY_PROJECT_ID
# 값 입력: v0omyutwcm
# Environment 선택: Production, Preview, Development
```
