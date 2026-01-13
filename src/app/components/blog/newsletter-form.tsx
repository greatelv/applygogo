"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { ArrowRight, Mail, Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    // Email validation regex (simple)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("유효한 이메일 주소를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("구독 완료! 매주 유용한 꿀팁과 인사이트를 보내드릴게요.");
      setEmail("");
    } catch {
      toast.error(
        "구독 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto mt-8 mb-4">
      <div className="flex flex-col gap-3">
        <label htmlFor="email-signup" className="sr-only">
          이메일 주소
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <Mail className="h-5 w-5" />
          </div>
          <input
            id="email-signup"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            placeholder="이메일을 입력하세요"
            className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-transparent focus:border-primary/50 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/70 text-foreground"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl py-6 text-base font-medium shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:-translate-y-0.5"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : (
            <>
              신규 꿀팁과 할인정보 알림 받기
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center px-4">
          서비스별 꿀팁, 할인정보, 인사이트 아티클을 놓치지 마세요.
        </p>
      </div>
    </form>
  );
}
