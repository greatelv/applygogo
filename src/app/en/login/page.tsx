"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { LoginPage } from "@/app/components/login-page";

export default function EnLoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/en/dashboard";

  return (
    <LoginPage
      onGoogleLogin={() => signIn("google", { callbackUrl })}
      onNaverLogin={() => signIn("naver", { callbackUrl })}
      locale="en"
    />
  );
}
