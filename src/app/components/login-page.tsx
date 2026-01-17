"use client";

import { useSearchParams } from "next/navigation";
import { Chrome } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { Logo } from "./logo";

import { useInAppBrowser } from "../../hooks/use-in-app-browser";

interface LoginPageProps {
  onGoogleLogin: () => void;
  onCredentialLogin?: (formData: FormData) => void;
}

export function LoginPage({
  onGoogleLogin,
  onCredentialLogin,
}: LoginPageProps) {
  const { pending } = useFormStatus();
  const searchParams = useSearchParams();
  const { isInAppBrowser } = useInAppBrowser();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-8">
        <div className="flex flex-col items-center mb-12">
          <Logo className="mb-4" />
          <p className="text-muted-foreground text-sm">
            AI-Powered English to Korean Resume Conversion
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
              Continue with Google
            </Button>
          ) : (
            <div className="p-3 text-sm text-center text-amber-600 bg-amber-50 rounded-md border border-amber-200 mb-2">
              <span className="block mb-1 break-keep">
                ⚠️ Google login is not supported in in-app browsers.
              </span>
              <span className="text-xs text-muted-foreground block break-keep">
                (Please open this page in Chrome, Safari, or another external
                browser)
              </span>
            </div>
          )}

          {/* Test Login Form (Only visible with ?mode=test) */}
          {searchParams.get("mode") === "test" && onCredentialLogin && (
            <form
              action={onCredentialLogin}
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
                  Login with Test Account
                </Button>
              </div>
            </form>
          )}

          <p className="text-xs text-center text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-foreground">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-foreground">
              Privacy Policy
            </a>
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center text-sm">
            <div>
              <div className="text-2xl mb-1">✨</div>
              <div className="text-muted-foreground text-[10px] uppercase font-semibold">
                AI Summary
              </div>
            </div>
            <div>
              <div className="text-2xl mb-1">🌐</div>
              <div className="text-muted-foreground text-[10px] uppercase font-semibold">
                Expert Translation
              </div>
            </div>
            <div>
              <div className="text-2xl mb-1">📄</div>
              <div className="text-muted-foreground text-[10px] uppercase font-semibold">
                Export to PDF
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
