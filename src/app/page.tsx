"use client";

import { LandingPage } from "@/components/landing-page";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const handleGetStarted = () => {
    // Navigate to Login (or Dashboard if implementing just mock auth first)
    // For now, let's redirect to login
    router.push("/login"); // or /dashboard based on logic
  };

  // In the original App.tsx, logic was: If !auth -> Login.
  // But LandingPage was shown first if showLanding=true.
  // "Get Started" -> showLanding=false -> Login.

  return <LandingPage onGetStarted={handleGetStarted} />;
}
