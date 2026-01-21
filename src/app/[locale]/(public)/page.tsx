"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { LandingPage } from "@/app/components/landing-page";

import { useSession } from "next-auth/react";

export default function Page() {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  const handleGetStarted = () => {
    setIsNavigating(true);
    if (status === "authenticated") {
      router.push("/resumes");
    } else {
      router.push("/login");
    }
  };

  const params = useParams();
  const locale = (params?.locale as string) || "ko";

  const schemaData = {
    ko: {
      name: "지원고고",
      description:
        "AI 기반 영문 이력서 변환 서비스로 국문 이력서를 글로벌 스탠다드 CV/Resume로 손쉽게 번역하고 첨삭받으세요.",
    },
    en: {
      name: "ApplyGogo",
      description:
        "AI-powered resume translator that converts your English resume into Korean. Perfect for foreigners seeking jobs in Korea.",
    },
    ja: {
      name: "支援ゴーゴー",
      description:
        "AIで日本語の履歴書を韓国語に翻訳。韓国就職・韓国企業への応募に最適な履歴書を簡単に作成できます。",
    },
  };

  const currentSchema =
    schemaData[locale as keyof typeof schemaData] || schemaData.en;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: currentSchema.name,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description: currentSchema.description,
          }),
        }}
      />
      <LandingPage onGetStarted={handleGetStarted} isLoading={isNavigating} />
    </>
  );
}
