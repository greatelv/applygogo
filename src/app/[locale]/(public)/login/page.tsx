"use client";

import { LoginPage } from "@/app/components/login-page";
import {
  authenticate,
  authenticateNaver,
  authenticateWithCredentials,
} from "@/app/lib/actions";

import { Suspense } from "react";

import { useLocale } from "next-intl";

export default function Page() {
  const locale = useLocale();

  return (
    <Suspense fallback={null}>
      <LoginPage
        onGoogleLogin={() => authenticate(locale)}
        onNaverLogin={() => authenticateNaver(locale)}
        onCredentialLogin={authenticateWithCredentials.bind(null, locale)}
      />
    </Suspense>
  );
}
