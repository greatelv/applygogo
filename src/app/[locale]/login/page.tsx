"use client";

import { use, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { LoginPage } from "@/app/components/login-page";
import { Locale } from "@/lib/i18n-utils";

export default function DynamicLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const searchParams = useSearchParams();

  // 기본 callbackUrl을 해당 로케일의 resumes로 설정
  const defaultCallbackUrl = `/${locale}/resumes`;
  const callbackUrl = searchParams.get("callbackUrl") || defaultCallbackUrl;

  return (
    <LoginPage
      onGoogleLogin={() => signIn("google", { callbackUrl })}
      onNaverLogin={() => signIn("naver", { callbackUrl })}
      locale={locale as Locale}
    />
  );
}
