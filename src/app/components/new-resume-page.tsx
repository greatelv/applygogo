"use client";

import { useState } from "react";
import { Upload, FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/app/lib/utils";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/app-context";
import { t, Locale } from "@/lib/i18n-utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface NewResumePageProps {
  onUpload: (file: File) => void;
  isUploading?: boolean;
  locale?: Locale;
}

export function NewResumePage({
  onUpload,
  isUploading,
  locale = "ko",
}: NewResumePageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    t(locale, "Upload.error.invalidType"),
  );

  const router = useRouter();
  const { quota, plan } = useApp();
  const hasSufficientCredits = quota >= 1;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isUploading || !hasSufficientCredits) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading || !hasSufficientCredits) return;

    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(t(locale, "Upload.error.sizeLimit"));
        setShowErrorDialog(true);
        return;
      }
      onUpload(file);
    } else {
      setErrorMessage(t(locale, "Upload.error.invalidType"));
      setShowErrorDialog(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasSufficientCredits) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(t(locale, "Upload.error.sizeLimit"));
        setShowErrorDialog(true);
        e.target.value = ""; // Reset input
        return;
      }
      onUpload(file);
    }
  };

  // Settings path handling
  const settingsPath =
    locale === "ko"
      ? "/settings#payment-section"
      : `/${locale}/settings#payment-section`;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl mb-2">{t(locale, "Upload.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t(locale, "Upload.description")}
        </p>
      </div>

      {!hasSufficientCredits ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="p-12">
            <div className="flex flex-col items-center text-center gap-6 mb-8">
              <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full shrink-0">
                <Sparkles className="size-8 text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {t(locale, "Upload.noCredits.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto whitespace-pre-wrap">
                  {t(locale, "Upload.noCredits.description")}
                </p>
              </div>
            </div>

            <div className="max-w-xs mx-auto">
              {plan === "FREE" ? (
                <Button
                  onClick={() => router.push(settingsPath)}
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md border-0"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-4" />
                    {t(locale, "Upload.noCredits.buyButton")}
                  </span>
                </Button>
              ) : (
                <Button
                  onClick={() => router.push(settingsPath)}
                  className="w-full h-11"
                >
                  {t(locale, "Upload.noCredits.rechargeButton")}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center transition-colors relative cursor-pointer",
            isDragging
              ? "border-foreground/40 bg-accent"
              : "border-border hover:border-foreground/30",
            isUploading && "opacity-50 pointer-events-none",
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="size-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium">
                {t(locale, "Upload.uploading.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(locale, "Upload.uploading.description")}
              </p>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-muted mb-4">
                <Upload className="size-8 text-muted-foreground" />
              </div>

              <h3 className="text-lg mb-2">
                {t(locale, "Upload.dragDrop.title")}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t(locale, "Upload.dragDrop.subtitle")}
              </p>

              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <Button
                isLoading={isUploading}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <FileText className="size-4" />
                {t(locale, "Upload.dragDrop.button")}
              </Button>
            </>
          )}
        </div>
      )}

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(locale, "Upload.error.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              {t(locale, "Upload.error.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
        <h4 className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-300">
          {t(locale, "Upload.tips.title")}
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          {/* tips.list는 배열이므로 map으로 처리해야 하는데, t함수가 문자열만 반환하므로 키를 분리해서 호출해야 함 */}
          {/* 혹은, t 함수가 객체를 반환하지 않으므로, 3개의 팁을 하드코딩된 키(list.0, list.1...)로 접근 */}
          <li>• {t(locale, "Upload.tips.list.0")}</li>
          <li>• {t(locale, "Upload.tips.list.1")}</li>
          <li>• {t(locale, "Upload.tips.list.2")}</li>
        </ul>
      </div>
    </div>
  );
}
