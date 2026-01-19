import { useRef, useState, useEffect } from "react";
import {
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Edit,
  Layout,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
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
  company_name_source: string;
  role_source: string;
  period: string;
  bullets_source: string[];
  company_name_target: string;
  role_target: string;
  bullets_target: string[];
}

interface ResumeDetailPageProps {
  resumeId?: string;
  resumeTitle?: string;
  personalInfo?: {
    name_source: string;
    name_target: string;
    email: string;
    phone: string;
    links: any[];
    summary_source?: string;
    summary_target?: string;
  };
  experiences?: TranslatedExperience[];
  educations?: any[];
  skills?: any[];
  additionalItems?: any[];
  template?: string;
  updatedAt?: string;
  isWorkflowComplete?: boolean;
  locale?: string;
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
  locale = "ko",
}: ResumeDetailPageProps) {
  const t = useTranslations("resumeDetail");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [scale, setScale] = useState(0.8);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (!previewContainerRef.current) return;

      const containerWidth = previewContainerRef.current.offsetWidth;
      const a4WidthPx = 794;

      let newScale = (containerWidth * 0.95) / a4WidthPx;
      if (window.innerWidth < 1024 && newScale < 0.55) {
        newScale = 0.55;
      }
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const resume = {
    id: resumeId || "",
    title: resumeTitle || "Resume",
    personalInfo,
    updatedAt: updatedAt || new Date().toISOString(),
    template,
    experiences: experiences || [],
    educations,
    skills,
    additionalItems,
    isWorkflowComplete,
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { ModernPdf, registerFonts } =
        await import("./pdf-templates/modern-pdf");
      const { ClassicPdf } = await import("./pdf-templates/classic-pdf");
      const { MinimalPdf } = await import("./pdf-templates/minimal-pdf");

      registerFonts();

      let doc;
      const commonProps = {
        personalInfo: resume.personalInfo,
        experiences: resume.experiences,
        educations: resume.educations,
        skills: resume.skills,
        additionalItems: resume.additionalItems,
        locale: locale, // Pass locale to determine which language to use
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
          const { ProfessionalPdf } =
            await import("./pdf-templates/professional-pdf");
          // @ts-ignore
          doc = <ProfessionalPdf {...commonProps} />;
          break;
        case "executive":
          const { ExecutivePdf } =
            await import("./pdf-templates/executive-pdf");
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

      toast.success(t("notifications.downloadSuccess"));
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(t("notifications.downloadError"));
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
              {t("success.title")}
            </h3>
            <p className="text-xs text-green-700 dark:text-green-400 mt-1 leading-relaxed">
              {t("success.description")}
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
                  {new Date(resume.updatedAt).toLocaleDateString(
                    locale === "ko"
                      ? "ko-KR"
                      : locale === "ja"
                        ? "ja-JP"
                        : "en-US",
                  )}
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

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onBack}
                      className="p-2 border border-border rounded-md hover:bg-muted transition-colors"
                    >
                      <ArrowLeft className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{t("toolbar.back")}</TooltipContent>
                </Tooltip>

                {onDelete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleDeleteConfirm}
                        className="p-2 border border-border rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{t("toolbar.delete")}</TooltipContent>
                  </Tooltip>
                )}

                {onEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onEdit}
                        className="p-2 border border-border rounded-md hover:bg-muted transition-colors"
                      >
                        <Edit className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{t("toolbar.edit")}</TooltipContent>
                  </Tooltip>
                )}

                {onChangeTemplate && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onChangeTemplate}
                        className="p-2 border border-border rounded-md hover:bg-muted transition-colors"
                      >
                        <Layout className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{t("toolbar.template")}</TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>

              <Button onClick={handleDownload} className="shadow-sm ml-2">
                <Download className="size-4 mr-1.5" />
                {t("toolbar.download")}
              </Button>
            </div>
          </div>

          {/* Mobile Toolbar */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="shrink-0 h-9"
            >
              <ArrowLeft className="size-4 mr-1.5" />
              {t("toolbar.backList")}
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
                {t("toolbar.edit")}
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
                {t("toolbar.template")}
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

      {/* Preview */}
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
          <span>{t("originalView.title")}</span>
          <span className="text-xs text-muted-foreground">
            {t("originalView.expandTip")}
          </span>
        </summary>
        <div className="space-y-6 pt-4 border-t border-border">
          {/* Basic Info */}
          <section>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-4">
              {t("originalView.basicInfo")}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="font-medium text-muted-foreground">
                  {t("originalView.labels.name")}
                </span>
                <span>{resume.personalInfo?.name_source || "-"}</span>
              </div>
              {resume.personalInfo?.email && (
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="font-medium text-muted-foreground">
                    {t("originalView.labels.email")}
                  </span>
                  <span>{resume.personalInfo.email}</span>
                </div>
              )}
              {resume.personalInfo?.phone && (
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <span className="font-medium text-muted-foreground">
                    {t("originalView.labels.phone")}
                  </span>
                  <span>{resume.personalInfo.phone}</span>
                </div>
              )}
              {resume.personalInfo?.links &&
                resume.personalInfo.links.length > 0 && (
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="font-medium text-muted-foreground">
                      {t("originalView.labels.links")}
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
              {t("originalView.experience")}
            </h4>
            <div className="space-y-6">
              {(resume.experiences || []).map((exp: any) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">
                        {exp.company_name_source}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {exp.role_source}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {exp.period}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {exp.bullets_source.map((bullet: string, index: number) => (
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
                {t("originalView.education")}
              </h4>
              <div className="space-y-4">
                {resume.educations.map((edu: any) => (
                  <div
                    key={edu.id}
                    className="flex justify-between items-start"
                  >
                    <div>
                      <h4 className="font-semibold">
                        {edu.school_name_source}
                      </h4>
                      {((edu.degree_source && edu.degree_source !== "-") ||
                        (edu.major_source && edu.major_source !== "-")) && (
                        <p className="text-sm text-muted-foreground">
                          {edu.degree_source}
                          {edu.degree_source && edu.major_source && ", "}
                          {edu.major_source}
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
                {t("originalView.skills")}
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

          {/* Additional Items */}
          {resume.additionalItems && resume.additionalItems.length > 0 && (
            <section className="pt-6 border-t border-border/50">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-4">
                {t("originalView.additional")}
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
                    (i) => i.type === type,
                  );
                  if (items.length === 0) return null;

                  return (
                    <div key={type}>
                      <h5 className="text-xs font-medium text-muted-foreground mb-2">
                        {t(`originalView.additionalTypes.${type}`)}
                      </h5>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="text-sm flex justify-between"
                          >
                            <div>
                              <span className="font-medium">
                                {item.name_source}
                              </span>
                              {item.description_source && (
                                <span className="text-muted-foreground ml-2">
                                  ({item.description_source})
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

      {isDeleting && <LoadingOverlay message={t("deleting")} />}

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-50">
        <Button
          onClick={handleDownload}
          className="w-full h-12 text-base shadow-lg"
        >
          <Download className="size-5 mr-2" />
          {t("toolbar.download")}
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
            <AlertDialogTitle>{t("deleteAlert.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteAlert.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("deleteAlert.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={async (e) => {
                e.preventDefault();
                if (resumeId && onDelete) {
                  try {
                    setIsDeleting(true);
                    await onDelete(resumeId);
                    toast.success(t("notifications.deleteSuccess"));
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
              {isDeleting
                ? t("deleteAlert.processing")
                : t("deleteAlert.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
