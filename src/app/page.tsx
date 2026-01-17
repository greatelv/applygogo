import { redirect } from "next/navigation";

// 이 페이지는 미들웨어에서 localeDetection이 false일 때(개발 환경 등)
// 루트 경로(/)로 진입하면 실행됩니다.
// 무조건 기본 언어(ko)로 리다이렉트합니다.
export default function RootPage() {
  redirect("/ko");
}
