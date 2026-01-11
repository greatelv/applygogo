"use client";

import { useRouter } from "next/navigation";
import { LandingPage } from "../components/landing-page";

import { useSession } from "next-auth/react";

export default function Page() {
  const router = useRouter();
  const { status } = useSession();

  const handleGetStarted = () => {
    if (status === "authenticated") {
      router.push("/resumes");
    } else {
      router.push("/login");
    }
  };

  return (
    <>
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
      <LandingPage onGetStarted={handleGetStarted} />
    </>
  );
}
