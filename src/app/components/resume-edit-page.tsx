import { useState } from "react";
import { ArrowRight, Sparkles, RefreshCw, Plus, Trash2, Edit3 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  bullets: string[];
}

interface TranslatedExperience extends Experience {
  companyEn: string;
  positionEn: string;
  bulletsEn: string[];
}

interface ResumeEditPageProps {
  resumeTitle: string;
  initialExperiences?: TranslatedExperience[];
  isEditingExisting?: boolean;
  quota?: number;
  onNext: (translated: TranslatedExperience[]) => void;
  onBack: () => void;
  onRetranslate?: () => void;
}

// Mock 데이터
const mockExperiences: Experience[] = [
  {
    id: "1",
    company: "(주)테크스타트업",
    position: "프론트엔드 개발자",
    period: "2022.03 - 현재",
    bullets: [
      "React 및 TypeScript 기반 웹 애플리케이션 개발 및 유지보수",
      "반응형 UI/UX 구현으로 모바일 사용자 경험 30% 개선",
      "컴포넌트 라이브러리 구축하여 개발 생산성 40% 향상",
      "팀 내 코드 리뷰 문화 정착 및 개발 가이드라인 작성",
    ],
  },
  {
    id: "2",
    company: "디지털에이전시 ABC",
    position: "주니어 개발자",
    period: "2020.06 - 2022.02",
    bullets: [
      "Vue.js 기반 고객사 웹사이트 5개 이상 개발",
      "RESTful API 연동 및 상태 관리 라이브러리 활용",
      "크로스 브라우저 호환성 테스트 및 이슈 해결",
    ],
  },
];

// Mock 번역 함수
const translateExperience = (exp: Experience): TranslatedExperience => {
  const translations: Record<string, any> = {
    "(주)테크스타트업": "TechStartup Inc.",
    "프론트엔드 개발자": "Frontend Developer",
    "디지털에이전시 ABC": "Digital Agency ABC",
    "주니어 개발자": "Junior Developer",
  };

  const bulletTranslations: Record<string, string> = {
    "React 및 TypeScript 기반 웹 애플리케이션 개발 및 유지보수":
      "Developed and maintained web applications using React and TypeScript",
    "반응형 UI/UX 구현으로 모바일 사용자 경험 30% 개선":
      "Improved mobile user experience by 30% through responsive UI/UX implementation",
    "컴포넌트 라이브러리 구축하여 개발 생산성 40% 향상":
      "Built component library, increasing development productivity by 40%",
    "팀 내 코드 리뷰 문화 정착 및 개발 가이드라인 작성":
      "Established code review culture and created development guidelines within the team",
    "Vue.js 기반 고객사 웹사이트 5개 이상 개발":
      "Developed 5+ client websites using Vue.js framework",
    "RESTful API 연동 및 상태 관리 라이브러리 활용":
      "Integrated RESTful APIs and utilized state management libraries",
    "크로스 브라우저 호환성 테스트 및 이슈 해결":
      "Conducted cross-browser compatibility testing and resolved issues",
  };

  return {
    ...exp,
    companyEn: translations[exp.company] || exp.company,
    positionEn: translations[exp.position] || exp.position,
    bulletsEn: exp.bullets.map(bullet => bulletTranslations[bullet] || bullet),
  };
};

export function ResumeEditPage({
  resumeTitle,
  initialExperiences,
  isEditingExisting,
  quota,
  onNext,
  onBack,
  onRetranslate,
}: ResumeEditPageProps) {
  const [experiences, setExperiences] = useState<TranslatedExperience[]>(
    initialExperiences || mockExperiences.map(translateExperience)
  );

  const handleBulletEdit = (expId: string, index: number, value: string, isEnglish: boolean) => {
    setExperiences(prev =>
      prev.map(exp => {
        if (exp.id !== expId) return exp;
        
        if (isEnglish) {
          const newBulletsEn = [...exp.bulletsEn];
          newBulletsEn[index] = value;
          return { ...exp, bulletsEn: newBulletsEn };
        } else {
          const newBullets = [...exp.bullets];
          newBullets[index] = value;
          return { ...exp, bullets: newBullets };
        }
      })
    );
  };

  const handleAddBullet = (expId: string) => {
    setExperiences(prev =>
      prev.map(exp =>
        exp.id === expId
          ? {
              ...exp,
              bullets: [...exp.bullets, ""],
              bulletsEn: [...exp.bulletsEn, ""],
            }
          : exp
      )
    );
  };

  const handleRemoveBullet = (expId: string, index: number) => {
    setExperiences(prev =>
      prev.map(exp =>
        exp.id === expId
          ? {
              ...exp,
              bullets: exp.bullets.filter((_, i) => i !== index),
              bulletsEn: exp.bulletsEn.filter((_, i) => i !== index),
            }
          : exp
      )
    );
  };

  const handleRetranslate = (expId: string) => {
    if (onRetranslate) {
      onRetranslate();
    } else {
      alert("AI 재번역 기능은 개발 예정입니다.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="size-3" />
            {isEditingExisting ? "이력서 수정" : "AI 처리 완료"}
          </Badge>
        </div>
        <h1 className="text-2xl mb-2">편집</h1>
        <p className="text-sm text-muted-foreground">
          {resumeTitle} • {isEditingExisting ? "내용을 수정하고 다시 미리보기할 수 있습니다" : "AI가 요약하고 번역한 내용을 확인하고 필요시 수정하세요"}
        </p>
      </div>

      {/* Guide Card */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
        <div className="flex items-start gap-3">
          <Edit3 className="size-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
              클릭하여 바로 수정하기
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              각 항목을 클릭하면 바로 수정할 수 있습니다. 수정 내용은 자동으로 저장됩니다.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="bg-card border border-border rounded-lg overflow-hidden"
          >
            {/* Header */}
            <div className="bg-muted/50 px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 flex-1">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">한글 (원본)</p>
                    <h3 className="font-semibold">{exp.company}</h3>
                    <p className="text-sm text-muted-foreground">
                      {exp.position} • {exp.period}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">English (번역)</p>
                    <h3 className="font-semibold">{exp.companyEn}</h3>
                    <p className="text-sm text-muted-foreground">
                      {exp.positionEn} • {exp.period}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRetranslate(exp.id)}
                  >
                    <RefreshCw className="size-4" />
                    <span className="hidden lg:inline">재번역</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Content - Split View */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Korean (Original) */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase">
                    한글 경력사항
                  </h4>
                  <ul className="space-y-3">
                    {exp.bullets.map((bullet, index) => (
                      <li key={index} className="flex gap-2 text-sm group">
                        <span className="text-muted-foreground flex-shrink-0 mt-1">•</span>
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleBulletEdit(exp.id, index, e.currentTarget.textContent || "", false)
                          }
                          className="flex-1 text-muted-foreground outline-none px-2 py-1 -mx-2 -my-1 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[24px]"
                          placeholder="클릭하여 입력"
                        >
                          {bullet}
                        </div>
                        <button
                          onClick={() => handleRemoveBullet(exp.id, index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 hover:bg-destructive/10 rounded"
                          title="항목 삭제"
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* English (Translation) */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase">
                    영문 번역
                  </h4>
                  <ul className="space-y-3">
                    {exp.bulletsEn.map((bullet, index) => (
                      <li key={index} className="flex gap-2 text-sm group">
                        <span className="text-muted-foreground flex-shrink-0 mt-1">•</span>
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            handleBulletEdit(exp.id, index, e.currentTarget.textContent || "", true)
                          }
                          className="flex-1 outline-none px-2 py-1 -mx-2 -my-1 rounded transition-colors hover:bg-accent/50 focus:bg-accent focus:ring-2 focus:ring-ring/20 cursor-text min-h-[24px]"
                          placeholder="Click to edit"
                        >
                          {bullet}
                        </div>
                        <button
                          onClick={() => handleRemoveBullet(exp.id, index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 hover:bg-destructive/10 rounded"
                          title="Delete item"
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Add Bullet Button */}
              <div className="mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBullet(exp.id)}
                  className="w-full"
                >
                  <Plus className="size-4" />
                  항목 추가
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          이전
        </Button>
        <Button onClick={() => onNext(experiences)} className="flex-1">
          다음
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          💡 <strong>팁:</strong> 좌측 한글 원본과 우측 영문 번역을 동시에 비교하며 수정할 수 있습니다. 
          각 경력은 3~4개의 불릿 포인트로 요약하고, 핵심 성과와 구체적인 수치를 포함하면 더욱 효과적입니다.
        </p>
      </div>
    </div>
  );
}