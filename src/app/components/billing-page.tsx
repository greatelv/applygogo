import { CreditCard, Crown, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface BillingPageProps {
  currentPlan: "FREE" | "STANDARD" | "PRO";
  quota: number;
  onUpgrade: (plan: "STANDARD" | "PRO") => void;
  onCancel: () => void;
}

const plans = [
  {
    id: "FREE" as const,
    name: "Free",
    price: 0,
    quota: 2,
    resumes: 1,
    features: ["월 2 크레딧", "이력서 1개 보관", "기본 템플릿"],
  },
  {
    id: "STANDARD" as const,
    name: "Standard",
    price: 9900,
    quota: 6,
    resumes: 3,
    features: ["월 6 크레딧", "이력서 3개 보관", "모든 템플릿", "우선 지원"],
  },
  {
    id: "PRO" as const,
    name: "Pro",
    price: 29900,
    quota: 20,
    resumes: "무제한",
    features: ["월 20 크레딧", "무제한 이력서 보관", "모든 템플릿", "우선 지원", "커스텀 템플릿"],
  },
];

const planConfig = {
  FREE: { label: "Free", variant: "outline" as const },
  STANDARD: { label: "Standard", variant: "secondary" as const },
  PRO: { label: "Pro", variant: "default" as const },
};

export function BillingPage({ currentPlan, quota, onUpgrade, onCancel }: BillingPageProps) {
  const config = planConfig[currentPlan];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl mb-2">결제 관리</h1>
        <p className="text-sm text-muted-foreground">
          플랜을 업그레이드하여 더 많은 기능을 사용하세요
        </p>
      </div>

      {/* Subscription Info */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Crown className="size-5 text-primary" />
          <h3 className="font-semibold">구독 정보</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <span className="text-sm font-medium">현재 플랜</span>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <span className="text-sm font-medium">남은 크레딧</span>
            <span className="text-sm font-semibold">{quota}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">다음 갱신일</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {currentPlan === "FREE" ? "없음" : "2026-02-01"}
            </span>
          </div>
        </div>

        {currentPlan !== "FREE" && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button variant="outline" onClick={onCancel} className="w-full">
              플랜 해지
            </Button>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold">플랜 선택</h2>
        <p className="text-sm text-muted-foreground mt-1">
          필요에 맞는 플랜을 선택하세요
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isDowngrade = 
            (currentPlan === "PRO" && plan.id !== "PRO") ||
            (currentPlan === "STANDARD" && plan.id === "FREE");

          return (
            <div
              key={plan.id}
              className={`
                bg-card border rounded-lg p-6 flex flex-col
                ${isCurrent ? "border-foreground shadow-md" : "border-border"}
              `}
            >
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    {plan.price === 0 ? "무료" : `₩${plan.price.toLocaleString()}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-muted-foreground">/월</span>
                  )}
                </div>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={isCurrent ? "outline" : "default"}
                disabled={isCurrent || isDowngrade}
                onClick={() => plan.id !== "FREE" && onUpgrade(plan.id)}
                className="w-full"
              >
                {isCurrent ? "현재 플랜" : isDowngrade ? "다운그레이드 불가" : "업그레이드"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Payment history placeholder */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-4">결제 내역</h2>
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <CreditCard className="size-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">결제 내역이 없습니다</p>
        </div>
      </div>
    </div>
  );
}