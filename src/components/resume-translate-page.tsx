import { useState } from "react";
import { Languages, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
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

interface ResumeTranslatePageProps {
  resumeTitle: string;
  experiences: Experience[];
  onNext: (translated: TranslatedExperience[]) => void;
  onBack: () => void;
}

// Mock 번역 데이터
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

export function ResumeTranslatePage({
  resumeTitle,
  experiences,
  onNext,
  onBack,
}: ResumeTranslatePageProps) {
  const [translatedExperiences, setTranslatedExperiences] = useState<TranslatedExperience[]>(
    experiences.map(translateExperience)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBulletsEn, setEditingBulletsEn] = useState<string[]>([]);

  const handleEdit = (exp: TranslatedExperience) => {
    setEditingId(exp.id);
    setEditingBulletsEn([...exp.bulletsEn]);
  };

  const handleSave = () => {
    if (editingId) {
      setTranslatedExperiences(prev =>
        prev.map(exp =>
          exp.id === editingId ? { ...exp, bulletsEn: editingBulletsEn } : exp
        )
      );
      setEditingId(null);
      setEditingBulletsEn([]);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingBulletsEn([]);
  };

  const handleBulletChange = (index: number, value: string) => {
    setEditingBulletsEn(prev => {
      const newBullets = [...prev];
      newBullets[index] = value;
      return newBullets;
    });
  };

  const handleRetranslate = (expId: string) => {
    // 재번역 로직 (실제로는 API 호출)
    alert("AI 재번역 기능은 개발 예정입니다.");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="gap-1">
            <Languages className="size-3" />
            AI 번역 완료
          </Badge>
          <span className="text-sm text-muted-foreground">2 / 3 단계</span>
        </div>
        <h1 className="text-2xl mb-2">영문 번역 확인 및 수정</h1>
        <p className="text-sm text-muted-foreground">
          {resumeTitle} • AI가 번역한 내용을 확인하고 필요시 수정하세요
        </p>
      </div>

      <div className="space-y-8">
        {translatedExperiences.map((exp) => {
          const isEditing = editingId === exp.id;

          return (
            <div
              key={exp.id}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-2 gap-8 flex-1">
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
                  <div className="flex gap-2">
                    {!isEditing && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRetranslate(exp.id)}
                        >
                          <RefreshCw className="size-4" />
                          재번역
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(exp)}
                        >
                          수정
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Content - Split View */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-8">
                  {/* Korean (Original) */}
                  <div>
                    <ul className="space-y-3">
                      {exp.bullets.map((bullet, index) => (
                        <li key={index} className="flex gap-2 text-sm">
                          <span className="text-muted-foreground flex-shrink-0">•</span>
                          <span className="text-muted-foreground">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* English (Translation) */}
                  <div>
                    {isEditing ? (
                      <div className="space-y-3">
                        {editingBulletsEn.map((bullet, index) => (
                          <div key={index} className="flex gap-2">
                            <span className="text-muted-foreground mt-3 flex-shrink-0">
                              •
                            </span>
                            <textarea
                              value={bullet}
                              onChange={(e) => handleBulletChange(index, e.target.value)}
                              className="flex-1 min-h-[80px] p-2 bg-background border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                              placeholder="Enter translated content"
                            />
                          </div>
                        ))}
                        <div className="flex gap-2 pt-2">
                          <Button onClick={handleSave} size="sm" className="flex-1">
                            저장
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancel}
                            size="sm"
                            className="flex-1"
                          >
                            취소
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {exp.bulletsEn.map((bullet, index) => (
                          <li key={index} className="flex gap-2 text-sm">
                            <span className="text-muted-foreground flex-shrink-0">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          이전
        </Button>
        <Button onClick={() => onNext(translatedExperiences)} className="flex-1">
          다음: 템플릿 선택
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          💡 <strong>팁:</strong> 좌측 한글 원본과 우측 영문 번역을 비교하며 확인하세요. 
          자연스럽지 않은 표현은 직접 수정 가능합니다.
        </p>
      </div>
    </div>
  );
}
