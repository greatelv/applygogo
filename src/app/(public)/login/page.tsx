"use client";

import { useRouter } from "next/navigation";
import { LoginPage } from "../../components/login-page";

export default function Page() {
  const router = useRouter();

  const handleLogin = () => {
    // TODO: Implement Supabase Auth
    // Mock login redirect
    router.push("/resumes");
  };

  return <LoginPage onLogin={handleLogin} />;
}
