import { FileText, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Resume {
  id: string;
  title: string;
  status: "IDLE" | "SUMMARIZED" | "TRANSLATED" | "COMPLETED" | "FAILED";
  updatedAt: string;
}

interface ResumesPageProps {
  resumes: Resume[];
  onCreateNew: () => void;
  onSelectResume: (id: string) => void;
}

const statusConfig = {
  IDLE: { label: "업로드됨", variant: "outline" as const },
  SUMMARIZED: { label: "요약됨", variant: "secondary" as const },
  TRANSLATED: { label: "번역됨", variant: "secondary" as const },
  COMPLETED: { label: "완료", variant: "success" as const },
  FAILED: { label: "실패", variant: "warning" as const },
};

export function ResumesPage({ resumes, onCreateNew, onSelectResume }: ResumesPageProps) {
  if (resumes.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-muted mb-4">
            <FileText className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl mb-2">이력서가 없습니다</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            첫 번째 이력서를 업로드하여 AI 기반 영문 변환을 시작하세요
          </p>
          <Button onClick={onCreateNew} size="lg">
            <Plus className="size-5" />
            새 이력서 만들기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl mb-1">이력서 관리</h1>
          <p className="text-sm text-muted-foreground">
            총 {resumes.length}개의 이력서
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="size-4" />
          새로 만들기
        </Button>
      </div>

      <div className="space-y-3">
        {resumes.map((resume) => {
          const config = statusConfig[resume.status];
          return (
            <button
              key={resume.id}
              onClick={() => onSelectResume(resume.id)}
              className="w-full bg-card border border-border rounded-lg p-4 hover:border-foreground/20 hover:shadow-sm transition-all text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-1 shrink-0">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1 truncate">{resume.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      마지막 수정: {new Date(resume.updatedAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}