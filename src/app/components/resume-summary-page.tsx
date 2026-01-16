import { useState } from "react";
import { Pencil, Trash2, Plus, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  bullets: string[];
}

interface ResumeSummaryPageProps {
  resumeTitle: string;
  onNext: (experiences: Experience[]) => void;
  onBack: () => void;
}

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

export function ResumeSummaryPage({ resumeTitle, onNext, onBack }: ResumeSummaryPageProps) {
  const [experiences, setExperiences] = useState<Experience[]>(mockExperiences);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBullets, setEditingBullets] = useState<string[]>([]);

  const handleEdit = (exp: Experience) => {
    setEditingId(exp.id);
    setEditingBullets([...exp.bullets]);
  };

  const handleSave = () => {
    if (editingId) {
      setExperiences(prev =>
        prev.map(exp =>
          exp.id === editingId ? { ...exp, bullets: editingBullets } : exp
        )
      );
      setEditingId(null);
      setEditingBullets([]);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingBullets([]);
  };

  const handleBulletChange = (index: number, value: string) => {
    setEditingBullets(prev => {
      const newBullets = [...prev];
      newBullets[index] = value;
      return newBullets;
    });
  };

  const handleAddBullet = () => {
    setEditingBullets(prev => [...prev, ""]);
  };

  const handleRemoveBullet = (index: number) => {
    setEditingBullets(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="size-3" />
            AI 요약 Complete
          </Badge>
          <span className="text-sm text-muted-foreground">1 / 3 단계</span>
        </div>
        <h1 className="text-2xl mb-2">경력사항 확인 및 수정</h1>
        <p className="text-sm text-muted-foreground">
          {resumeTitle} • AI가 요약한 내용을 확인하고 필요시 수정하세요
        </p>
      </div>

      <div className="space-y-6">
        {experiences.map((exp, expIndex) => {
          const isEditing = editingId === exp.id;

          return (
            <div
              key={exp.id}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{exp.company}</h3>
                  <p className="text-muted-foreground text-sm">
                    {exp.position} • {exp.period}
                  </p>
                </div>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(exp)}
                  >
                    <Pencil className="size-4" />
                    수정
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  {editingBullets.map((bullet, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-muted-foreground mt-3 flex-shrink-0">
                        •
                      </span>
                      <textarea
                        value={bullet}
                        onChange={(e) => handleBulletChange(index, e.target.value)}
                        className="flex-1 min-h-[80px] p-2 bg-background border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="경력 내용을 입력하세요"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveBullet(index)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddBullet}
                    className="w-full"
                  >
                    <Plus className="size-4" />
                    항목 추가
                  </Button>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} className="flex-1">
                      저장
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="flex-1">
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <ul className="space-y-2">
                  {exp.bullets.map((bullet, index) => (
                    <li key={index} className="flex gap-2 text-sm">
                      <span className="text-muted-foreground flex-shrink-0">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          이전
        </Button>
        <Button onClick={() => onNext(experiences)} className="flex-1">
          다음: 영문 번역
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-400">
          💡 <strong>팁:</strong> 각 경력은 3~4개의 불릿 포인트로 요약하는 것이 좋습니다. 
          핵심 성과와 구체적인 수치를 포함하면 더욱 효과적입니다.
        </p>
      </div>
    </div>
  );
}
