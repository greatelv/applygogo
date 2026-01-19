"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Header } from "@/app/components/header";
import { useRouter } from "@/i18n/routing";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Link } from "@/i18n/routing";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";

export function BlogHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const locale = useLocale();
  const isGlobal = locale !== "ko";

  // If loading, show a skeleton or nothing
  if (status === "loading") {
    return <div className="h-16 border-b border-border bg-background" />;
  }

  // If authenticated, show the full Header
  if (status === "authenticated" && session?.user) {
    return (
      <Header
        plan={session.user.planType || "FREE"}
        quota={session.user.credits || 0}
        userName={session.user.name || "사용자"}
        userEmail={session.user.email || ""}
        userImage={session.user.image || undefined}
        onLogout={() => signOut({ redirectTo: `/${locale}` })}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        // Blog doesn't have a sidebar, so these are no-ops or hidden
        isSidebarOpen={false}
      />
    );
  }

  // If not authenticated, show a public header version (reusing Landing Page style or simplified Header)
  // For consistency, we'll mimic the Landing Page header structure but keep it simple
  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img
              src={
                isGlobal ? "/global/logo-for-light.svg" : "/logo-for-light.svg"
              }
              alt="지원고고"
              className="h-6 w-auto dark:hidden"
            />
            <img
              src={
                isGlobal ? "/global/logo-for-black.svg" : "/logo-for-dark.svg"
              }
              alt="지원고고"
              className="h-6 w-auto hidden dark:block"
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/blog"
            className="text-sm font-bold text-foreground transition-colors"
          >
            블로그
          </Link>
          <ThemeToggle />
          <Button onClick={() => signIn()} size="sm">
            로그인
          </Button>
        </div>
      </div>
    </header>
  );
}
