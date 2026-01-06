"use client";

import { useState, useCallback, useRef } from "react";
import { UploadCloud, FileText, X, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  action: (formData: FormData) => Promise<void>;
}

export function FileUpload({ action }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setError("PDF 파일만 업로드 가능합니다.");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      setError("파일 크기는 10MB 이하여야 합니다.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        // Sync with hidden input
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(droppedFile);
          fileInputRef.current.files = dataTransfer.files;
        }
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      } else {
        // Reset input if invalid
        e.target.value = "";
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (!file) return;
    setIsPending(true);
    try {
      await action(formData);
    } catch (e) {
      setError("업로드 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setIsPending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form action={handleSubmit}>
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            error && "border-destructive/50 bg-destructive/5"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            name="file"
            accept=".pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isPending}
          />

          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "p-4 rounded-full bg-background ring-1 ring-border shadow-sm",
                isDragging && "scale-110 transition-transform"
              )}
            >
              {isPending ? (
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
              ) : (
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {isDragging ? "파일을 놓으세요" : "이력서를 업로드하세요"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                PDF (최대 10MB)
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive mt-4 bg-destructive/10 p-3 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        {file && !error && (
          <div className="mt-4 p-4 border rounded-md bg-card flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="text-muted-foreground hover:text-foreground"
              disabled={isPending}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-8">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!file || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                분석 중...
              </>
            ) : (
              "이력서 분석하기"
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-4">
            업로드된 파일은 분석 후 즉시 삭제됩니다
          </p>
        </div>
      </form>
    </div>
  );
}
