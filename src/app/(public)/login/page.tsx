"use client";

import { LoginPage } from "../../components/login-page";
import { authenticate } from "../../lib/actions";

export default function Page() {
  return (
    <form action={authenticate}>
      <LoginPage onLogin={() => {}} />
    </form>
  );
}
