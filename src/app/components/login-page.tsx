"use client";

import { useSearchParams } from "next/navigation";
import { Chrome, Languages } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { useInAppBrowser } from "../../hooks/use-in-app-browser";
import { LanguageSwitcher } from "./language-switcher";
import { t, Locale } from "@/lib/i18n-utils";

interface LoginPageProps {
  onGoogleLogin: () => void;
  onNaverLogin: () => void;
  onNaverLoginInSafari?: () => void; // 네이버 앱 실행용
  onNaverLoginInAppBrowser?: () => void; // 네이버 앱 실행용
  onCredentialLogin?: (formData: FormData) => void;
  locale?: Locale;
}

export function LoginPage({
  onGoogleLogin,
  onNaverLogin,
  onCredentialLogin,
  locale = "ko",
}: LoginPageProps) {
  const { pending } = useFormStatus();
  const searchParams = useSearchParams();
  const { isInAppBrowser } = useInAppBrowser();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Language Switcher - 우측 상단 */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl tracking-tight mb-3">
            {t(locale, "Login.title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t(locale, "Login.subtitle")}
          </p>
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
              {t(locale, "Login.google")}
            </Button>
          ) : (
            <div className="p-3 text-sm text-center text-amber-600 bg-amber-50 rounded-md border border-amber-200 mb-2">
              <span className="block mb-1 break-keep">
                {t(locale, "Login.inAppWarning.title")}
              </span>
              <span className="text-xs text-muted-foreground block break-keep">
                {t(locale, "Login.inAppWarning.description")}
              </span>
            </div>
          )}

          <Button
            type="button"
            size="lg"
            className="w-full bg-[#03C75A] hover:bg-[#02b351] text-white"
            onClick={onNaverLogin}
            disabled={pending}
          >
            <span className="font-bold mr-2 text-lg">N</span>
            {t(locale, "Login.naver")}
          </Button>

          {/* Test Login Form (Only visible with ?mode=test) */}
          {searchParams.get("mode") === "test" && onNaverLogin && (
            <form
              action={async (formData) => {
                // Testing Naver credentials if naver is clicked in test mode
                // but actually we use credential login for testing
                if (onCredentialLogin) onCredentialLogin(formData);
              }}
              className="mt-4 p-4 border border-dashed border-neutral-700/50 rounded-lg bg-neutral-900/50"
            >
              <div className="text-xs text-muted-foreground mb-3 text-center font-mono">
                DEVELOPER ACCESS
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
                  테스트 계정 로그인
                </Button>
              </div>
            </form>
          )}

          <p className="text-xs text-center text-muted-foreground mt-6">
            {t(locale, "Login.tos.prefix")}
            <a href="#" className="underline hover:text-foreground">
              {t(locale, "Login.tos.terms")}
            </a>
            {t(locale, "Login.tos.and")}
            <a href="#" className="underline hover:text-foreground">
              {t(locale, "Login.tos.privacy")}
            </a>
            {t(locale, "Login.tos.suffix")}
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center text-sm">
            <div>
              <div className="text-2xl mb-1">✨</div>
              <div className="text-muted-foreground text-xs">
                {t(locale, "Login.features.ai")}
              </div>
            </div>
            <div>
              <div className="text-2xl mb-1">🌐</div>
              <div className="text-muted-foreground text-xs">
                {t(locale, "Login.features.translation")}
              </div>
            </div>
            <div>
              <div className="text-2xl mb-1">📄</div>
              <div className="text-muted-foreground text-xs">
                {t(locale, "Login.features.pdf")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
