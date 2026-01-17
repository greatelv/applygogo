"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { LoginPage } from "@/app/components/login-page";

export default function JaLoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/ja/dashboard";

  return (
    <LoginPage
      onGoogleLogin={() => signIn("google", { callbackUrl })}
      onNaverLogin={() => signIn("naver", { callbackUrl })}
      locale="ja"
    />
  );
}
