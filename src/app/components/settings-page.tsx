"use client";

import {
  User,
  Mail,
  Calendar,
  Trash2,
  CreditCard,
  Crown,
  CreditCard as PaymentIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface SettingsPageProps {
  // Profile Props
  userName: string;
  userEmail: string;
  userImage?: string;
  createdAt?: string;
  onDeleteAccount?: () => void;

  // Billing Props
  currentPlan: "FREE" | "PRO";
  quota: number;
  onUpgrade: (plan: "PRO") => void;
  onCancel: () => void;
}

const planConfig = {
  FREE: { label: "Free", variant: "outline" as const },
  PRO: { label: "Pro", variant: "default" as const },
};

const plans = [
  {
    id: "FREE" as const,
    name: "Free",
    price: 0,
    quota: 3,
    resumes: 1,
    features: ["월 3 크레딧", "이력서 1개 보관", "Modern, Classic 템플릿"],
  },
  {
    id: "PRO" as const,
    name: "Pro",
    price: 9900,
    quota: 100,
    resumes: "무제한",
    features: [
      "월 100 크레딧",
      "무제한 이력서 보관",
      "모든 템플릿 (Minimal 포함)",
      "우선 지원",
    ],
  },
];

export function SettingsPage({
  userName,
  userEmail,
  userImage,
  createdAt = "2024-01-01",
  onDeleteAccount,
  currentPlan,
  quota,
  onUpgrade,
  onCancel,
}: SettingsPageProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const config = planConfig[currentPlan || "FREE"]; // Fallback for safety

  const handleDeleteAccount = () => {
    if (
      confirm(
        "정말 계정을 삭제하시겠습니까? 모든 데이터가 영구적으로 삭제됩니다."
      )
    ) {
      onDeleteAccount?.();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <div>
        <h1 className="text-2xl mb-2">설정</h1>
        <p className="text-sm text-muted-foreground">
          계정 정보 및 결제 관리를 한곳에서 설정하세요
        </p>
      </div>

      {/* --- Section 1: Account Information (Profile) --- */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2">프로필 정보</h2>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Profile Card */}
          <div className="bg-card border border-border rounded-lg p-8 flex flex-col justify-center h-full">
            <div className="flex items-center gap-6">
              <Avatar className="size-24">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold">{userName}</h2>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
                <p className="text-muted-foreground">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-center h-full">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <User className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">사용자 이름</p>
                  <p className="text-sm text-muted-foreground">{userName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <Mail className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">이메일</p>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <Calendar className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">가입일</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: Payment Information (Billing) --- */}
      <section className="space-y-6">
        <h2
          id="payment-section"
          className="text-xl font-semibold border-b pb-2 scroll-mt-20"
        >
          결제 및 플랜 관리
        </h2>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Subscription Info */}
          <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="size-5 text-primary" />
              <h3 className="font-semibold">구독 정보</h3>
            </div>

            <div className="space-y-3 flex-1">
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

          {/* Payment Method (Mock) */}
          <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <PaymentIcon className="size-5 text-muted-foreground" />
              <h3 className="font-semibold">결제 수단</h3>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
              {currentPlan === "FREE" ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    등록된 결제 수단이 없습니다.
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    카드 등록
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg w-full">
                    <div className="w-12 h-8 bg-black rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">Hyundai Card</p>
                      <p className="text-xs text-muted-foreground">
                        **** **** **** 1234
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/90"
                  >
                    결제 수단 변경
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          <h3 className="font-semibold">플랜 변경</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              const isDowngrade = currentPlan === "PRO" && plan.id === "FREE";

              return (
                <div
                  key={plan.id}
                  className={`
                    bg-card border rounded-lg p-6 flex flex-col
                    ${
                      isCurrent
                        ? "border-foreground shadow-md"
                        : "border-border"
                    }
                    `}
                >
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        {plan.price === 0
                          ? "무료"
                          : `₩${plan.price.toLocaleString()}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-sm text-muted-foreground">
                          /월
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 mt-0.5">
                          ✓
                        </span>
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
                    {isCurrent
                      ? "현재 플랜"
                      : isDowngrade
                      ? "다운그레이드 불가"
                      : "업그레이드"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment History */}
        <div className="space-y-4">
          <h3 className="font-semibold">결제 내역</h3>
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <CreditCard className="size-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              결제 내역이 없습니다
            </p>
          </div>
        </div>
      </section>

      {/* --- Section 3: Danger Zone --- */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2 text-destructive">
          위험 구역
        </h2>

        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Trash2 className="size-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 text-destructive">계정 삭제</h3>
              <p className="text-sm text-muted-foreground mb-4">
                계정 삭제 시 모든 데이터가 영구적으로 삭제됩니다
              </p>

              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="size-4" />
                계정 삭제
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
