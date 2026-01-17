"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LandingPage } from "@/app/components/landing-page";

// 간단한 래퍼 - locale context 제공
export default function EnLandingPage() {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  const handleGetStarted = () => {
    setIsNavigating(true);
    if (status === "authenticated") {
      router.push("/en/dashboard");
    } else {
      router.push("/en/login");
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
            name: "ApplyGoGo - Korea Job Resume AI",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "9",
              priceCurrency: "USD",
            },
            description: "AI-powered resume translation for Korean job market",
            inLanguage: ["en", "ko"],
          }),
        }}
      />
      {/* TODO 제거 - locale prop 추가 완료 */}
      <LandingPage
        onGetStarted={handleGetStarted}
        isLoading={isNavigating}
        locale="en"
      />
    </>
  );
}
