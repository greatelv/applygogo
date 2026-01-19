# Master Access Guide

이 문서는 개발 및 테스트 목적을 위한 전체 페이지 접근 권한(Master Access)을 획득하는 방법을 설명합니다.

## 개요

관리자 권한으로 모든 인증을 우회하여 애플리케이션의 모든 페이지(대시보드, 이력서 편집 등)에 접근할 수 있는 "마스터 세션" 기능이 구현되어 있습니다.

## 설정 방법

`.env` 또는 `.env.local` 파일에 다음 환경 변수가 설정되어 있어야 합니다.

```env
AUTH_MASTER_KEY=applygogo_master_pass_2026
```

## 사용 방법 (로그인)

일반 로그인 페이지(`/login`)에서 다음 자격 증명을 사용하여 로그인합니다.

- **Email**: `master@applygogo.com`
- **Password**: `applygogo_master_pass_2026` (또는 설정한 `AUTH_MASTER_KEY` 값)

## 동작 원리

1. `src/auth.ts`의 `Credentials` 공급자(`authorize` 함수)에서 입력된 비밀번호가 `AUTH_MASTER_KEY`와 일치하고 이메일이 마스터 계정인 경우를 확인합니다.
2. 일치할 경우, 별도의 DB 조회 없이 즉시 "Master Admin" 권한을 가진 세션 객체를 반환합니다.
3. Next.js Middleware(`src/middleware.ts`) 및 Auth Config(`src/auth.config.ts`)는 유효한 세션이 존재하므로 모든 보호된 경로에 대한 접근을 허용합니다.

## 주의 사항

- 이 기능은 **개발 및 테스트 환경**에서만 사용해야 합니다.
- 프로덕션 환경에서는 `AUTH_MASTER_KEY`를 매우 강력하게 설정하거나, 해당 로직을 비활성화하는 것을 권장합니다.
