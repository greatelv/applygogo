import { useRef, useState, useEffect } from "react";
import {
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Edit,
  Layout,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ModernTemplate } from "./resume-templates/modern-template";
import { ClassicTemplate } from "./resume-templates/classic-template";

import { MinimalTemplate } from "./resume-templates/minimal-template";
import { ProfessionalTemplate } from "./resume-templates/professional-template";
import { ExecutiveTemplate } from "./resume-templates/executive-template";
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
import { LoadingOverlay } from "./ui/loading-overlay";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

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
  convertedData?: any;
  showGenerateKo?: boolean;
  isGeneratingKo?: boolean;
  onGenerateKo?: () => void;
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
  convertedData,
  showGenerateKo,
  isGeneratingKo,
  onGenerateKo,
  onBack,
  onDelete,
  onDownload,
  onEdit,
  onChangeTemplate,
  updatedAt,
}: ResumeDetailPageProps) {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [scale, setScale] = useState(0.8); // Initial scale for safety
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;

      const containerWidth = previewContainerRef.current.offsetWidth;
      const a4WidthPx = 794; // approx 210mm at 96dpi

      let newScale = (containerWidth * 0.95) / a4WidthPx;
      // Enforce minimum scale for mobile readability (similar to ResumePreviewPage)
      if (window.innerWidth < 1024 && newScale < 0.55) {
        newScale = 0.55;
      }
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

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

        case "professional":
          // Dynamic import for Professional PDF
          const { ProfessionalPdf } = await import(
            "./pdf-templates/professional-pdf"
          );
          // @ts-ignore
          doc = <ProfessionalPdf {...commonProps} />;
          break;
        case "executive":
          // Dynamic import for Executive PDF
          const { ExecutivePdf } = await import(
            "./pdf-templates/executive-pdf"
          );
          // @ts-ignore
          doc = <ExecutivePdf {...commonProps} />;
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
      case "professional":
        return <ProfessionalTemplate {...commonProps} />;
      case "executive":
        return <ExecutiveTemplate {...commonProps} />;
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
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/50 rounded-lg flex items-start gap-3">
          <div className="p-1 bg-green-100 dark:bg-green-900/40 rounded-full shrink-0 mt-0.5">
            <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-900 dark:text-green-300">
              이력서가 성공적으로 생성되었습니다!
            </h3>
            <p className="text-xs text-green-700 dark:text-green-400 mt-1 leading-relaxed">
              아래에서 최종 결과물을 확인하고 PDF로 다운로드하세요.
            </p>
          </div>
        </div>
      )}

      {/* Header & Actions */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <h1 className="text-2xl font-bold break-keep leading-tight">
                {resume.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 shrink-0">
                  <Clock className="size-3.5" />
                  {new Date(resume.updatedAt).toLocaleDateString("ko-KR")}
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <Layout className="size-3.5" />
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 h-5 font-normal"
                  >
                    {resume.template.charAt(0).toUpperCase() +
                      resume.template.slice(1)}
                  </Badge>
                </span>
              </div>
            </div>

            {/* Desktop Actions (Hidden on Mobile) */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={onBack}>
                      <ArrowLeft className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>뒤로가기</TooltipContent>
                </Tooltip>

                {onDelete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleDeleteConfirm}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>삭제</TooltipContent>
                  </Tooltip>
                )}

                {onEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={onEdit}>
                        <Edit className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>편집</TooltipContent>
                  </Tooltip>
                )}

                {onChangeTemplate && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={onChangeTemplate}
                      >
                        <Layout className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>템플릿 변경</TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>

              <Button onClick={handleDownload} className="shadow-sm ml-2">
                <Download className="size-4 mr-1.5" />
                PDF 다운로드
              </Button>
            </div>
          </div>

          {/* Mobile Toolbar (Visible only on Mobile) */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="shrink-0 h-9"
            >
              <ArrowLeft className="size-4 mr-1.5" />
              목록
            </Button>
            <div className="w-px h-4 bg-border shrink-0 mx-1" />
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="shrink-0 h-9"
              >
                <Edit className="size-4 mr-1.5" />
                편집
              </Button>
            )}
            {onChangeTemplate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onChangeTemplate}
                className="shrink-0 h-9"
              >
                <Layout className="size-4 mr-1.5" />
                템플릿
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteConfirm}
                className="shrink-0 h-9 text-muted-foreground hover:text-destructive ml-auto"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Korean Narrative Generation (Global Users) */}
      {showGenerateKo && (
        <div className="mb-6">
          {convertedData?.type === "narrative_ko" ? (
            <details
              className="bg-card border border-border rounded-lg p-6 group"
              open
            >
              <summary className="cursor-pointer font-bold text-lg mb-4 flex items-center gap-2 select-none">
                <span className="text-primary flex items-center gap-2">
                  <span className="text-2xl">🇰🇷</span>
                  Korean Self-Introduction (Generated)
                </span>
                <span className="text-xs font-normal text-muted-foreground ml-auto group-open:hidden">
                  (Click to expand)
                </span>
              </summary>
              <div className="space-y-6 pt-2 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm text-muted-foreground mb-4">
                  This narrative is automatically generated based on your
                  English bullet points, tailored for the Korean job market
                  (JaSoSeo style).
                </p>
                {convertedData.work_experiences.map((exp: any) => (
                  <div
                    key={exp.id}
                    className="p-5 bg-muted/30 border border-border/50 rounded-lg"
                  >
                    <div className="flex items-baseline justify-between mb-3">
                      <h4 className="font-bold text-base">{exp.company}</h4>
                      <span className="text-xs text-muted-foreground font-medium px-2 py-1 bg-background rounded border">
                        {exp.role}
                      </span>
                    </div>
                    <div className="space-y-3 text-sm leading-relaxed text-foreground/90 font-sans">
                      {exp.narrative_ko.map((para: string, idx: number) => (
                        <p key={idx} className="break-keep">
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ) : (
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 justify-center md:justify-start">
                  Targeting the Korean Job Market?
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100/50 text-indigo-700 border-indigo-200"
                  >
                    Beta
                  </Badge>
                </h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-400 max-w-lg">
                  Generate a professional{" "}
                  <strong>Korean Self-Introduction (Narrative Resume)</strong>{" "}
                  from your English bullet points. We expand your achievements
                  into the "STAR" format preferred by Korean recruiters.
                </p>
              </div>
              <Button
                onClick={onGenerateKo}
                disabled={isGeneratingKo}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md whitespace-nowrap min-w-[200px]"
              >
                {isGeneratingKo ? (
                  <>
                    <Clock className="size-4 mr-2 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-2" /> Generate Korean
                    Narrative
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
        <div
          ref={previewContainerRef}
          className="bg-muted/30 p-0 sm:p-8 flex justify-center overflow-x-auto min-h-[400px]"
        >
          <div
            className="origin-top"
            style={{
              width: "210mm",
              height: `${297 * scale}mm`,
              overflow: "visible",
            }}
          >
            <div
              className="bg-white text-black shadow-2xl origin-top mx-auto"
              style={{
                width: "210mm",
                minHeight: "297mm",
                transform: `scale(${scale})`,
                transformOrigin: "top center",
              }}
            >
              {renderTemplate()}
            </div>
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

      {isDeleting && <LoadingOverlay message="이력서를 삭제하고 있습니다..." />}

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-50">
        <Button
          onClick={handleDownload}
          className="w-full h-12 text-base shadow-lg"
        >
          <Download className="size-5 mr-2" />
          PDF 다운로드
        </Button>
      </div>

      {/* Spacer for sticky footer */}
      <div className="h-24 lg:hidden" />

      <AlertDialog
        open={isDeleteAlertOpen}
        onOpenChange={(open) => !isDeleting && setIsDeleteAlertOpen(open)}
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
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={async (e) => {
                e.preventDefault();
                if (resumeId && onDelete) {
                  try {
                    setIsDeleting(true);
                    await onDelete(resumeId);
                    toast.success("이력서가 삭제되었습니다");
                    onBack();
                    setIsDeleteAlertOpen(false);
                  } catch (error) {
                    console.error(error);
                  } finally {
                    setIsDeleting(false);
                  }
                }
              }}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
