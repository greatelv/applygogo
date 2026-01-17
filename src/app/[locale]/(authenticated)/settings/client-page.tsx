"use client";

import { useApp } from "@/app/context/app-context";
import { SettingsPage } from "@/app/components/settings-page";
import { deleteAccount } from "@/app/lib/actions";
import { useRouter } from "@/i18n/routing";
import { useEffect, useState } from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { PLAN_PRODUCTS } from "@/lib/constants/plans";

interface SettingsClientPageProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  settings: any;
  portoneConfig: {
    storeId: string;
    channelKey: string;
  };
}

export function SettingsClientPage({
  user,
  settings,
  portoneConfig,
}: SettingsClientPageProps) {
  const router = useRouter();
  const { setPlan } = useApp();
  const t = useTranslations("settings");
  const locale = useLocale();

  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);

  const planType = settings?.planType || "FREE";
  const credits = settings?.credits || 0;
  const planExpiresAt = settings?.planExpiresAt
    ? new Date(settings.planExpiresAt)
    : null;
  const createdAt = settings?.created_at
    ? new Date(settings.created_at).toLocaleDateString(
        locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US",
      )
    : t("labels.unknown");

  const [paymentHistory, setPaymentHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/billing/history");
      if (res.ok) {
        const data = await res.json();
        setPaymentHistory(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUpgrade = async (
    passType: "PASS_7DAY" | "PASS_30DAY" | "REFILL_50",
  ) => {
    if (isUpgrading) return;
    setIsUpgrading(true);

    try {
      const productConfig: Record<string, { amount: number; name: string }> = {
        PASS_7DAY: {
          amount: PLAN_PRODUCTS.PASS_7DAY.price,
          name: PLAN_PRODUCTS.PASS_7DAY.name,
        },
        PASS_30DAY: {
          amount: PLAN_PRODUCTS.PASS_30DAY.price,
          name: PLAN_PRODUCTS.PASS_30DAY.name,
        },
        REFILL_50: {
          amount: PLAN_PRODUCTS.CREDIT_50.price,
          name: PLAN_PRODUCTS.CREDIT_50.name,
        },
      };

      const product = productConfig[passType];

      const response = await PortOne.requestPayment({
        storeId: portoneConfig.storeId,
        channelKey: portoneConfig.channelKey,
        paymentId: `payment-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        orderName: product.name,
        totalAmount: product.amount,
        currency: "KRW",
        payMethod: "EASY_PAY",
        customer: {
          customerId: user.id,
          fullName: user.name || undefined,
          email: user.email || undefined,
        },
      });

      if (response.code != null) {
        setIsUpgrading(false);
        return;
      }

      const res = await fetch("/api/payment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: response.paymentId }),
      });

      if (!res.ok)
        throw new Error(
          t("toast.purchaseError", { message: "Verification failed" }),
        );

      toast.success(t("toast.purchaseSuccess", { name: product.name }));

      await fetchHistory();
      router.refresh();

      if (passType !== "REFILL_50") {
        setPlan(passType);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(t("toast.purchaseError", { message: error.message }));
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleRefund = async (paymentId: string) => {
    if (isRefunding) return;
    setIsRefunding(true);

    const previousHistory = [...paymentHistory];
    const optimisticHistory = paymentHistory.map((item: any) =>
      item.id === paymentId ? { ...item, status: "REFUNDED" } : item,
    );
    // @ts-ignore
    setPaymentHistory(optimisticHistory);

    try {
      const res = await fetch("/api/payment/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || t("toast.refundError", { message: "Request failed" }),
        );
      }

      toast.success(t("toast.refundSuccess"));

      await fetchHistory();
      router.refresh();
      setPlan("FREE");
    } catch (error: any) {
      console.error(error);
      toast.error(t("toast.refundError", { message: error.message }));
      // @ts-ignore
      setPaymentHistory(previousHistory);
    } finally {
      setIsRefunding(false);
    }
  };

  const now = new Date();
  const latestPayment: any = paymentHistory.find(
    (h: any) => h.status === "PAID" && h.name.includes("이용권"),
  );

  let hasActivePass = planExpiresAt ? planExpiresAt > now : false;

  if (!hasActivePass && latestPayment) {
    const paidAt = new Date(latestPayment.paidAt);
    const durationDays = latestPayment.name.includes("30일") ? 30 : 7;
    const expiry = new Date(paidAt);
    expiry.setDate(expiry.getDate() + durationDays);
    if (expiry > now) {
      hasActivePass = true;
    }
  }

  let canRefund = false;
  if (latestPayment && hasActivePass) {
    const paidAt = new Date(latestPayment.paidAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const isWithin7Days = paidAt > sevenDaysAgo;
    canRefund = isWithin7Days;
  }

  const handleDeleteAccount = async () => {
    const promise = deleteAccount(`/${locale}`);

    toast.promise(promise, {
      loading: t("toast.deleting"),
      success: t("toast.deleteSuccess"),
      error: t("toast.deleteError"),
    });

    try {
      await promise;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SettingsPage
      userName={user.name || "User"}
      userEmail={user.email || ""}
      userImage={user.image || undefined}
      createdAt={createdAt}
      onDeleteAccount={handleDeleteAccount}
      hasActivePass={hasActivePass}
      passType={planType}
      quota={credits}
      onUpgrade={handleUpgrade}
      onRefund={handleRefund}
      onCancel={() => {}}
      currentPeriodEnd={planExpiresAt || undefined}
      paymentHistory={paymentHistory}
      isUpgrading={isUpgrading}
      isRefunding={isRefunding}
      canRefund={canRefund}
    />
  );
}
