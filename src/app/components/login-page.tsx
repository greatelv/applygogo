"use client";

import { useSearchParams } from "next/navigation";
import { Chrome } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";

import { useInAppBrowser } from "../../hooks/use-in-app-browser";

interface LoginPageProps {
  onGoogleLogin: () => void;
  onNaverLogin: () => void;
  onCredentialLogin?: (formData: FormData) => void;
}

export function LoginPage({
  onGoogleLogin,
  onNaverLogin,
  onCredentialLogin,
}: LoginPageProps) {
  const { pending } = useFormStatus();
  const searchParams = useSearchParams();
  const { isInAppBrowser } = useInAppBrowser();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl tracking-tight mb-3">지원고고</h1>
          <p className="text-muted-foreground text-sm">
            한국어 Resume를 글로벌 스탠다드 영문 Resume로
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
              Google로 시작하기
            </Button>
          ) : (
            <div className="p-3 text-sm text-center text-amber-600 bg-amber-50 rounded-md border border-amber-200 mb-2">
              <span className="block mb-1 break-keep">
                ⚠️ 인앱 브라우저에서는 구글 로그인을 지원하지 않습니다.
              </span>
              <span className="text-xs text-muted-foreground block break-keep">
                (원활한 사용을 위해 네이버 로그인을 이용해주세요)
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
            네이버로 시작하기
          </Button>

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
                  테스트 계정 로그인
                </Button>
              </div>
            </form>
          )}

          <p className="text-xs text-center text-muted-foreground mt-6">
            로그인하면{" "}
            <a href="#" className="underline hover:text-foreground">
              서비스 약관
            </a>
            과{" "}
            <a href="#" className="underline hover:text-foreground">
              개인정보 Processing방침
            </a>
            에 동의하게 됩니다
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center text-sm">
            <div>
              <div className="text-2xl mb-1">✨</div>
              <div className="text-muted-foreground text-xs">AI 기반 요약</div>
            </div>
            <div>
              <div className="text-2xl mb-1">🌐</div>
              <div className="text-muted-foreground text-xs">전문 번역</div>
            </div>
            <div>
              <div className="text-2xl mb-1">📄</div>
              <div className="text-muted-foreground text-xs">PDF 내보내기</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
