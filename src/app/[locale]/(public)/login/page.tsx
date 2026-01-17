"use client";

import { LoginPage } from "@/app/components/login-page";
import {
  authenticate,
  authenticateNaver,
  authenticateWithCredentials,
} from "@/app/lib/actions";

import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginPage
        onGoogleLogin={authenticate}
        onNaverLogin={authenticateNaver}
        onCredentialLogin={authenticateWithCredentials}
      />
    </Suspense>
  );
}
