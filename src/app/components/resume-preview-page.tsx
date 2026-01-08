import { useState } from "react";
import { ArrowRight, Eye, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";
import { ModernTemplate } from "./resume-templates/modern-template";
import { ClassicTemplate } from "./resume-templates/classic-template";
import { MinimalTemplate } from "./resume-templates/minimal-template";

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

interface Education {
  id: string;
  school_name: string;
  school_name_en?: string;
  major: string;
  major_en?: string;
  degree: string;
  degree_en?: string;
  start_date: string;
  end_date: string;
}

interface Skill {
  id: string;
  name: string;
  level?: string | null;
}

interface ResumePreviewPageProps {
  resumeTitle: string;
  experiences: TranslatedExperience[];
  educations: Education[];
  skills: Skill[];
  currentPlan?: "FREE" | "STANDARD" | "PRO";
  onNext?: (templateId: string) => void;
  onComplete?: () => void;
  onBack: () => void;
  onUpgrade?: () => void;
}

export function ResumePreviewPage({
  resumeTitle,
  experiences,
  educations,
  skills,
  currentPlan = "FREE",
  onNext,
  onComplete,
  onBack,
  onUpgrade,
}: ResumePreviewPageProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  type Template = {
    id: string;
    name: string;
    description: string;
    isPro: boolean;
  };

  const templates: Template[] = [
    {
      id: "modern",
      name: "Modern",
      description: "깔끔하고 현대적인 디자인. IT/스타트업 추천",
      isPro: false,
    },
    {
      id: "classic",
      name: "Classic",
      description: "전통적이고 격식있는 스타일. 대기업/금융 추천",
      isPro: false,
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "미니멀하고 세련된 느낌. 디자인/크리에이티브 추천",
      isPro: true,
    },
  ];

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);
  const isProTemplateSelected =
    selectedTemplateData?.isPro && currentPlan !== "PRO";

  const handleNext = () => {
    // PRO 템플릿이 선택되었지만 사용자가 PRO가 아닌 경우
    if (isProTemplateSelected) {
      if (onUpgrade) {
        onUpgrade();
      }
      return;
    }

    if (onNext) {
      onNext(selectedTemplate);
    }
  };

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case "modern":
        return (
          <ModernTemplate
            experiences={experiences}
            educations={educations}
            skills={skills}
          />
        );
      case "classic":
        return (
          <ClassicTemplate
            experiences={experiences}
            educations={educations}
            skills={skills}
          />
        );
      case "minimal":
        return (
          <MinimalTemplate
            experiences={experiences}
            educations={educations}
            skills={skills}
          />
        );
      default:
        return (
          <ModernTemplate
            experiences={experiences}
            educations={educations}
            skills={skills}
          />
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="gap-1">
            <Eye className="size-3" />
            실시간 미리보기
          </Badge>
        </div>
        <h1 className="text-2xl mb-2">템플릿 선택</h1>
        <p className="text-sm text-muted-foreground">
          {resumeTitle} • 원하는 템플릿을 선택하세요
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold">템플릿 선택</h3>
          <div className="space-y-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all",
                  selectedTemplate === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-foreground/30 bg-card"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{template.name}</h4>
                  <div className="flex items-center gap-2">
                    {template.isPro && (
                      <Badge variant="default" className="text-xs">
                        PRO
                      </Badge>
                    )}
                    {selectedTemplate === template.id && (
                      <CheckCircle className="size-5 text-primary" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </button>
            ))}
          </div>

          {/* PRO 템플릿 선택 시 업그레이드 안내 */}
          {isProTemplateSelected && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-400">
                ⭐ 이 템플릿은 PRO 플랜 전용입니다. 아래 버튼을 눌러
                업그레이드하세요.
              </p>
            </div>
          )}

          <div className="pt-4 space-y-2">
            <Button onClick={handleNext} className="w-full" size="lg">
              {isProTemplateSelected ? "PRO로 업그레이드" : "다음"}
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" onClick={onBack} className="w-full">
              이전
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-muted/30 border border-border rounded-lg overflow-hidden">
            <div className="aspect-[210/297] overflow-auto shadow-lg">
              {renderTemplate()}
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            실시간 미리보기 • 스크롤하여 전체 내용을 확인하세요
          </p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          💡 <strong>팁:</strong> 템플릿은 각각 다른 느낌과 용도에 최적화되어
          있습니다. 지원하려는 회사와 포지션에 맞는 템플릿을 선택하세요.
        </p>
      </div>
    </div>
  );
}
