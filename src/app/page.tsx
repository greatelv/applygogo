"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LandingPage } from "./components/landing-page";

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "ApplyGogo",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            description:
              "AI-powered Korean resume builder for global talents. Convert your English resume to professional Korean optimized for the Korean job market.",
          }),
        }}
      />
      <LandingPage onGetStarted={handleGetStarted} isLoading={isNavigating} />
    </>
  );
}
