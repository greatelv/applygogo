import { Metadata } from "next";
import { Locale } from "@/lib/i18n-utils";
import "../../styles/index.css";
import { Providers } from "@/app/providers";
import NextTopLoader from "nextjs-toploader";
import { GoogleAnalytics, MicrosoftClarity } from "@/app/components/analytics";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const baseMetadata = {
    ko: {
      title: "AI로 완성하는 고품질의 영문 이력서 - 지원고고",
      description:
        "AI 기반 영문 이력서 변환 서비스로 국문 이력서를 글로벌 스탠다드 CV/Resume로 손쉽게 번역하고 만들어보세요.",
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
      ogLocale: "ko_KR",
    },
    en: {
      title: "ApplyGoGo - AI-Powered Resume Transformation",
      description:
        "Transform your Korean resume into a global standard CV/Resume effortlessly with our AI-powered service.",
      keywords: [
        "Resume translation",
        "CV builder",
        "Korean to English resume",
        "AI resume",
        "Global career",
        "Resume converter",
      ],
      ogLocale: "en_US",
    },
    ja: {
      title: "支援ゴーゴー - AIによる履歴書変換",
      description:
        "AIベースの履歴書変換サービスで、韓国語の履歴書をグローバル基準のCV/Resumeに簡単に翻訳・作成しましょう。",
      keywords: [
        "履歴書翻訳",
        "AI履歴書",
        "韓国語履歴書翻訳",
        "英文履歴書作成",
        "グローバル就職",
      ],
      ogLocale: "ja_JP",
    },
  };

  const current = baseMetadata[locale as Locale] || baseMetadata.ko;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://applygogo.com";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: current.title,
      template: `%s | ${locale === "en" ? "ApplyGoGo" : "지원고고"}`,
    },
    description: current.description,
    keywords: current.keywords,
    openGraph: {
      type: "website",
      locale: current.ogLocale,
      url: `/${locale}`,
      title: current.title,
      description: current.description,
      siteName: locale === "en" ? "ApplyGoGo" : "지원고고",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt:
            locale === "en"
              ? "ApplyGoGo - AI Resume Builder"
              : "지원고고 - AI 영문 이력서 빌더",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: current.title,
      description: current.description,
      images: ["/og-image.png"],
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
    manifest: "/site.webmanifest?v=2",
    alternates: {
      canonical: locale === "ko" ? "/" : `/${locale}`,
      languages: {
        ko: "https://applygogo.com",
        en: "https://applygogo.com/en",
        ja: "https://applygogo.com/ja",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
