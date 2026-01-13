"use client";

import { Chrome } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { pending } = useFormStatus();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl tracking-tight mb-3">지원고고</h1>
          <p className="text-muted-foreground text-sm">
            한국어 이력서를 글로벌 스탠다드 영문 이력서로
          </p>
        </div>

        <div className="space-y-4">
          <Button
            type="submit"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onLogin}
            isLoading={pending}
            disabled={pending}
          >
            <Chrome className="size-5" />
            Google로 시작하기
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-6">
            로그인하면{" "}
            <a href="#" className="underline hover:text-foreground">
              서비스 약관
            </a>
            과{" "}
            <a href="#" className="underline hover:text-foreground">
              개인정보 처리방침
            </a>
            에 동의하게 됩니다
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <div className="grid grid-cols-3 gap-8 text-center text-sm">
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
