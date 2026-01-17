"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("feedbackModal");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error(t("notifications.emptyContent"));
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
      toast.success(t("notifications.success"));
      setContent("");
      setRating(5);
      onOpenChange(false);
    } else {
      toast.error(result.error || t("notifications.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{t("labels.rating")}</Label>
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
            <Label htmlFor="feedback">{t("labels.content")}</Label>
            <Textarea
              id="feedback"
              placeholder={t("placeholders.content")}
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
            {t("buttons.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("buttons.submitting") : t("buttons.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
