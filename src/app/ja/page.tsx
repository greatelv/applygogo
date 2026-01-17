"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LandingPage } from "@/app/components/landing-page";

export default function JaLandingPage() {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  const handleGetStarted = () => {
    setIsNavigating(true);
    if (status === "authenticated") {
      router.push("/ja/dashboard");
    } else {
      router.push("/ja/login");
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
            name: "ApplyGoGo - 韓国就職AI",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "1200",
              priceCurrency: "JPY",
            },
            description: "AI韓国履歴書翻訳サービス",
            inLanguage: ["ja", "ko"],
          }),
        }}
      />
      <LandingPage
        onGetStarted={handleGetStarted}
        isLoading={isNavigating}
        locale="ja"
      />
    </>
  );
}
