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

  return <LandingPage onGetStarted={handleGetStarted} />;
}
