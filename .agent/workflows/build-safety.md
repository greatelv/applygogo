---
description: 작업 후 빌드 및 런타임 에러를 방지하기 위한 자가 검증 절차
---

코드 수정이나 기능 구현을 마친 후, 사용자에게 보고하기 전 다음 단계를 반드시 수행하여 완결성을 확보합니다.

1. **터미널 로그 모니터링**

   - 코드 수정 후 `command_status` 툴을 사용하여 `pnpm dev` 서버 로그를 확인합니다.
   - 새로운 컴파일 에러나 경고가 발생했는지 체크합니다.

2. **브라우저 실제 렌더링 확인**

   - `browser_subagent`를 사용하여 수정된 페이지나 관련 기능의 URL에 직접 접속합니다.
   - 화면에 Next.js 에러 오버레이(Build Error, Runtime Error)가 뜨지 않는지 확인합니다.
   - 콘솔 로그(`capture_browser_console_logs`)를 통해 클라이언트 사이드 에러가 없는지 확인합니다.

3. **Next.js 경계 규칙 검증**

   - `"use client"` 지시어가 누락되지 않았는지 확인합니다. (useState, useEffect 사용 시 필수)
   - Server Component에서 Client Component로 함수(Serialized 되지 않는 프로퍼티)를 전달하고 있지는 않은지 확인합니다.

4. **빌드 시뮬레이션 (필요 시)**
   - 복잡한 변경사항의 경우 `npx tsc --noEmit`을 실행하여 타입 체크를 수행하거나, `pnpm build`를 통해 전체 빌드 성공 여부를 확인합니다.
