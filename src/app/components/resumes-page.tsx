import { FileText, Plus, Trash2 } from "lucide-react";
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
  onDelete?: (id: string) => void;
  quota?: number;
  onUpgrade?: () => void;
}

const statusConfig = {
  IDLE: { label: "업로드됨", variant: "outline" as const },
  SUMMARIZED: { label: "요약됨", variant: "secondary" as const },
  TRANSLATED: { label: "번역됨", variant: "secondary" as const },
  COMPLETED: { label: "완료", variant: "success" as const },
  FAILED: { label: "실패", variant: "warning" as const },
};

export function ResumesPage({
  resumes,
  onCreateNew,
  onSelectResume,
  onDelete,
  quota = 0,
  onUpgrade,
}: ResumesPageProps) {
  const hasNoCredits = quota === 0;

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
          {hasNoCredits ? (
            <div className="space-y-3">
              <p className="text-sm text-destructive">
                크레딧이 부족합니다. 플랜을 업그레이드하세요.
              </p>
              {onUpgrade && (
                <Button onClick={onUpgrade} size="lg">
                  플랜 업그레이드
                </Button>
              )}
            </div>
          ) : (
            <Button onClick={onCreateNew} size="lg">
              <Plus className="size-5" />새 이력서 만들기
            </Button>
          )}
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
        {hasNoCredits ? (
          onUpgrade && <Button onClick={onUpgrade}>플랜 업그레이드</Button>
        ) : (
          <Button onClick={onCreateNew}>
            <Plus className="size-4" />새 이력서 만들기
          </Button>
        )}
      </div>

      {hasNoCredits && (
        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-400">
            ⚠️ 크레딧이 부족하여 새 이력서를 만들 수 없습니다. 플랜을
            업그레이드하거나 다음 갱신일을 기다려주세요.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {resumes.map((resume) => {
          const config = statusConfig[resume.status];
          return (
            <div
              key={resume.id}
              onClick={() => onSelectResume(resume.id)}
              className="w-full bg-card border border-border rounded-lg p-4 hover:border-foreground/20 hover:shadow-sm transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-1 shrink-0">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1 truncate">
                      {resume.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      마지막 수정:{" "}
                      {new Date(resume.updatedAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={config.variant}>{config.label}</Badge>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive shrink-0 -mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("정말 이 이력서를 삭제하시겠습니까?")) {
                          onDelete(resume.id);
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
