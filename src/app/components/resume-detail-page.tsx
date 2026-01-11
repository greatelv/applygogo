import { useRef, useState } from "react";
import {
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Edit,
  Layout,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ModernTemplate } from "./resume-templates/modern-template";
import { ClassicTemplate } from "./resume-templates/classic-template";
import { MinimalTemplate } from "./resume-templates/minimal-template";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

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
  educations?: any[];
  skills?: any[];
  additionalItems?: any[];
  template?: string;
  updatedAt?: string;
  isWorkflowComplete?: boolean;
  onBack: () => void;
  onDelete?: (id: string) => void;
  onDownload?: () => void;
  onEdit?: () => void;
  onChangeTemplate?: () => void;
}

export function ResumeDetailPage({
  resumeId,
  resumeTitle,
  personalInfo,
  experiences,
  educations = [],
  skills = [],
  additionalItems = [],
  template = "modern",
  isWorkflowComplete = false,
  onBack,
  onDelete,
  onDownload,
  onEdit,
  onChangeTemplate,
  updatedAt,
}: ResumeDetailPageProps) {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  // Use props data
  const resume = {
    id: resumeId || "",
    title: resumeTitle || "이력서",
    personalInfo,
    status: (isWorkflowComplete ? "COMPLETED" : "COMPLETED") as "COMPLETED",
    updatedAt: updatedAt || new Date().toISOString(),
    template,
    experiences: experiences || [],
    educations,
    skills,
    additionalItems,
    isWorkflowComplete,
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
        educations: resume.educations,
        skills: resume.skills,
        additionalItems: resume.additionalItems,
      };

      const templateKey = resume.template.toLowerCase();
      switch (templateKey) {
        case "classic":
          // @ts-ignore
          doc = <ClassicPdf {...commonProps} />;
          break;
        case "minimal":
          // @ts-ignore
          doc = <MinimalPdf {...commonProps} />;
          break;
        case "modern":
        default:
          // @ts-ignore
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
    const templateKey = resume.template.toLowerCase();
    const commonProps = {
      personalInfo: resume.personalInfo,
      experiences: resume.experiences || [],
      educations: resume.educations,
      skills: resume.skills,
      additionalItems: resume.additionalItems,
    };
    switch (templateKey) {
      case "classic":
        return <ClassicTemplate {...commonProps} />;
      case "minimal":
        return <MinimalTemplate {...commonProps} />;
      case "modern":
      default:
        return <ModernTemplate {...commonProps} />;
    }
  };

  const handleDeleteConfirm = () => {
    setIsDeleteAlertOpen(true);
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
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span
                className="flex items-center gap-1"
                suppressHydrationWarning
              >
                <Clock className="size-4" />
                {`최종 수정: ${new Date(resume.updatedAt).toLocaleString(
                  "ko-KR"
                )}`}
              </span>
              <div className="flex items-center gap-1.5">
                <span>템플릿:</span>
                <Badge variant="secondary" className="text-xs font-normal">
                  {resume.template.charAt(0).toUpperCase() +
                    resume.template.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="size-4 mr-1.5" />
              목록
            </Button>

            {onDelete && (
              <Button
                variant="outline"
                onClick={handleDeleteConfirm}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4 mr-1.5" />
                삭제
              </Button>
            )}

            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="size-4 mr-1.5" />
                편집
              </Button>
            )}

            <AlertDialog
              open={isDeleteAlertOpen}
              onOpenChange={setIsDeleteAlertOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>이력서 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    정말 이 이력서를 삭제하시겠습니까? 삭제된 데이터는 복구할 수
                    없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={() => {
                      if (resumeId && onDelete) {
                        onDelete(resumeId);
                        toast.success("이력서가 삭제되었습니다");
                      }
                      onBack();
                      setIsDeleteAlertOpen(false);
                    }}
                  >
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {onChangeTemplate && (
              <Button variant="outline" onClick={onChangeTemplate}>
                <Layout className="size-4 mr-1.5" />
                템플릿 선택
              </Button>
            )}

            <Button onClick={handleDownload} className="shadow-sm">
              <Download className="size-4 mr-1.5" />
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
          {/* Basic Info */}
          <section>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-4">
              기본 정보
            </h4>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-muted-foreground">이름</span>
                <span>{resume.personalInfo?.name_kr || "-"}</span>
              </div>
              {resume.personalInfo?.email && (
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="font-medium text-muted-foreground">
                    이메일
                  </span>
                  <span>{resume.personalInfo.email}</span>
                </div>
              )}
              {resume.personalInfo?.phone && (
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="font-medium text-muted-foreground">
                    연락처
                  </span>
                  <span>{resume.personalInfo.phone}</span>
                </div>
              )}
              {resume.personalInfo?.links &&
                resume.personalInfo.links.length > 0 && (
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">
                      링크
                    </span>
                    <div className="flex flex-col gap-1">
                      {resume.personalInfo.links.map((link: any, i: number) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline truncate"
                        >
                          {link.label || link.url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </section>

          {/* Experiences */}
          <section>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-4">
              경력 사항
            </h4>
            <div className="space-y-6">
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
          </section>

          {/* Educations */}
          {resume.educations && resume.educations.length > 0 && (
            <section className="pt-6 border-t border-border/50">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-4">
                학력 사항
              </h4>
              <div className="space-y-4">
                {resume.educations.map((edu: any) => (
                  <div
                    key={edu.id}
                    className="flex justify-between items-start"
                  >
                    <div>
                      <h4 className="font-semibold">{edu.school_name}</h4>
                      {((edu.degree && edu.degree !== "-") ||
                        (edu.major && edu.major !== "-")) && (
                        <p className="text-sm text-muted-foreground">
                          {edu.degree}
                          {edu.degree && edu.major && ", "}
                          {edu.major}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {edu.start_date} - {edu.end_date}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {resume.skills && resume.skills.length > 0 && (
            <section className="pt-6 border-t border-border/50">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-4">
                보유 기술
              </h4>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((skill: any) => (
                  <Badge key={skill.id} variant="outline">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Additional Items regrouped for KR View */}
          {resume.additionalItems && resume.additionalItems.length > 0 && (
            <section className="pt-6 border-t border-border/50">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-4">
                추가 정보
              </h4>
              <div className="space-y-4">
                {[
                  "CERTIFICATION",
                  "AWARD",
                  "LANGUAGE",
                  "ACTIVITY",
                  "OTHER",
                ].map((type) => {
                  const items = resume.additionalItems.filter(
                    (i) => i.type === type
                  );
                  if (items.length === 0) return null;

                  const typeLabels: Record<string, string> = {
                    CERTIFICATION: "자격증",
                    AWARD: "수상 경력",
                    LANGUAGE: "언어",
                    ACTIVITY: "활동",
                    OTHER: "기타",
                  };

                  return (
                    <div key={type}>
                      <h5 className="text-xs font-medium text-muted-foreground mb-2">
                        {typeLabels[type]}
                      </h5>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="text-sm flex justify-between"
                          >
                            <div>
                              <span className="font-medium">{item.name}</span>
                              {item.description && (
                                <span className="text-muted-foreground ml-2">
                                  ({item.description})
                                </span>
                              )}
                            </div>
                            {item.date && (
                              <span className="text-muted-foreground">
                                {item.date}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </details>
    </div>
  );
}
