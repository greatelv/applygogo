import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";

interface NewResumePageProps {
  onUpload: (file: File) => void;
}

export function NewResumePage({ onUpload }: NewResumePageProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      onUpload(file);
    } else {
      alert("PDF 파일만 업로드 가능합니다.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl mb-2">새 이력서 만들기</h1>
        <p className="text-sm text-muted-foreground">
          한국어 PDF 이력서를 업로드하여 AI 기반 영문 변환을 시작하세요
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-colors
          ${
            isDragging
              ? "border-foreground/40 bg-accent"
              : "border-border hover:border-foreground/30"
          }
        `}
      >
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
        />
        <label htmlFor="file-upload">
          <div
            className={buttonVariants({ variant: "default", size: "default" })}
          >
            <FileText className="size-4" />
            파일 선택
          </div>
        </label>
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
        <h4 className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-300">
          💡 팁
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• 경력사항이 명확하게 구분된 이력서가 가장 좋은 결과를 냅니다</li>
          <li>• 10MB 이하의 PDF 파일을 권장합니다</li>
          <li>
            • 업로드 후 요약, 번역 단계를 거쳐 최종 PDF를 받을 수 있습니다
          </li>
        </ul>
      </div>
    </div>
  );
}
