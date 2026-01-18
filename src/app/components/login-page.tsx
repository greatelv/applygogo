"use client";

import { useSearchParams } from "next/navigation";
import { Chrome, Languages } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Link } from "@/i18n/routing";
import { Button } from "./ui/button";
import { useInAppBrowser } from "../../hooks/use-in-app-browser";

interface LoginPageProps {
  onGoogleLogin: () => void;
  onNaverLogin: () => void;
  onCredentialLogin?: (formData: FormData) => void;
}

import { useTranslations, useLocale } from "next-intl";

export function LoginPage({
  onGoogleLogin,
  onNaverLogin,
  onCredentialLogin,
}: LoginPageProps) {
  const t = useTranslations("login");
  const locale = useLocale();
  const isGlobal = locale !== "ko";
  const { pending } = useFormStatus();
  const searchParams = useSearchParams();
  const { isInAppBrowser } = useInAppBrowser();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-12 flex flex-col items-center">
          <Link href="/" className="mb-6 hover:opacity-80 transition-opacity">
            <h1 className="sr-only">{t("title")}</h1>
            <img
              src={
                isGlobal ? "/global/logo-for-light.svg" : "/logo-for-light.svg"
              }
              alt="ApplyGogo"
              className="h-10 w-auto dark:hidden"
            />
            <img
              src={
                isGlobal ? "/global/logo-for-black.svg" : "/logo-for-dark.svg"
              }
              alt="ApplyGogo"
              className="h-10 w-auto hidden dark:block"
            />
          </Link>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </div>

        <div className="space-y-4">
          {!isInAppBrowser ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={onGoogleLogin}
              disabled={pending}
            >
              <Chrome className="size-5 mr-2" />
              {t("google")}
            </Button>
          ) : (
            <div className="p-3 text-sm text-center text-amber-600 bg-amber-50 rounded-md border border-amber-200 mb-2">
              <span className="block mb-1 break-keep">{t("inAppWarning")}</span>
              <span className="text-xs text-muted-foreground block break-keep">
                {t("inAppAdvice")}
              </span>
            </div>
          )}

          {!isGlobal && (
            <Button
              type="button"
              size="lg"
              className="w-full bg-[#03C75A] hover:bg-[#02b351] text-white"
              onClick={onNaverLogin}
              disabled={pending}
            >
              <span className="font-bold mr-2 text-lg">N</span>
              {t("naver")}
            </Button>
          )}

          {/* Test Login Form (Only visible with ?mode=test) */}
          {searchParams.get("mode") === "test" && onCredentialLogin && (
            <form
              action={onCredentialLogin}
              className="mt-4 p-4 border border-dashed border-neutral-700/50 rounded-lg bg-neutral-900/50"
            >
              <div className="text-xs text-muted-foreground mb-3 text-center font-mono">
                {t("developerAccess")}
              </div>
              <div className="space-y-3">
                <input
                  type="email"
                  name="email"
                  placeholder="Test Email"
                  className="w-full h-10 px-3 rounded-md border border-neutral-800 bg-neutral-950 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Test Password"
                  className="w-full h-10 px-3 rounded-md border border-neutral-800 bg-neutral-950 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                  required
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full h-10 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700"
                  disabled={pending}
                >
                  {t("testLogin")}
                </Button>
              </div>
            </form>
          )}

          <div className="text-xs text-center text-muted-foreground mt-6">
            {t.rich("termsAgreement", {
              terms: (chunks) => (
                <a href="/terms" className="underline hover:text-foreground">
                  {chunks}
                </a>
              ),
              privacy: (chunks) => (
                <a href="/privacy" className="underline hover:text-foreground">
                  {chunks}
                </a>
              ),
            })}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center text-sm">
            <div>
              <div className="text-2xl mb-1">✨</div>
              <div className="text-muted-foreground text-xs">
                {t("features.aiSummary")}
              </div>
            </div>
            <div>
              <div className="text-2xl mb-1">🌐</div>
              <div className="text-muted-foreground text-xs">
                {t("features.proTranslation")}
              </div>
            </div>
            <div>
              <div className="text-2xl mb-1">📄</div>
              <div className="text-muted-foreground text-xs">
                {t("features.pdfExport")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
