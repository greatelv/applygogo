"use client";

import {
  User,
  Mail,
  Calendar,
  Trash2,
  CreditCard,
  Crown,
  CreditCard as PaymentIcon,
  Check,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
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
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./ui/table";
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
  hasActivePass: boolean;
  passType?: string;
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
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const locale = useLocale();
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .toUpperCase()
    .slice(0, 2);
  const isGlobal = locale !== "ko";

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isPassWarningOpen, setIsPassWarningOpen] = useState(false);
  const [refundIdToConfirm, setRefundIdToConfirm] = useState<string | null>(
    null,
  );

  const handleDeleteAccount = () => {
    if (hasActivePass) {
      setIsPassWarningOpen(true);
    } else {
      setIsDeleteAlertOpen(true);
    }
  };

  const handlePassWarningConfirm = () => {
    setIsPassWarningOpen(false);
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

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return t("labels.unknown");
    return new Date(date).toLocaleDateString(
      locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US",
    );
  };

  const formatPrice = (price?: number) => {
    if (typeof price !== "number") return "";
    // Korean uses currency symbol (Won) after the number
    if (locale === "ko") {
      return `${price.toLocaleString()}${tc("currency")}`;
    }
    // Default (including English) puts symbol before
    return `${tc("currency")}${price.toLocaleString()}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <div>
        <h1 className="text-2xl mb-2">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {/* --- Section 1: Account and Pass Information --- */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2">
          {t("sections.account")}
        </h2>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Left: Account Details */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col justify-center h-full">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <User className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{t("labels.username")}</p>
                  <p className="text-sm text-muted-foreground">{userName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <Mail className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{t("labels.email")}</p>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <Calendar className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{t("labels.joinedAt")}</p>
                  <p className="text-sm text-muted-foreground">{createdAt}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Pass Info */}
          <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="size-5 text-primary" />
              <h3 className="font-semibold">{t("labels.passStatus")}</h3>
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <span className="text-sm font-medium">
                  {t("labels.passStatus")}
                </span>
                <div className="flex gap-2">
                  <Badge variant={hasActivePass ? "default" : "outline"}>
                    {hasActivePass && passType
                      ? t(`passLabels.${passType}`)
                      : t(
                          `passLabels.${hasActivePass ? "active" : "inactive"}`,
                        )}
                  </Badge>
                  {cancelAtPeriodEnd && (
                    <Badge variant="outline" className="text-muted-foreground">
                      {t("labels.expiringSoon")}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <span className="text-sm font-medium">
                  {t("labels.credits")}
                </span>
                <span className="text-sm font-semibold">{quota}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {hasActivePass
                      ? t("labels.expiration")
                      : t("labels.usagePeriod")}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {!hasActivePass
                    ? t("labels.unlimited")
                    : formatDate(currentPeriodEnd)}
                </span>
              </div>

              {hasActivePass && paymentInfo && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PaymentIcon className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {t("labels.paymentMethod")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="h-6 px-2 bg-[#0064FF] rounded flex items-center justify-center text-white text-[10px] font-bold whitespace-nowrap">
                      {t("labels.tossPay")}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium truncate">
                        {paymentInfo?.cardName || t("labels.creditCard")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {paymentInfo?.cardNumber || "**** **** **** ****"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!hasActivePass && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  {t("notices.freeTip")}
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
            {t("sections.purchase")}
          </h2>
          <Badge
            variant="outline"
            className="text-xs px-2.5 py-0.5 text-foreground border-foreground/10 bg-foreground/5"
          >
            {t("notices.passPromotion")}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 30-Day Pass */}
          <div
            className={`border-2 border-primary/30 rounded-lg p-6 bg-primary/5 relative flex flex-col h-full ${
              hasActivePass && passType !== "PASS_30DAY"
                ? "opacity-50 pointer-events-none"
                : ""
            }`}
          >
            {hasActivePass && passType === "PASS_30DAY" && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                {t("plans.pass30.current")}
              </div>
            )}
            {!hasActivePass && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                {t("plans.pass30.recommended")}
              </div>
            )}
            <h3 className="text-lg font-bold mb-2 mt-2">
              {t("plans.pass30.title")}
            </h3>
            <div className="flex flex-col items-start mb-6">
              <span className="text-sm text-muted-foreground/60 line-through min-h-[20px]">
                {formatPrice(
                  isGlobal
                    ? PLAN_PRODUCTS.PASS_30DAY.originalPriceGlobal
                    : PLAN_PRODUCTS.PASS_30DAY.originalPrice,
                )}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(
                    isGlobal
                      ? PLAN_PRODUCTS.PASS_30DAY.priceGlobal
                      : PLAN_PRODUCTS.PASS_30DAY.price,
                  )}
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
              {t
                .raw("plans.pass30.features")
                .map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="size-4 text-primary shrink-0" />
                    {feature.replace(
                      "{credits}",
                      PLAN_PRODUCTS.PASS_30DAY.credits.toString(),
                    )}
                  </li>
                ))}
            </ul>
            <Button
              variant={
                hasActivePass && passType === "PASS_30DAY"
                  ? "secondary"
                  : "default"
              }
              className="w-full mt-auto"
              disabled={
                (hasActivePass && passType === "PASS_30DAY") ||
                (hasActivePass && passType !== "PASS_30DAY") ||
                (userEmail !== "test@applygogo.com" &&
                  process.env.NODE_ENV !== "development")
              }
              onClick={() => onUpgrade("PASS_30DAY")}
              isLoading={isUpgrading}
            >
              {hasActivePass
                ? passType === "PASS_30DAY"
                  ? t("plans.pass30.current")
                  : t("plans.pass30.unavailable")
                : userEmail === "test@applygogo.com"
                  ? t("plans.pass30.test")
                  : t("plans.pass30.beta")}
            </Button>
          </div>

          {/* 7-Day Pass */}
          <div
            className={`border rounded-lg p-6 relative flex flex-col h-full ${
              hasActivePass && passType !== "PASS_7DAY"
                ? "opacity-50 pointer-events-none"
                : ""
            }`}
          >
            {hasActivePass && passType === "PASS_7DAY" && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                {t("plans.pass7.current")}
              </div>
            )}
            <h3 className="text-lg font-bold mb-2 mt-2">
              {t("plans.pass7.title")}
            </h3>
            <div className="flex flex-col items-start mb-6">
              <span className="text-sm text-muted-foreground/60 line-through min-h-[20px]">
                {formatPrice(
                  isGlobal
                    ? PLAN_PRODUCTS.PASS_7DAY.originalPriceGlobal
                    : PLAN_PRODUCTS.PASS_7DAY.originalPrice,
                )}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(
                    isGlobal
                      ? PLAN_PRODUCTS.PASS_7DAY.priceGlobal
                      : PLAN_PRODUCTS.PASS_7DAY.price,
                  )}
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
              {t
                .raw("plans.pass7.features")
                .map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="size-4 text-primary shrink-0" />
                    {feature.replace(
                      "{credits}",
                      PLAN_PRODUCTS.PASS_7DAY.credits.toString(),
                    )}
                  </li>
                ))}
            </ul>
            <Button
              variant={
                hasActivePass && passType === "PASS_7DAY"
                  ? "secondary"
                  : "outline"
              }
              className="w-full mt-auto"
              disabled={
                (hasActivePass && passType === "PASS_7DAY") ||
                (hasActivePass && passType !== "PASS_7DAY") ||
                (userEmail !== "test@applygogo.com" &&
                  process.env.NODE_ENV !== "development")
              }
              onClick={() => onUpgrade("PASS_7DAY")}
              isLoading={isUpgrading}
            >
              {hasActivePass
                ? passType === "PASS_7DAY"
                  ? t("plans.pass7.current")
                  : t("plans.pass7.unavailable")
                : userEmail === "test@applygogo.com"
                  ? t("plans.pass7.test")
                  : t("plans.pass7.beta")}
            </Button>
          </div>

          {/* Credit Refill */}
          <div
            className={`border rounded-lg p-6 flex flex-col h-full ${
              !hasActivePass ? "opacity-50" : ""
            }`}
          >
            <h3 className="text-lg font-bold mb-2 mt-2">
              {t("plans.refill.title")}
            </h3>
            <div className="flex flex-col items-start mb-6">
              <span className="text-sm text-transparent min-h-[20px]">
                Placeholder
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">
                  {formatPrice(
                    isGlobal
                      ? PLAN_PRODUCTS.CREDIT_50.priceGlobal
                      : PLAN_PRODUCTS.CREDIT_50.price,
                  )}
                </span>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6 flex-1">
              {t
                .raw("plans.refill.features")
                .map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="size-4 text-primary shrink-0" />
                    {feature.replace(
                      "{credits}",
                      PLAN_PRODUCTS.CREDIT_50.credits.toString(),
                    )}
                  </li>
                ))}
              <li className="flex items-center gap-2 text-amber-600">
                <Check className="size-4 text-amber-600 shrink-0" />
                {t("plans.refill.required")}
              </li>
            </ul>
            <Button
              variant="outline"
              className="w-full mt-auto"
              disabled={
                !hasActivePass ||
                (userEmail !== "test@applygogo.com" &&
                  process.env.NODE_ENV !== "development")
              }
              onClick={() => onUpgrade("REFILL_50")}
              isLoading={isUpgrading}
            >
              {userEmail === "test@applygogo.com"
                ? t("plans.refill.test")
                : t("plans.refill.beta")}
            </Button>
          </div>
        </div>

        {/* Beta Period Notice */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100 text-center">
            {t.rich("notices.beta", {
              strong: (chunks) => <strong>{chunks}</strong>,
              br: () => <br />,
            })}
          </p>
        </div>

        {/* Subtle Refund Policy Note for Free Users */}
        {!hasActivePass && (
          <p className="text-[11px] text-muted-foreground/60 text-center mt-4">
            {t.rich("notices.refundPolicyFree", {
              link: (chunks) => (
                <a
                  href="/terms"
                  className="underline hover:text-primary transition-colors"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        )}

        {/* Refund Policy Summary & Request (Only for Paid Users) */}
        {hasActivePass && (
          <div className="bg-muted/30 border border-border rounded-lg p-6 mt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">
                  {t("notices.refundPolicyPaid.title")}
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {t
                    .raw("notices.refundPolicyPaid.items")
                    .map((item: string, idx: number) => (
                      <li key={idx}>• {item}</li>
                    ))}
                </ul>
                <a
                  href="/terms"
                  className="text-xs text-primary underline-offset-4 hover:underline block pt-1"
                >
                  {t("notices.refundPolicyPaid.details")}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="space-y-4">
          <h3 className="font-semibold">{t("history.title")}</h3>
          {paymentHistory.length > 0 ? (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="py-3 px-4 font-medium text-muted-foreground">
                        {t("history.table.date")}
                      </th>
                      <th className="py-3 px-4 font-medium text-muted-foreground">
                        {t("history.table.orderId")}
                      </th>
                      <th className="py-3 px-4 font-medium text-muted-foreground">
                        {t("history.table.product")}
                      </th>
                      <th className="py-3 px-4 font-medium text-muted-foreground">
                        {t("history.table.method")}
                      </th>
                      <th className="py-3 px-4 font-medium text-muted-foreground text-right">
                        {t("history.table.amount")}
                      </th>
                      <th className="py-3 px-4 font-medium text-muted-foreground text-center">
                        {t("history.table.status")}
                      </th>
                      <th className="py-3 px-4 font-medium text-muted-foreground text-right">
                        {t("history.table.manage")}
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
                          {formatDate(item.paidAt)}
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
                              ? t("history.status.paid")
                              : item.status === "REFUNDED"
                                ? t("history.status.refunded")
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
                                  {t("history.refund")}
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
                {t("history.empty")}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* --- Section 3: Danger Zone --- */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2 text-destructive">
          {t("sections.danger")}
        </h2>

        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Trash2 className="size-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1 text-destructive">
                {t("dangerZone.title")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("dangerZone.description")}
              </p>

              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="size-4" />
                {t("dangerZone.button")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pass Warning Alert */}
      <AlertDialog open={isPassWarningOpen} onOpenChange={setIsPassWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("alerts.passWarning.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.rich("alerts.passWarning.description", {
                br: () => <br />,
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("alerts.passWarning.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handlePassWarningConfirm}
            >
              {t("alerts.passWarning.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Account Deletion Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              {t("alerts.deleteAccount.title")}
            </AlertDialogTitle>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                {t.rich("alerts.deleteAccount.description", {
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
              <ul className="list-disc list-inside text-xs bg-muted/50 p-2 rounded">
                {t
                  .raw("alerts.deleteAccount.items")
                  .map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
              </ul>
              <p className="font-medium text-destructive pt-2">
                {t("alerts.deleteAccount.confirmText")}
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("alerts.deleteAccount.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmDeleteAccount}
            >
              {t("alerts.deleteAccount.confirm")}
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
            <AlertDialogTitle>{t("alerts.refund.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("alerts.refund.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("alerts.refund.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmRefund}
            >
              {t("alerts.refund.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* PayPal SPB Container Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300",
          isUpgrading && isGlobal
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none",
        )}
      >
        <div
          className={cn(
            "bg-white border border-gray-200 rounded-2xl p-8 max-w-sm w-full shadow-2xl space-y-6 transition-all duration-300",
            isUpgrading && isGlobal ? "scale-100" : "scale-95",
          )}
        >
          <div className="text-center space-y-2">
            <h3 className="text-xl font-extrabold text-gray-900">
              {t("labels.paypalPayment") || "PayPal Payment"}
            </h3>
            <p className="text-sm text-gray-500">
              {t("notices.paypalInstructions") ||
                "Please select your preferred payment method below."}
            </p>
          </div>
          <div
            className="portone-ui-container w-full bg-white overflow-hidden"
            data-portone-ui-type="paypal-spb"
          >
            <div className="flex flex-col items-center justify-center min-h-[160px] gap-2 p-4">
              <Loader2 className="size-6 animate-spin text-gray-400" />
              <span className="text-xs text-gray-400">Loading PayPal...</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            onClick={() => {
              window.location.reload();
            }}
          >
            {tc("cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
