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
  onResume?: () => void;
  onUpdateCard?: () => void; // Prop 추가
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: Date | string; // Prop 추가
  paymentInfo?: {
    cardName?: string;
    cardNumber?: string;
  };
  paymentHistory?: Array<{
    id: string;
    name: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: string;
    method: string;
  }>;
}

const planConfig = {
  FREE: { label: "Free", variant: "outline" as const },
  PRO: { label: "Pro", variant: "default" as const },
};

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
  onResume,
  onUpdateCard,
  cancelAtPeriodEnd,
  currentPeriodEnd,
  paymentInfo,
  paymentHistory = [],
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
          {/* Left: Subscription Info + Integrated Payment Info */}
          <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="size-5 text-primary" />
              <h3 className="font-semibold">구독 정보</h3>
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <span className="text-sm font-medium">현재 플랜</span>
                <div className="flex gap-2">
                  <Badge variant={config.variant}>{config.label}</Badge>
                  {cancelAtPeriodEnd && (
                    <Badge variant="outline" className="text-muted-foreground">
                      해지 예약됨
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <span className="text-sm font-medium">남은 크레딧</span>
                <span className="text-sm font-semibold">{quota}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {cancelAtPeriodEnd ? "이용 만료일" : "다음 갱신일"}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {currentPlan === "FREE"
                    ? "없음"
                    : currentPeriodEnd
                    ? new Date(currentPeriodEnd).toLocaleDateString("ko-KR")
                    : "정보 없음"}
                </span>
              </div>

              {/* Integrated Payment Method Info (Only for PRO) */}
              {currentPlan === "PRO" && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PaymentIcon className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">결제 수단</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 px-2 text-primary hover:text-primary/90"
                      onClick={onUpdateCard}
                    >
                      변경
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    {/* Toss Pay Badge */}
                    <div className="h-6 px-2 bg-[#0064FF] rounded flex items-center justify-center text-white text-[10px] font-bold whitespace-nowrap">
                      토스페이
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium truncate">
                        {paymentInfo?.cardName || "신용카드"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {paymentInfo?.cardNumber || "**** **** **** ****"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Subscription Actions */}
            {currentPlan !== "FREE" && !cancelAtPeriodEnd && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="outline" onClick={onCancel} className="w-full">
                  플랜 해지
                </Button>
              </div>
            )}

            {currentPlan !== "FREE" && cancelAtPeriodEnd && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="default" onClick={onResume} className="w-full">
                  해지 예약 취소
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  구독을 유지하고 혜택을 계속 받으세요.
                </p>
              </div>
            )}
          </div>

          {/* Right: PRO Plan Info (Always visible, state depends on subscription) */}
          <div
            className={`bg-card border rounded-lg p-6 flex flex-col ${
              currentPlan === "PRO"
                ? "border-primary/50 shadow-sm"
                : "border-border"
            }`}
          >
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Pro Plan</h3>
                {currentPlan === "PRO" && (
                  <Badge variant="default">이용중</Badge>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">₩9,900</span>
                <span className="text-sm text-muted-foreground">/월</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                전문적인 이력서 관리를 위한 최고의 선택
              </p>
            </div>

            <ul className="space-y-3 mb-6 flex-1">
              {[
                "월 100 크레딧 제공",
                "무제한 이력서 보관",
                "모든 프리미엄 템플릿 사용 가능",
                "우선 고객 지원",
                "PDF 다운로드 제한 없음",
              ].map((feature, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-2 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={currentPlan === "PRO" ? "outline" : "default"}
              disabled={currentPlan === "PRO"}
              onClick={() => onUpgrade("PRO")}
              className="w-full"
              size="lg"
            >
              {currentPlan === "PRO"
                ? "현재 이용중인 플랜입니다"
                : "지금 프로 플랜 시작하기"}
            </Button>
          </div>
        </div>

        {/* Payment History */}
        <div className="space-y-4">
          <h3 className="font-semibold">결제 내역</h3>
          {paymentHistory.length > 0 ? (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="py-3 px-4 font-medium text-muted-foreground">
                        결제일
                      </th>
                      <th className="py-3 px-4 font-medium text-muted-foreground">
                        상품명
                      </th>
                      <th className="py-3 px-4 font-medium text-muted-foreground">
                        결제 수단
                      </th>
                      <th className="py-3 px-4 font-medium text-muted-foreground text-right">
                        금액
                      </th>
                      <th className="py-3 px-4 font-medium text-muted-foreground text-center">
                        상태
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-border last:border-0 hover:bg-muted/20"
                      >
                        <td className="py-3 px-4">
                          {new Date(item.paidAt).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="py-3 px-4 font-medium">{item.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {item.method}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {item.amount.toLocaleString()} {item.currency}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={
                              item.status === "PAID" ? "outline" : "secondary"
                            }
                            className={
                              item.status === "PAID"
                                ? "text-green-600 border-green-200 bg-green-50"
                                : ""
                            }
                          >
                            {item.status === "PAID" ? "결제 완료" : item.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <CreditCard className="size-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                결제 내역이 없습니다
              </p>
            </div>
          )}
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
