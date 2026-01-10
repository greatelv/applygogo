"use client";

import { useApp } from "../../context/app-context";
import { SettingsPage } from "../../components/settings-page";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import * as PortOne from "@portone/browser-sdk/v2";

interface SettingsClientPageProps {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  settings?: any;
}

export function SettingsClientPage({
  user,
  settings,
}: SettingsClientPageProps) {
  const router = useRouter();
  const { setPlan } = useApp();

  const serverPlan = settings?.subscription?.planCode || "FREE";
  const serverQuota = settings?.remainingQuota ?? 2;
  const createdAt = settings?.created_at
    ? new Date(settings.created_at).toISOString()
    : "2024-01-01";

  const handleUpgrade = async (newPlan: "PRO") => {
    try {
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

      if (!storeId || !channelKey) {
        alert("결제 설정 정보가 부족합니다. 관리자에게 문의하세요.");
        return;
      }

      // 1. Request Billing Key (Auth)
      const response = await PortOne.requestIssueBillingKey({
        storeId,
        channelKey,
        billingKeyMethod: "EASY_PAY",
        issueName: "지원고고 정기 결제 등록",
        customer: {
          customerId: user.id || user.email || "guest",
        },
      } as any);

      if (response?.code != null) {
        alert(`인증 실패: ${response.message}`);
        return;
      }

      const billingKey = response.billingKey;

      // 2. Register Billing Key & Charge Initial Payment on Server
      const res = await fetch("/api/billing/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingKey, channelKey }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "서버 결제 처리 실패");
      }

      alert("정기 결제가 등록되고 첫 달 구독이 시작되었습니다!");
      setPlan("PRO");
      router.refresh();
    } catch (error: any) {
      console.error("Subscription flow error:", error);
      alert(`구독 처리 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  useEffect(() => {
    if (window.location.hash === "#payment-section") {
      const element = document.getElementById("payment-section");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, []);

  const handleCancel = () => {
    if (
      confirm(
        "정말 플랜을 해지하시겠습니까? 현재 결제 주기가 끝나면 Free 플랜으로 전환됩니다."
      )
    ) {
      setPlan("FREE");
      alert("플랜 해지가 예약되었습니다. (실제 해지 API 미구현)");
    }
  };

  const handleDeleteAccount = () => {
    alert("계정 삭제가 요청되었습니다.");
  };

  return (
    <SettingsPage
      userName={user.name || "사용자"}
      userEmail={user.email || ""}
      userImage={user.image || undefined}
      createdAt={createdAt}
      onDeleteAccount={handleDeleteAccount}
      currentPlan={serverPlan}
      quota={serverQuota}
      onUpgrade={handleUpgrade}
      onCancel={handleCancel}
    />
  );
}
