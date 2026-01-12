"use client";

import {
  User,
  Mail,
  Calendar,
  Trash2,
  CreditCard,
  Crown,
  CreditCard as PaymentIcon,
  Loader2,
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
  hasActivePass: boolean; // 이용권 활성화 여부
  quota: number;
  onUpgrade: (plan: string) => void;
  onCancel: () => void;
  onResume?: () => void;
  onUpdateCard?: () => void;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: Date | string;
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
  // Loading States
  isUpgrading?: boolean;
  isUpdatingCard?: boolean;
}

const passConfig = {
  active: { label: "이용권", variant: "default" as const },
  inactive: { label: "무료", variant: "outline" as const },
};

export function SettingsPage({
  userName,
  userEmail,
  userImage,
  createdAt = "2024-01-01",
  onDeleteAccount,
  hasActivePass,
  quota,
  onUpgrade,
  onCancel,
  onResume,
  onUpdateCard,
  cancelAtPeriodEnd,
  currentPeriodEnd,
  paymentInfo,
  paymentHistory = [],
  isUpgrading = false,
  isUpdatingCard = false,
}: SettingsPageProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const config = passConfig[hasActivePass ? "active" : "inactive"];

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

      {/* --- Section 1: Account and Pass Information --- */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2">계정과 이용권</h2>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Left: Account Details */}
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
                  <p className="text-sm text-muted-foreground">{createdAt}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Pass Info */}
          <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="size-5 text-primary" />
              <h3 className="font-semibold">이용권 정보</h3>
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <span className="text-sm font-medium">이용권 상태</span>
                <div className="flex gap-2">
                  <Badge variant={config.variant}>{config.label}</Badge>
                  {cancelAtPeriodEnd && (
                    <Badge variant="outline" className="text-muted-foreground">
                      만료 예정
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
                    {hasActivePass ? "만료일" : "이용 기간"}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {!hasActivePass
                    ? "무제한"
                    : currentPeriodEnd
                    ? new Date(currentPeriodEnd).toLocaleDateString("ko-KR")
                    : "정보 없음"}
                </span>
              </div>

              {/* Integrated Payment Method Info (Only for active pass users) */}
              {hasActivePass && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PaymentIcon className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        최근 결제 수단
                      </span>
                    </div>
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

            {/* Note for Free users */}
            {!hasActivePass && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  💡 이용권을 구매하면 모든 템플릿과 재번역 무제한 혜택을 받을
                  수 있습니다
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- Section 2: Pass Purchase --- */}
      <section className="space-y-6">
        <h2
          id="payment-section"
          className="text-xl font-semibold border-b pb-2 scroll-mt-20"
        >
          이용권 구매
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 30일 이용권 (추천) */}
          <div className="border-2 border-primary/30 rounded-lg p-6 bg-primary/5 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
              추천
            </div>
            <h3 className="text-lg font-bold mb-2 mt-2">30일 이용권</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-primary">₩12,900</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1">
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
                300 크레딧 포함
              </li>
              <li className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1">
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
                모든 템플릿 사용
              </li>
              <li className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1">
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
                재번역 무제한
              </li>
              <li className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1">
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
                30일간 이용
              </li>
            </ul>
            <Button
              variant="default"
              className="w-full"
              disabled={isUpgrading}
              onClick={() => onUpgrade("PASS_30DAY")}
            >
              {isUpgrading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "구매하기"
              )}
            </Button>
          </div>

          {/* 7일 이용권 */}
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-2">7일 이용권</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold">₩9,900</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1">
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
                50 크레딧 포함
              </li>
              <li className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1">
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
                모든 템플릿 사용
              </li>
              <li className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1">
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
                재번역 무제한
              </li>
              <li className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1">
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
                7일간 이용
              </li>
            </ul>
            <Button
              variant="outline"
              className="w-full"
              disabled={isUpgrading}
              onClick={() => onUpgrade("PASS_7DAY")}
            >
              {isUpgrading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "구매하기"
              )}
            </Button>
          </div>

          {/* 크레딧 충전 */}
          <div
            className={`border rounded-lg p-6 ${
              !hasActivePass ? "opacity-50" : ""
            }`}
          >
            <h3 className="text-lg font-bold mb-2">크레딧 충전</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold">₩3,900</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1">
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
                50 크레딧 즉시 충전
              </li>
              <li className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1">
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
                기간 연장 없음
              </li>
              <li className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1">
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
                크레딧만 추가
              </li>
              <li className="flex items-center gap-2 text-amber-600">
                <div className="rounded-full bg-amber-100 p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-2 text-amber-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                이용권 필요
              </li>
            </ul>
            <Button
              variant="outline"
              className="w-full"
              disabled={!hasActivePass || isUpgrading}
              onClick={() => onUpgrade("REFILL_50")}
            >
              {isUpgrading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "충전하기"
              )}
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
