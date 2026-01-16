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
import { useState, useRef, useEffect } from "react";
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
  const labels = {
    active: "Member",
    inactive: "Free",
    PASS_7DAY: "7-Day Pass",
    PASS_30DAY: "30-Day Pass",
    PASS_BETA_3DAY: "Beta Unlimited",
  };

  const passConfig = {
    active: { label: "Member", variant: "default" as const },
    inactive: { label: "Free", variant: "outline" as const },
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [isPassWarningOpen, setIsPassWarningOpen] = useState(false);
  const [refundIdToConfirm, setRefundIdToConfirm] = useState<string | null>(
    null
  );

  const config = passConfig[hasActivePass ? "active" : "inactive"];

  const handleDeleteAccount = () => {
    if (hasActivePass) {
      setIsPassWarningOpen(true);
    } else {
      setIsDeleteAlertOpen(true);
    }
  };

  const handlePassWarningConfirm = () => {
    setIsPassWarningOpen(false);
    // 잠시 대기 후 삭제 확인 모달 오픈 (UX 자연스러움을 위해)
    setTimeout(() => setIsDeleteAlertOpen(true), 200);
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

  const paymentSectionRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (
      window.location.hash === "#payment-section" &&
      paymentSectionRef.current
    ) {
      paymentSectionRef.current.focus();
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <div>
        <h1 className="text-2xl mb-2">{"Settings"}</h1>
        <p className="text-sm text-muted-foreground">
          {"Manage your account information and billing in one place"}
        </p>
      </div>

      {/* --- Section 1: Account and Pass Information --- */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2">
          {"Account & Pass"}
        </h2>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Left: Account Details */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-center h-full">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <User className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{"Username"}</p>
                  <p className="text-sm text-muted-foreground">{userName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <Mail className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{"Email"}</p>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <Calendar className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{"Joined At"}</p>
                  <p className="text-sm text-muted-foreground">{createdAt}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Pass Info */}
          <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="size-5 text-primary" />
              <h3 className="font-semibold">{"Pass Information"}</h3>
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <span className="text-sm font-medium">{"Pass Status"}</span>
                <div className="flex gap-2">
                  <Badge variant={config.variant}>
                    {hasActivePass && passType && labels[passType]
                      ? labels[passType]
                      : config.label}
                  </Badge>
                  {cancelAtPeriodEnd && (
                    <Badge variant="outline" className="text-muted-foreground">
                      {"Expiring Soon"}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <span className="text-sm font-medium">
                  {"Remaining Credits"}
                </span>
                <span className="text-sm font-semibold">{quota}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {hasActivePass ? "Expiry Date" : "Usage Period"}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {!hasActivePass
                    ? "Unlimited"
                    : currentPeriodEnd
                    ? new Date(currentPeriodEnd).toLocaleDateString("en-US")
                    : "No Info"}
                </span>
              </div>

              {/* Integrated Payment Method Info (Only for active pass users with payment info) */}
              {hasActivePass && paymentInfo && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PaymentIcon className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {"Last Payment Method"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    {/* PayPal Badge */}
                    <div className="h-6 px-2 bg-[#003087] rounded flex items-center justify-center text-white text-[10px] font-bold whitespace-nowrap">
                      {"PayPal"}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium truncate">
                        {paymentInfo?.cardName || "Credit Card"}
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
                  {
                    "💡 Purchase a pass to get all templates and unlimited re-translations"
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-2">
          <h2
            id="payment-section"
            ref={paymentSectionRef}
            tabIndex={-1}
            className="text-xl font-semibold scroll-mt-20 outline-none"
          >
            {"Purchase Pass"}
          </h2>
          <Badge
            variant="outline"
            className="text-xs px-2.5 py-0.5 text-foreground border-foreground/10 bg-foreground/5"
          >
            {"🎉 Open Special Offer"}
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
                {"Currently Using"}
              </div>
            )}
            {!hasActivePass && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                {"Recommended"}
              </div>
            )}
            <h3 className="text-lg font-bold mb-2 mt-2">{"30-Day Pass"}</h3>
            <div className="flex flex-col items-start mb-6">
              <span className="text-sm text-muted-foreground/60 line-through min-h-[20px]">
                ${PLAN_PRODUCTS.PASS_30DAY.originalPrice?.toFixed(2)}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary">
                  ${PLAN_PRODUCTS.PASS_30DAY.price.toFixed(2)}
                </span>
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] text-foreground border-foreground/10 bg-foreground/5"
                >
                  57% {"OFF"}
                </Badge>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                {PLAN_PRODUCTS.PASS_30DAY.credits} + " Credits included"
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                {"All Templates & Unlimited Re-translation"}
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                {"30 Days Free Access"}
              </li>
            </ul>
            <Button
              variant={
                hasActivePass && passType === "PASS_30DAY"
                  ? "secondary"
                  : "default"
              }
              className="w-full mt-auto"
              disabled={
                // 1. 이미 같은 이용권을 사용 중이면 비활성화
                (hasActivePass && passType === "PASS_30DAY") ||
                // 2. 이용권 업그레이드 등 로직상 비활성화
                (hasActivePass && passType !== "PASS_30DAY")
              }
              onClick={() => onUpgrade("PASS_30DAY")}
              isLoading={isUpgrading}
            >
              {hasActivePass
                ? passType === "PASS_30DAY"
                  ? "Currently Using"
                  : "Not Possible"
                : "Purchase Pass"}
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
                {"Currently Using"}
              </div>
            )}
            <h3 className="text-lg font-bold mb-2 mt-2">{"7-Day Pass"}</h3>
            <div className="flex flex-col items-start mb-6">
              <span className="text-sm text-muted-foreground/60 line-through min-h-[20px]">
                ${PLAN_PRODUCTS.PASS_7DAY.originalPrice?.toFixed(2)}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-foreground">
                  ${PLAN_PRODUCTS.PASS_7DAY.price.toFixed(2)}
                </span>
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] text-foreground border-foreground/10 bg-foreground/5"
                >
                  50% {"OFF"}
                </Badge>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                {PLAN_PRODUCTS.PASS_7DAY.credits} + " Credits included"
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                {"All Templates & Unlimited Re-translation"}
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                {"7 Days Trial Access"}
              </li>
            </ul>
            <Button
              variant={
                hasActivePass && passType === "PASS_7DAY"
                  ? "secondary"
                  : "outline"
              }
              className="w-full mt-auto"
              disabled={
                // 1. 이미 같은 이용권을 사용 중이면 비활성화
                (hasActivePass && passType === "PASS_7DAY") ||
                // 2. 이용권 업그레이드 등 로직상 비활성화
                (hasActivePass && passType !== "PASS_7DAY")
              }
              onClick={() => onUpgrade("PASS_7DAY")}
              isLoading={isUpgrading}
            >
              {hasActivePass
                ? passType === "PASS_7DAY"
                  ? "Currently Using"
                  : "Not Possible"
                : "Purchase Pass"}
            </Button>
          </div>

          {/* 크레딧 충전 */}
          <div
            className={`border rounded-lg p-6 flex flex-col h-full ${
              !hasActivePass ? "opacity-50" : ""
            }`}
          >
            <h3 className="text-lg font-bold mb-2 mt-2">{"Refill"}</h3>
            <div className="flex flex-col items-start mb-6">
              {/* Empty placeholder to match height of original price in other cards */}
              <span className="text-sm text-transparent min-h-[20px]">
                Placeholder
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">
                  ${PLAN_PRODUCTS.CREDIT_50.price.toFixed(2)}
                </span>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                {PLAN_PRODUCTS.CREDIT_50.credits} + " Credits included"
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary shrink-0" />
                {"No time limit"}
              </li>
              <li className="flex items-center gap-2 text-amber-600">
                <Check className="size-4 text-amber-600 shrink-0" />
                {"Pass required"}
              </li>
            </ul>
            <Button
              variant="outline"
              className="w-full mt-auto"
              disabled={
                // 1. 이용권이 없으면 비활성화 (크레딧 충전은 이용권 보유 시에만 가능)
                !hasActivePass
              }
              onClick={() => onUpgrade("REFILL_50")}
              isLoading={isUpgrading}
            >
              {"Refill"}
            </Button>
          </div>
        </div>

        {/* Subtle Refund Policy Note for Free Users */}
        {!hasActivePass && (
          <p className="text-[11px] text-muted-foreground/60 text-center mt-4">
            Check ApplyGogo's{" "}
            <a
              href="/terms"
              className="underline hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cancellation and Refund Policy
            </a>{" "}
            before purchasing.
          </p>
        )}

        {/* Refund Policy Summary & Request (Only for Paid Users) */}
        {hasActivePass && (
          <div className="bg-muted/30 border border-border rounded-lg p-6 mt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">
                  {"Cancellation & Refund Policy"}
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>
                    •{" "}
                    {
                      "Full refund within 7 days of payment if service is not used"
                    }
                  </li>
                  <li>
                    •{" "}
                    {
                      "No refund if credits have been used or AI processing has started"
                    }
                  </li>
                  <li>
                    • {"This service does not operate a partial refund policy"}
                  </li>
                </ul>
                <a
                  href="/terms"
                  className="text-xs text-primary underline-offset-4 hover:underline block pt-1"
                >
                  {"View Full Terms"}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="space-y-4">
          <h3 className="font-semibold">{"Payment History"}</h3>
          {paymentHistory.length > 0 ? (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="py-3 px-4 font-medium text-muted-foreground">
                        {"Paid At"}
                      </th>
                      <th className="py-3 px-4 font-medium text-muted-foreground">
                        {"Order ID"}
                      </th>
                      <th className="py-3 px-4 font-medium text-muted-foreground">
                        {"Product"}
                      </th>
                      <th className="py-3 px-4 font-medium text-muted-foreground">
                        {"Method"}
                      </th>
                      <th className="py-3 px-4 font-medium text-muted-foreground text-right">
                        {"Amount"}
                      </th>
                      <th className="py-3 px-4 font-medium text-muted-foreground text-center">
                        {"Status"}
                      </th>
                      <th className="py-3 px-4 font-medium text-muted-foreground text-right">
                        {"Manage"}
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
                          {new Date(item.paidAt).toLocaleDateString("en-US")}
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
                              ? "Paid"
                              : item.status === "REFUNDED"
                              ? "Refunded"
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
                                  isLoading={isRefunding}
                                >
                                  {"Refund"}
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
                {"No payment history"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* --- Section 3: Danger Zone --- */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2 text-destructive">
          {"Danger Zone"}
        </h2>

        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Trash2 className="size-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 text-destructive">
                {"Delete Account"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {"Deleting your account will permanently remove all data"}
              </p>

              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="size-4" />
                {"Delete Account"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pass Warning Alert (1st Confirmation for Paid Users) */}
      <AlertDialog open={isPassWarningOpen} onOpenChange={setIsPassWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{"Are you absolutely sure?"}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will{" "}
              <strong>permanently delete your account</strong> and remove all
              your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{"Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handlePassWarningConfirm}
            >
              {"Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Account Deletion Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              {"Permanently delete account"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                To confirm, please type <strong>DELETE</strong> below.
              </p>
              <ul className="list-disc list-inside text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                <li>{"All your resumes will be deleted"}</li>
                <li>{"Your subscription and credits will be forfeited"}</li>
                <li>{"This action cannot be undone"}</li>
              </ul>
              <p className="font-medium text-destructive pt-2">
                {"Please type DELETE to confirm"}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{"Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmDeleteAccount}
            >
              {"Delete Account"}
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
            <AlertDialogTitle>{"Request Refund?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {
                "Refund will be processed according to our policy. This may take 3-5 business days."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{"Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmRefund}
            >
              {"Request Refund"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
