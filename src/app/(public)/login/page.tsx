"use client";

import { LoginPage } from "../../components/login-page";
import { authenticate, authenticateNaver } from "../../lib/actions";

export default function Page() {
  return (
    <LoginPage onGoogleLogin={authenticate} onNaverLogin={authenticateNaver} />
  );
}
