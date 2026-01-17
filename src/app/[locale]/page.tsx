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
    if (status === "authenticated") {
      router.push(`/${locale}/resumes`);
    } else {
      router.push(`/${locale}/login`);
    }
  };

  return (
    <LandingPage
      onGetStarted={handleGetStarted}
      isLoading={isNavigating}
      locale={locale as Locale}
    />
  );
}
