import type { Metadata } from "next";
import "../styles/index.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  title: {
    default: "지원고고 - 글로벌 표준 이력서 빌더",
    template: "%s | 지원고고",
  },
  description:
    "AI 기반 이력서 빌더로 글로벌 취업 기회를 잡으세요. 몇 분 만에 전문적인 영문/국문 이력서를 작성할 수 있습니다.",
  keywords: [
    "이력서 작성",
    "AI 이력서",
    "영문 이력서",
    "지원고고",
    "해외 취업",
    "자기소개서",
    "CV 만들기",
  ],
  authors: [{ name: "지원고고 팀" }],
  creator: "지원고고",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "지원고고 - 글로벌 표준 이력서 빌더",
    description:
      "AI 기반 이력서 빌더로 글로벌 취업 기회를 잡으세요. 몇 분 만에 전문적인 이력서를 작성할 수 있습니다.",
    siteName: "지원고고",
  },
  twitter: {
    card: "summary_large_image",
    title: "지원고고 - 글로벌 표준 이력서 빌더",
    description: "AI 기반 이력서 빌더로 글로벌 취업 기회를 잡으세요.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-id", // User to replace
    other: {
      "naver-site-verification": "naver-site-verification-id", // User to replace
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
