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
              "AI 기반 이력서 빌더로 글로벌 취업 기회를 잡으세요. 몇 분 만에 전문적인 이력서를 작성할 수 있습니다.",
          }),
        }}
      />
      <LandingPage onGetStarted={handleGetStarted} />
    </>
  );
}
