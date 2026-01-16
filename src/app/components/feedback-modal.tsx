"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Star } from "lucide-react";
import { submitFeedback } from "@/app/actions/feedback";
import { toast } from "sonner";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("의견을 작성해주세요.");
      return;
    }
    setIsSubmitting(true);
    const result = await submitFeedback({
      content,
      rating,
      pageUrl: window.location.href,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("소중한 의견 감사합니다!");
      setContent("");
      setRating(5);
      onOpenChange(false);
    } else {
      toast.error(result.error || "오류가 발생했습니다.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Feature Request & Feedback 보내기</DialogTitle>
          <DialogDescription>
            서비스 이용 중 불편한 점이나 필요한 기능을 자유롭게 남겨주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>서비스 만족도</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  type="button"
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`size-8 ${
                      value <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="feedback">내용</Label>
            <Textarea
              id="feedback"
              placeholder="여기에 의견을 작성해주세요. (예: Resume 템플릿이 더 다양했으면 좋겠어요, 번역 속도가 더 빨랐으면 좋겠어요 등)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-32 resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "제출 중..." : "제출하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
