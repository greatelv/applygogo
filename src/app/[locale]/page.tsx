"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LandingPage } from "@/app/components/landing-page";
import { Locale } from "@/lib/i18n-utils";

export default function DynamicLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  const handleGetStarted = () => {
    setIsNavigating(true);
    const prefix = locale === "ko" ? "" : `/${locale}`;

    if (status === "authenticated") {
      router.push(`${prefix}/resumes`);
    } else {
      router.push(`${prefix}/login`);
    }
  };

  return (
    <>
      {locale === "ko" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "지원고고",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              description:
                "AI 기반 영문 이력서 변환 서비스로 국문 이력서를 글로벌 스탠다드 CV/Resume로 손쉽게 번역하고 첨삭받으세요.",
            }),
          }}
        />
      )}
      <LandingPage
        onGetStarted={handleGetStarted}
        isLoading={isNavigating}
        locale={locale as Locale}
      />
    </>
  );
}
