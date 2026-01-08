import { useRef } from "react";
import {
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Edit,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ModernTemplate } from "./resume-templates/modern-template";
import { ClassicTemplate } from "./resume-templates/classic-template";
import { MinimalTemplate } from "./resume-templates/minimal-template";
import { toast } from "sonner";

interface TranslatedExperience {
  id: string;
  company: string;
  position: string;
  period: string;
  bullets: string[];
  companyEn: string;
  positionEn: string;
  bulletsEn: string[];
}

const statusConfig = {
  IDLE: { label: "업로드됨", variant: "outline" as const },
  SUMMARIZED: { label: "요약됨", variant: "secondary" as const },
  TRANSLATED: { label: "번역됨", variant: "secondary" as const },
  COMPLETED: { label: "완료", variant: "default" as const },
  FAILED: { label: "실패", variant: "warning" as const },
};

interface ResumeDetailPageProps {
  resumeId?: string;
  resumeTitle?: string;
  personalInfo?: {
    name_kr: string;
    name_en: string;
    email: string;
    phone: string;
    links: any[];
  };
  experiences?: TranslatedExperience[];
  template?: string;
  isWorkflowComplete?: boolean;
  onBack: () => void;
  onDelete?: (id: string) => void;
  onDownload?: () => void;
  onEdit?: () => void;
}

export function ResumeDetailPage({
  resumeId,
  resumeTitle,
  personalInfo,
  experiences,
  template = "modern",
  isWorkflowComplete = false,
  onBack,
  onDelete,
  onDownload,
  onEdit,
}: ResumeDetailPageProps) {
  // Use props data
  const resume = {
    id: resumeId || "",
    title: resumeTitle || "이력서",
    personalInfo,
    status: (isWorkflowComplete ? "COMPLETED" : "COMPLETED") as "COMPLETED", // TODO: Pass status prop if needed
    updatedAt: new Date().toISOString(), // This should ideally be passed as prop
    template,
    experiences: experiences || [],
  };

  const config = statusConfig[resume.status];

  // Ref is kept for Preview display (though not used for PDF generation anymore)
  const componentRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    try {
      const { pdf } = await import("@react-pdf/renderer");
      // Dynamic import to avoid SSR issues with React-PDF
      const { ModernPdf, registerFonts } = await import(
        "./pdf-templates/modern-pdf"
      );
      const { ClassicPdf } = await import("./pdf-templates/classic-pdf");
      const { MinimalPdf } = await import("./pdf-templates/minimal-pdf");

      // Register fonts with correct URL
      registerFonts();

      let doc;
      const commonProps = {
        personalInfo: resume.personalInfo,
        experiences: resume.experiences,
        // @ts-ignore
        educations: [],
        // @ts-ignore
        skills: [],
      };

      switch (resume.template) {
        case "classic":
          doc = <ClassicPdf {...commonProps} />;
          break;
        case "minimal":
          doc = <MinimalPdf {...commonProps} />;
          break;
        case "modern":
        default:
          doc = <ModernPdf {...commonProps} />;
          break;
      }

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resume.title || "resume"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF 다운로드가 완료되었습니다");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("PDF 생성 중 오류가 발생했습니다");
    }
  };

  const renderTemplate = () => {
    switch (resume.template) {
      case "classic":
        return (
          <ClassicTemplate
            personalInfo={resume.personalInfo}
            experiences={resume.experiences || []}
          />
        );
      case "minimal":
        return (
          <MinimalTemplate
            personalInfo={resume.personalInfo}
            experiences={resume.experiences || []}
          />
        );
      case "modern":
      default:
        return (
          <ModernTemplate
            personalInfo={resume.personalInfo}
            experiences={resume.experiences || []}
            // @ts-ignore
            educations={[]}
            // @ts-ignore
            skills={[]}
          />
        );
    }
  };

  const handleDeleteConfirm = () => {
    if (confirm("정말 이 이력서를 삭제하시겠습니까?")) {
      if (resumeId && onDelete) {
        onDelete(resumeId);
        toast.success("이력서가 삭제되었습니다");
      }
      onBack();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Banner */}
      {isWorkflowComplete && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/50 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900 dark:text-green-300">
              이력서가 성공적으로 생성되었습니다!
            </p>
            <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
              아래에서 최종 결과물을 확인하고 PDF로 다운로드하세요.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl">{resume.title}</h1>
              <Badge variant={config.variant}>{config.label}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span
                className="flex items-center gap-1"
                suppressHydrationWarning
              >
                <Clock className="size-4" />
                {isWorkflowComplete
                  ? "방금 전"
                  : `최종 수정: ${new Date(resume.updatedAt).toLocaleString(
                      "ko-KR"
                    )}`}
              </span>
              <span>템플릿: {resume.template}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="size-4" />
              {isWorkflowComplete ? "이전" : "목록으로"}
            </Button>
            {!isWorkflowComplete && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteConfirm}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="size-4" />
                수정
              </Button>
            )}
            <Button onClick={handleDownload}>
              <Download className="size-4" />
              PDF 다운로드
            </Button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
        <div className="bg-muted/30 p-4">
          <div
            ref={componentRef}
            className="aspect-[210/297] bg-white text-black shadow-lg mx-auto"
          >
            {renderTemplate()}
          </div>
        </div>
      </div>

      {/* Original Korean Version */}
      <details className="bg-card border border-border rounded-lg p-6">
        <summary className="cursor-pointer font-semibold mb-4 flex items-center gap-2">
          <span>한글 원본 보기</span>
          <span className="text-xs text-muted-foreground">
            (클릭하여 펼치기)
          </span>
        </summary>
        <div className="space-y-6 pt-4 border-t border-border">
          {(resume.experiences || []).map((exp: any) => (
            <div key={exp.id}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{exp.company}</h4>
                  <p className="text-sm text-muted-foreground">
                    {exp.position}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {exp.period}
                </span>
              </div>
              <ul className="space-y-1">
                {exp.bullets.map((bullet: string, index: number) => (
                  <li
                    key={index}
                    className="text-sm flex gap-2 text-muted-foreground"
                  >
                    <span className="flex-shrink-0">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
