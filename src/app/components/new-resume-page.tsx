import { useState } from "react";
import { Upload, FileText, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { useRouter } from "@/i18n/routing";
import { useApp } from "../context/app-context";

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
}

const workflowSteps = [
  { id: "upload", label: "PDF 업로드", description: "이력서 파일 선택" },
  { id: "processing", label: "AI 처리", description: "요약 & 번역" },
  { id: "edit", label: "편집", description: "내용 수정" },
  { id: "preview", label: "미리보기", description: "템플릿 선택" },
];

export function NewResumePage({ onUpload, isUploading }: NewResumePageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "PDF 파일만 업로드 가능합니다. 다시 시도해주세요.",
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
        setErrorMessage(
          "파일 용량이 5MB를 초과합니다. 더 작은 파일을 업로드해주세요.",
        );
        setShowErrorDialog(true);
        return;
      }
      onUpload(file);
      setSelectedFile(file);
    } else {
      setErrorMessage("PDF 파일만 업로드 가능합니다. 다시 시도해주세요.");
      setShowErrorDialog(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasSufficientCredits) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(
          "파일 용량이 5MB를 초과합니다. 더 작은 파일을 업로드해주세요.",
        );
        setShowErrorDialog(true);
        e.target.value = ""; // Reset input
        return;
      }
      onUpload(file);
      setSelectedFile(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl mb-2">업로드</h1>
        <p className="text-sm text-muted-foreground">
          PDF 이력서를 업로드하면 AI가 자동으로 요약하고 영문 번역해드립니다
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
                  크레딧이 부족합니다
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  AI 이력서 분석을 진행하기 위해 필요한 크레딧이 부족합니다.
                  <br />
                  결제를 통해 크레딧을 충전하고 분석을 시작해보세요.
                </p>
              </div>
            </div>

            <div className="max-w-xs mx-auto">
              {plan === "FREE" ? (
                <Button
                  onClick={() => router.push("/settings#payment-section")}
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md border-0"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-4" />
                    이용권 구매하고 무제한 이용하기
                  </span>
                </Button>
              ) : (
                <Button
                  onClick={() => router.push("/settings#payment-section")}
                  className="w-full h-11"
                >
                  크레딧 충전하기
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
              <h3 className="text-lg font-medium">업로드 중...</h3>
              <p className="text-sm text-muted-foreground">
                파일을 안전하게 저장하고 있습니다.
              </p>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-muted mb-4">
                <Upload className="size-8 text-muted-foreground" />
              </div>

              <h3 className="text-lg mb-2">PDF 파일을 드래그하여 업로드</h3>
              <p className="text-sm text-muted-foreground mb-6">
                또는 아래 버튼을 클릭하여 파일 선택
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
                파일 선택
              </Button>
            </>
          )}
        </div>
      )}

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>올바르지 않은 파일 형식</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
        <h4 className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-300">
          💡 팁
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• 경력사항이 명확하게 구분된 이력서가 가장 좋은 결과를 냅니다</li>
          <li>• 5MB 이하의 PDF 파일을 권장합니다</li>
          <li>
            • 업로드 후 요약, 번역 단계를 거쳐 최종 PDF를 받을 수 있습니다
          </li>
        </ul>
      </div>
    </div>
  );
}
