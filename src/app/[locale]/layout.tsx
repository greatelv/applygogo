import type { Metadata } from "next";
import { headers } from "next/headers";
import "@/styles/index.css";
import { Providers } from "./providers";
import NextTopLoader from "nextjs-toploader";
import { GoogleAnalytics, MicrosoftClarity } from "@/app/components/analytics";
import { locales } from "../../i18n/config";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://applygogo.com";

  const getTitle = () => {
    switch (locale) {
      case "ko":
        return "AI로 완성하는 고품질의 영문 이력서 - 지원고고";
      case "ja":
        return "AIで完成させる高品質な英文履歴書 - 支援ゴーゴー";
      default:
        return "ApplyGogo - High Quality English Resume with AI";
    }
  };

  const getDescription = () => {
    switch (locale) {
      case "ko":
        return "AI 기반 영문 이력서 변환 서비스로 국문 이력서를 글로벌 스탠다드 CV/Resume로 손쉽게 번역하고 만들어보세요.";
      case "ja":
        return "AIベースの英文履歴書変換サービスで、韓国語の履歴書をグローバルスタンダードなCV/Resumeに簡単に翻訳して作成しましょう。";
      default:
        return "Easily translate and create Korean resumes into global standard CVs/Resumes with AI-based English resume conversion service.";
    }
  };

  const title = getTitle();
  const description = getDescription();
  const siteName =
    locale === "ko"
      ? "지원고고"
      : locale === "ja"
        ? "支援ゴーゴー"
        : "ApplyGogo";

  // 현재 경로에서 로케일 부분을 제외한 경로 추출
  let pathWithoutLocale = pathname;
  if (pathname.startsWith(`/${locale}`)) {
    pathWithoutLocale = pathname.replace(`/${locale}`, "");
  } else if (pathname === `/${locale}`) {
    pathWithoutLocale = "";
  }

  const languages = locales.reduce(
    (acc, lang) => {
      acc[lang] = `${baseUrl}/${lang}${pathWithoutLocale}`;
      return acc;
    },
    {} as Record<string, string>,
  );

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description: description,
    keywords: [
      "영문 이력서 변환",
      "영문 이력서 번역시",
      "한국 이력서 번역",
      "이력서 번역",
      "이력서 번역기",
      "PDF 이력서 번역",
      "영어 이력서 변환",
      "해외취업 이력서",
      "영어 이력서 번역",
      "AI 영문 이력서",
      "AI 영어 이력서",
      "국문 이력서 영문 변환",
      "영문 이력서 작성 사이트",
      "이력서 번역 사이트",
      "이력서 영어로",
      "CV 번역",
      "AI CV 작성",
      "영문 경력기술서",
      "외국계 이력서 양식",
      "레쥬메 번역",
      "링크드인 영문 프로필",
      "무료 영문 이력서 양식",
      "외국계 기업 이력서",
      "이력서 한영 번역",
      "경력직 영문 이력서",
      "CV 작성 사이트",
    ],
    authors: [{ name: locale === "ko" ? "지원고고 팀" : "ApplyGogo Team" }],
    creator: siteName,
    openGraph: {
      type: "website",
      locale: locale === "ko" ? "ko_KR" : locale === "ja" ? "ja_JP" : "en_US",
      url: `${baseUrl}${pathname}`,
      title: title,
      description: description,
      siteName: siteName,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${siteName} - AI Resume Builder`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `${baseUrl}${pathname}`,
      languages: languages,
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
      other: {
        "naver-site-verification": "61cfbc317ca630d31a228bf870264b602c553a67",
        "msvalidate.01": "E2E86ADA9E417FFA0BA39FE15B56ABB7",
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico?v=2" },
        { url: "/favicon-16x16.png?v=2", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png?v=2", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png?v=2" }],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // 유효한 로케일인지 확인
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // 클라이언트 컴포넌트를 위한 메시지 로드
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <GoogleAnalytics />
        <MicrosoftClarity />
        <NextTopLoader
          color="#2563eb"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563eb,0 0 5px #2563eb"
        />
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
