# Master Access Guide (Session Impersonation)

이 문서는 개발 및 테스트 목적을 위한 세션 위장(Session Impersonation) 기능을 사용하는 방법을 설명합니다.

## 개요

관리자가 특정 유저의 계정으로 우회 접속하여 해당 유저의 데이터를 확인하거나 문제를 디버깅할 수 있는 기능이 구현되어 있습니다.

## 설정 방법

`.env` 또는 `.env.local` 파일에 다음 환경 변수가 설정되어 있어야 합니다.

```env
AUTH_MASTER_KEY=applygogo_master_pass_2026
```

## 사용 방법 (로그인)

일반 로그인 페이지(`/login?mode=test`)에서 다음 자격 증명을 사용하여 로그인합니다.

- **Email**: `접속하려는 유저의 이메일` (예: `user@example.com`)
- **Password**: `AUTH_MASTER_KEY` 값 (현재 설정값: `applygogo_master_pass_2026`)

폼 하단의 **"테스트 계정 로그인"** 버튼을 눌러 로그인할 수 있습니다.

## 동작 원리

1. `src/auth.ts`의 `Credentials` 공급자(`authorize` 함수)에서 입력된 비밀번호가 `AUTH_MASTER_KEY`와 일치하는지 확인합니다.
2. 비밀번호가 일치할 경우, 입력된 이메일에 해당하는 실제 유저 정보를 데이터베이스(`prisma.user.findUnique`)에서 조회합니다.
3. 유저가 존재하면 해당 유저의 객체를 반환하여, 시스템은 관리자를 해당 유저로 완전히 인식(Impersonate)하게 됩니다.
4. 이후 모든 대시보드 및 이력서 편집 페이지에서 해당 유저의 데이터를 정상적으로 조회하고 조작할 수 있습니다.

## 주의 사항

- 이 기능은 **개발 및 테스트 환경**에서만 사용해야 합니다.
- 프로덕션 환경에서는 `AUTH_MASTER_KEY`를 유출되지 않도록 엄격히 관리해야 합니다.
- 유저가 DB에 존재하지 않는 경우 로그인이 실패합니다.
