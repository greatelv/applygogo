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
  Check,
} from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { PLAN_PRODUCTS } from "@/lib/constants/plans";

interface SettingsPageProps {
  // Profile Props
  userName: string;
  userEmail: string;
  userImage?: string;
  createdAt?: string;
  onDeleteAccount?: () => void;

  // Billing Props
  hasActivePass: boolean; // 이용권 활성화 여부
  passType?: string; // 이용권 종류 (PASS_7DAY, PASS_30DAY 등)
  quota: number;
  onUpgrade: (plan: string) => void;
  onRefund?: (paymentId: string) => void;
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
  isRefunding?: boolean;
  isUpdatingCard?: boolean;
  canRefund?: boolean;
}

const passConfig = {
  active: { label: "이용권", variant: "default" as const },
  inactive: { label: "무료", variant: "outline" as const },
};

const passLabels: Record<string, string> = {
  PASS_7DAY: "7일 이용권",
  PASS_30DAY: "30일 이용권",
  FREE: "무료",
};

export function SettingsPage({
  userName,
  userEmail,
  userImage,
  createdAt = "2024-01-01",
  onDeleteAccount,
  hasActivePass,
  passType,
  quota,
  onUpgrade,
  onRefund,
  onCancel,
  onResume,
  onUpdateCard,
  cancelAtPeriodEnd,
  currentPeriodEnd,
  paymentInfo,
  paymentHistory = [],
  isUpgrading = false,
  isRefunding = false,
  isUpdatingCard = false,
  canRefund = false,
}: SettingsPageProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [refundIdToConfirm, setRefundIdToConfirm] = useState<string | null>(
    null
  );

  const config = passConfig[hasActivePass ? "active" : "inactive"];

  const handleDeleteAccount = () => {
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteAccount = () => {
    onDeleteAccount?.();
    setIsDeleteAlertOpen(false);
  };

  const confirmRefund = () => {
    if (refundIdToConfirm) {
      onRefund?.(refundIdToConfirm);
      setRefundIdToConfirm(null);
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
                  <Badge variant={config.variant}>
                    {hasActivePass && passType && passLabels[passType]
                      ? passLabels[passType]
                      : config.label}
                  </Badge>
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
        <div className="flex items-center gap-3 border-b pb-2">
          <h2
            id="payment-section"
            className="text-xl font-semibold scroll-mt-20"
          >
            이용권 구매
          </h2>
          <Badge
            variant="outline"
            className="text-xs px-2.5 py-0.5 text-foreground border-foreground/10 bg-foreground/5"
          >
            🎉 오픈 기념 초특가
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 30일 이용권 (추천) */}
          <div
            className={`border-2 border-primary/30 rounded-lg p-6 bg-primary/5 relative flex flex-col h-full ${
              hasActivePass && passType !== "PASS_30DAY"
                ? "opacity-50 pointer-events-none"
                : ""
            }`}
          >
            {hasActivePass && passType === "PASS_30DAY" && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                현재 이용 중
              </div>
            )}
            {!hasActivePass && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                추천
              </div>
            )}
            <h3 className="text-lg font-bold mb-2 mt-2">30일 이용권</h3>
            <div className="flex flex-col items-start mb-6">
              <span className="text-sm text-muted-foreground/60 line-through min-h-[20px]">
                ₩{PLAN_PRODUCTS.PASS_30DAY.originalPrice?.toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary">
                  ₩{PLAN_PRODUCTS.PASS_30DAY.price.toLocaleString()}
                </span>
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] text-foreground border-foreground/10 bg-foreground/5"
                >
                  57% OFF
                </Badge>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                {PLAN_PRODUCTS.PASS_30DAY.credits} 크레딧
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                모든 템플릿 & 재번역 무제한
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                30일간 자유 이용
              </li>
            </ul>
            <Button
              variant={
                hasActivePass && passType === "PASS_30DAY"
                  ? "secondary"
                  : "default"
              }
              className="w-full mt-auto"
              disabled={isUpgrading || hasActivePass}
              onClick={() => onUpgrade("PASS_30DAY")}
            >
              {isUpgrading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : hasActivePass ? (
                passType === "PASS_30DAY" ? (
                  "현재 이용 중"
                ) : (
                  "전환 불가"
                )
              ) : (
                "구매하기"
              )}
            </Button>
          </div>

          {/* 7일 이용권 */}
          <div
            className={`border rounded-lg p-6 relative flex flex-col h-full ${
              hasActivePass && passType !== "PASS_7DAY"
                ? "opacity-50 pointer-events-none"
                : ""
            }`}
          >
            {hasActivePass && passType === "PASS_7DAY" && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                현재 이용 중
              </div>
            )}
            <h3 className="text-lg font-bold mb-2 mt-2">7일 이용권</h3>
            <div className="flex flex-col items-start mb-6">
              <span className="text-sm text-muted-foreground/60 line-through min-h-[20px]">
                ₩{PLAN_PRODUCTS.PASS_7DAY.originalPrice?.toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-foreground">
                  ₩{PLAN_PRODUCTS.PASS_7DAY.price.toLocaleString()}
                </span>
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] text-foreground border-foreground/10 bg-foreground/5"
                >
                  50% OFF
                </Badge>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                {PLAN_PRODUCTS.PASS_7DAY.credits} 크레딧
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                모든 템플릿 & 재번역 무제한
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                7일간 맛보기 이용
              </li>
            </ul>
            <Button
              variant={
                hasActivePass && passType === "PASS_7DAY"
                  ? "secondary"
                  : "outline"
              }
              className="w-full mt-auto"
              disabled={isUpgrading || hasActivePass}
              onClick={() => onUpgrade("PASS_7DAY")}
            >
              {isUpgrading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : hasActivePass ? (
                passType === "PASS_7DAY" ? (
                  "현재 이용 중"
                ) : (
                  "전환 불가"
                )
              ) : (
                "구매하기"
              )}
            </Button>
          </div>

          {/* 크레딧 충전 */}
          <div
            className={`border rounded-lg p-6 flex flex-col h-full ${
              !hasActivePass ? "opacity-50" : ""
            }`}
          >
            <h3 className="text-lg font-bold mb-2 mt-2">크레딧 충전</h3>
            <div className="flex flex-col items-start mb-6">
              {/* Empty placeholder to match height of original price in other cards */}
              <span className="text-sm text-transparent min-h-[20px]">
                Placeholder
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">
                  ₩{PLAN_PRODUCTS.CREDIT_50.price.toLocaleString()}
                </span>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                {PLAN_PRODUCTS.CREDIT_50.credits} 크레딧 충전
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                기간 제한 없음
              </li>
              <li className="flex items-center gap-2 text-amber-600">
                <Check className="size-4 text-amber-600 shrink-0" />
                이용권 필요
              </li>
            </ul>
            <Button
              variant="outline"
              className="w-full mt-auto"
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

        {/* Subtle Refund Policy Note for Free Users */}
        {!hasActivePass && (
          <p className="text-[11px] text-muted-foreground/60 text-center mt-4">
            구매 전 지원고고의{" "}
            <a
              href="/terms"
              className="underline hover:text-primary transition-colors"
            >
              취소 및 환불 규정
            </a>
            을 확인해 주세요.
          </p>
        )}

        {/* Refund Policy Summary & Request (Only for Paid Users) */}
        {hasActivePass && (
          <div className="bg-muted/30 border border-border rounded-lg p-6 mt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">취소 및 환불 규정</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• 결제 후 7일 이내, 서비스 미이용 시 전액 환불 가능</li>
                  <li>• 크레딧 사용 또는 AI 처리 이력이 있는 경우 환불 불가</li>
                  <li>• 본 서비스는 부분 환불 정책을 운영하지 않습니다</li>
                </ul>
                <a
                  href="/terms"
                  className="text-xs text-primary underline-offset-4 hover:underline block pt-1"
                >
                  상세 약관 보기
                </a>
              </div>
            </div>
          </div>
        )}

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
                        주문 번호
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
                      <th className="py-3 px-4 font-medium text-muted-foreground text-right">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-border last:border-0 hover:bg-muted/20"
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          {new Date(item.paidAt).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            {item.id}
                          </code>
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
                                : item.status === "REFUNDED"
                                ? "text-muted-foreground border-muted-foreground/20 bg-muted/20"
                                : ""
                            }
                          >
                            {item.status === "PAID"
                              ? "결제 완료"
                              : item.status === "REFUNDED"
                              ? "환불 완료"
                              : item.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {(() => {
                            const paidAt = new Date(item.paidAt);
                            const sevenDaysAgo = new Date();
                            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                            const isWithin7Days = paidAt > sevenDaysAgo;
                            const isRefundable =
                              item.status === "PAID" && isWithin7Days;

                            return (
                              isRefundable && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  disabled={isRefunding}
                                  onClick={() => {
                                    setRefundIdToConfirm(item.id);
                                  }}
                                >
                                  {isRefunding ? (
                                    <Loader2 className="size-3 animate-spin mr-1" />
                                  ) : null}
                                  환불하기
                                </Button>
                              )
                            );
                          })()}
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

      {/* Account Deletion Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 계정을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              계정을 삭제하면 모든 이력서 데이터와 이용권/크레딧 정보가
              영구적으로 삭제되며 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmDeleteAccount}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Refund Alert */}
      <AlertDialog
        open={!!refundIdToConfirm}
        onOpenChange={(open) => !open && setRefundIdToConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>환불을 진행하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              환불 시 해당 이용권의 모든 혜택(크레딧 및 기능)이 즉시 회수됩니다.
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmRefund}
            >
              환불하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
