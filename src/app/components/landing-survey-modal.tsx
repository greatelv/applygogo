"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LandingSurveyModalProps {
  locale: string;
}

const SURVEY_KEY = "SURVEY_LANDING_REASON_KR_V1";

const OPTIONS = [
  {
    id: "annoying_ai_switch",
    text: "🤖 챗GPT 복사/붙여넣기 반복이 번거로워서",
  },
  {
    id: "first_time_lost",
    text: "📝 첫 영문/일문 이력서라 작성이 막막해서",
  },
  {
    id: "cost_burden",
    text: "💸 전문 첨삭 비용(대행사)이 너무 부담돼서",
  },
  {
    id: "quick_korean_use",
    text: "🚀 기존 한글 이력서로 빠르게 완성하고 싶어서",
  },
  {
    id: "ats_format_need",
    text: "🎯 ATS(채용 시스템) 통과율 높은 포맷이 필요해서",
  },
];

export function LandingSurveyModal({ locale }: LandingSurveyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Prevent hydration mismatch by checking mounting
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check only if locale is Korean
    if (locale !== "ko") return;

    const hasCompleted = localStorage.getItem(SURVEY_KEY);
    if (!hasCompleted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [locale]);

  const handleSelect = async (optionId: string, optionText: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // API Call
      await fetch("/api/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: "LANDING_REASON_KR",
          answer: optionText,
        }),
      });

      // Save to localStorage
      localStorage.setItem(SURVEY_KEY, "true");

      // Show Success Toast
      toast.success("소중한 의견 감사합니다!", {
        description: "ApplyGoGo가 더 나은 서비스를 만드는 데 큰 도움이 됩니다.",
        duration: 3000,
      });

      // Close Modal immediately
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to submit survey", error);
      // Still close and save to prevent bad UX loop
      localStorage.setItem(SURVEY_KEY, "true");
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // If skipped, mark as seen so it doesn't pop up again (or use a different key for "remind later")
    // For now, let's treat explicit skip as "don't show again" to be safe.
    localStorage.setItem(SURVEY_KEY, "true");
    setIsOpen(false);
  };

  if (!isMounted) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // When user clicks outside or requests close
        if (!open) {
          setIsOpen(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-md data-[state=closed]:zoom-out-100 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] duration-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center pb-2 break-keep">
            잠깐! <span className="text-primary">ApplyGoGo</span>를 방문하신
            <br />
            가장 큰 이유는 무엇인가요?
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground font-medium text-base break-keep">
            여러분의 의견을 들려주시면
            <br />더 좋은 서비스를 만드는 데 큰 도움이 됩니다. 🙇‍♂️
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          {OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id, option.text)}
              disabled={isSubmitting}
              className={cn(
                "w-full text-left p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all duration-200 text-sm font-medium",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-[0.98]",
                "min-h-[54px] flex items-center",
                isSubmitting && "opacity-50 cursor-not-allowed justify-center",
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  제출 중...
                </>
              ) : (
                option.text
              )}
            </button>
          ))}
        </div>
        <div className="text-center mt-2">
          <button
            onClick={handleSkip}
            className="text-xs text-muted-foreground underline hover:text-foreground p-2"
          >
            건너뛰기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
