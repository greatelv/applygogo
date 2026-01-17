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

  const metadata = {
    ko: {
      title: "지원고고 - AI 기반 자동 이력서 변환",
      description:
        "한국어 이력서를 글로벌 스탠다드 영문으로 AI가 자동 변환해드립니다.",
    },
    en: {
      title: "ApplyGoGo - AI-Powered Resume Transformation",
      description: "Transform your resume to global standards with AI.",
    },
    ja: {
      title: "支援ゴーゴー - AIによる履歴書変換",
      description: "あなたの履歴書をAIでグローバル基準の英語に変換します。",
    },
  };

  const currentMetadata = metadata[locale as Locale] || metadata.ko;

  return {
    title: currentMetadata.title,
    description: currentMetadata.description,
    alternates: {
      canonical: `https://applygogo.com/${locale}`,
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
