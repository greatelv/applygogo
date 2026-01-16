"use client";

import { useRef, useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  FileText,
  Layout,
  Share2,
  Trash2,
  Sparkles,
} from "lucide-react";

import {
  generateResumeHwpHtml,
  generateNarrativeHwpHtml,
} from "@/lib/hwp-generator";
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
  companyTranslated: string;
  positionTranslated: string;
  bulletsTranslated: string[];
}

const statusConfig = {
  IDLE: { label: "Upload됨", variant: "outline" as const },
  SUMMARIZED: { label: "요약됨", variant: "secondary" as const },
  TRANSLATED: { label: "번역됨", variant: "secondary" as const },
  COMPLETED: { label: "Complete", variant: "default" as const },
  FAILED: { label: "실패", variant: "warning" as const },
};

interface ResumeDetailPageProps {
  resumeId?: string;
  resumeTitle?: string;
  personalInfo?: {
    name_original: string;
    name_translated: string;
    email: string;
    phone: string;
    links: any[];
    summary_original?: string;
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
  sourceLang?: string;
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
  sourceLang = "ko",
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
    title: resumeTitle || "Resume",
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
      const { pdf, Document } = await import("@react-pdf/renderer");
      // Dynamic import to avoid SSR issues with React-PDF
      const { ModernPdf, ModernPdfPage, registerFonts } = await import(
        "./pdf-templates/modern-pdf"
      );
      const { ClassicPdf } = await import("./pdf-templates/classic-pdf");
      const { MinimalPdf } = await import("./pdf-templates/minimal-pdf");
      const { NarrativePdfPage } = await import(
        "./pdf-templates/narrative-pdf"
      );

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
      // Check if narrative exists and is v2
      const narrativeContent =
        convertedData?.type === "narrative_ko_v2"
          ? convertedData.content
          : null;

      if (templateKey === "modern" && narrativeContent) {
        // MERGED DOWNLOAD (Modern + Narrative)
        doc = (
          <Document
            title={
              resume.personalInfo?.name_translated ||
              resume.personalInfo?.name_original ||
              "Resume"
            }
          >
            {/* 1. Resume Page */}
            {/* @ts-ignore */}
            <ModernPdfPage {...commonProps} />

            {/* 2. Narrative Page */}
            <NarrativePdfPage
              content={narrativeContent}
              name={
                resume.personalInfo?.name_translated ||
                resume.personalInfo?.name_original ||
                ""
              }
            />
          </Document>
        );
      } else {
        // If narrative exists but merging not supported (not Modern), download separately
        if (narrativeContent && templateKey !== "modern") {
          toast.info("Resume and Cover Letter will be downloaded separately.");
          handleDownloadNarrative();
        }

        // ORIGINAL SINGLE DOWNLOAD logic
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

      toast.success("PDF download completed successfully.");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Error generating PDF.");
    }
  };

  const handleDownloadNarrative = async () => {
    try {
      const { pdf, Document } = await import("@react-pdf/renderer");
      const { NarrativePdfPage } = await import(
        "./pdf-templates/narrative-pdf"
      );
      // Need fonts registered
      const { registerFonts } = await import("./pdf-templates/modern-pdf");
      registerFonts();

      if (convertedData?.type !== "narrative_ko_v2" || !convertedData.content) {
        toast.error("다운로드할 자기소개서 데이터가 없습니다.");
        return;
      }

      const doc = (
        <Document
          title={`${
            personalInfo?.name_translated || personalInfo?.name_original
          }_자기소개서`}
        >
          <NarrativePdfPage
            content={convertedData.content}
            name={
              personalInfo?.name_translated || personalInfo?.name_original || ""
            }
          />
        </Document>
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resume.title || "resume"}_narrative.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Cover Letter PDF downloaded successfully.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to download Cover Letter.");
    }
  };

  const handleDownloadHwp = async () => {
    try {
      // 1. Download Resume HWP
      const resumeHtml = generateResumeHwpHtml(resume);
      const resumeBlob = new Blob(["\ufeff" + resumeHtml], {
        type: "application/msword;charset=utf-8",
      });
      const resumeUrl = URL.createObjectURL(resumeBlob);
      const link = document.createElement("a");
      link.href = resumeUrl;
      link.download = `${resume.title || "resume"}.hwp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(resumeUrl);

      // 2. Download Narrative HWP if exists
      if (convertedData?.type === "narrative_ko_v2" && convertedData.content) {
        // Small delay to prevent browser blocking multiple downloads
        await new Promise((resolve) => setTimeout(resolve, 500));

        const narrativeHtml = generateNarrativeHwpHtml(
          resume,
          convertedData.content
        );
        const narrBlob = new Blob(["\ufeff" + narrativeHtml], {
          type: "application/msword;charset=utf-8",
        });
        const narrUrl = URL.createObjectURL(narrBlob);
        const narrLink = document.createElement("a");
        narrLink.href = narrUrl;
        narrLink.download = `${resume.title || "resume"}_narrative.hwp`;
        document.body.appendChild(narrLink);
        narrLink.click();
        document.body.removeChild(narrLink);
        URL.revokeObjectURL(narrUrl);

        toast.info("Resume and Cover Letter downloaded separately.");
      } else {
        toast.success("Resume HWP downloaded.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate HWP.");
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
    <div className="w-full">
      {/* Top Section: Centered max-w-4xl */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Banner */}
        {isWorkflowComplete && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/50 rounded-lg flex items-start gap-3">
            <div className="p-1 bg-green-100 dark:bg-green-900/40 rounded-full shrink-0 mt-0.5">
              <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-900 dark:text-green-300">
                Resume Created Successfully!
              </h3>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1 leading-relaxed">
                Check the final result below and download as PDF.
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
                    <TooltipContent>Back</TooltipContent>
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
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  )}

                  {onEdit && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={onEdit}>
                          <Edit className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
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
                      <TooltipContent>Change Template</TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleDownloadHwp}
                        variant="outline"
                        className="shadow-sm ml-2"
                      >
                        <FileText className="size-4 mr-1.5" />
                        HWP
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-center">
                      <p>Due to HWP format obfuscation,</p>
                      <p>only a basic document format is provided.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button onClick={handleDownload} className="shadow-sm ml-2">
                  <Download className="size-4 mr-1.5" />
                  PDF
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
                  Edit
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
      </div>

      {/* Content Section: Full Width */}
      <div className="w-full px-4 sm:px-6 lg:px-12 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Resume Preview */}
          <div className="min-w-0 w-full">
            <div className="bg-card border border-border rounded-lg overflow-hidden mb-8 lg:mb-0 lg:sticky lg:top-8">
              <div
                ref={previewContainerRef}
                className="bg-muted/30 p-0 sm:p-8 flex justify-center overflow-x-auto min-h-[400px] lg:min-h-[calc(100vh-200px)]"
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
          </div>

          {/* Right Column: Narrative & Original Details */}
          <div className="space-y-6 w-full">
            {/* Korean Narrative Generation (Global Users) */}
            {showGenerateKo && (
              <div>
                {convertedData?.type === "narrative_ko_v2" ? (
                  <div className="bg-card border border-border rounded-lg overflow-hidden mb-8 lg:mb-0 lg:sticky lg:top-8">
                    <div className="bg-muted/30 p-0 sm:p-8 flex justify-center overflow-x-auto min-h-[400px] lg:min-h-[calc(100vh-200px)]">
                      <div
                        className="origin-top"
                        style={{
                          width: "210mm",
                          height: `${297 * scale}mm`,
                          overflow: "visible",
                        }}
                      >
                        <div
                          className="bg-white text-black shadow-2xl origin-top mx-auto p-[12mm]"
                          style={{
                            width: "210mm",
                            minHeight: "297mm",
                            transform: `scale(${scale})`,
                            transformOrigin: "top center",
                          }}
                        >
                          {/* Narrative Content in A4 */}
                          <div className="space-y-8 font-sans">
                            <div className="text-center border-b border-gray-900/10 pb-8 mb-8">
                              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                자기소개서
                              </h2>
                              <p className="text-gray-500 text-sm">
                                {personalInfo?.name_translated ||
                                  personalInfo?.name_original}
                              </p>
                            </div>

                            <div className="space-y-8 text-[11pt] leading-[1.8] text-gray-800 text-justify">
                              {/* 1. 핵심 역량 */}
                              {convertedData.content.core_competency && (
                                <section>
                                  <h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-gray-900 pl-3">
                                    핵심 역량 및 강점
                                  </h3>
                                  <p className="whitespace-pre-wrap">
                                    {convertedData.content.core_competency}
                                  </p>
                                </section>
                              )}

                              {/* 2. 주요 성과 */}
                              {convertedData.content.key_achievements && (
                                <section>
                                  <h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-gray-900 pl-3">
                                    주요 성과 (Key Achievements)
                                  </h3>
                                  <p className="whitespace-pre-wrap">
                                    {convertedData.content.key_achievements}
                                  </p>
                                </section>
                              )}

                              {/* 3. 성장 과정 */}
                              {convertedData.content.growth_process && (
                                <section>
                                  <h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-gray-900 pl-3">
                                    성장 과정
                                  </h3>
                                  <p className="whitespace-pre-wrap">
                                    {convertedData.content.growth_process}
                                  </p>
                                </section>
                              )}

                              {/* 4. 지원 동기 및 포부 */}
                              {convertedData.content.motivation_and_goals && (
                                <section>
                                  <h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-gray-900 pl-3">
                                    입사 후 포부
                                  </h3>
                                  <p className="whitespace-pre-wrap">
                                    {convertedData.content.motivation_and_goals}
                                  </p>
                                </section>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg flex flex-col items-center text-center gap-6 shadow-sm">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 flex items-center justify-center gap-2">
                        Targeting the Korean Job Market?
                        <Badge
                          variant="secondary"
                          className="bg-indigo-100/50 text-indigo-700 border-indigo-200"
                        >
                          Beta
                        </Badge>
                      </h3>
                      <p className="text-sm text-indigo-700 dark:text-indigo-400 max-w-sm mx-auto">
                        Generate a professional{" "}
                        <strong>
                          Korean Self-Introduction (Narrative Resume)
                        </strong>{" "}
                        from your English bullet points. We expand your
                        achievements into the "STAR" format preferred by Korean
                        recruiters.
                      </p>
                    </div>
                    <Button
                      onClick={onGenerateKo}
                      disabled={isGeneratingKo}
                      size="lg"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                    >
                      {isGeneratingKo ? (
                        <>
                          <Clock className="size-4 mr-2 animate-spin" />{" "}
                          Generating...
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
          </div>
        </div>
      </div>

      {isDeleting && <LoadingOverlay message="Deleting resume..." />}

      {/* Mobile Sticky Footer - Dual Buttons */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-50 flex gap-3">
        <Button
          onClick={handleDownloadHwp}
          variant="outline"
          className="flex-1 h-12 text-base shadow-lg"
        >
          <FileText className="size-5 mr-2" />
          HWP
        </Button>
        <Button
          onClick={handleDownload}
          className="flex-1 h-12 text-base shadow-lg"
        >
          <Download className="size-5 mr-2" />
          PDF
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
            <AlertDialogTitle>Delete Resume</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this resume? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={async (e) => {
                e.preventDefault();
                if (resumeId && onDelete) {
                  try {
                    setIsDeleting(true);
                    await onDelete(resumeId);
                    toast.success("Resume deleted successfully.");
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
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
