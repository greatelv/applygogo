"use client";

import { useApp } from "../../context/app-context";
import { SettingsPage } from "../../components/settings-page";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import * as PortOne from "@portone/browser-sdk/v2";

interface SettingsClientPageProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  settings?: any; // Type strictly if shared types available
}

export function SettingsClientPage({
  user,
  settings,
}: SettingsClientPageProps) {
  const router = useRouter();
  const { setPlan } = useApp();

  // derived from server data
  const serverPlan = settings?.subscription?.planCode || "FREE";
  const serverQuota = settings?.remainingQuota ?? 2;
  const createdAt = settings?.created_at
    ? new Date(settings.created_at).toISOString()
    : "2024-01-01";

  const handleUpgrade = async (newPlan: "PRO") => {
    try {
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
      // You should add this channel key in .env for Toss Payments
      const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

      if (!storeId) {
        alert("상점 ID(Store ID)가 설정되지 않았습니다.");
        return;
      }

      if (!channelKey) {
        alert(
          "채널 키(Channel Key)가 설정되지 않았습니다. .env 파일을 확인해주세요."
        );
        return;
      }

      // 1. Request Billing Key (Auth)
      // Use "EASY_PAY" for Toss Pay (App-based auth)
      console.log("[Client Page] Requesting billing key with data:", {
        storeId,
        channelKey,
        billingKeyMethod: "EASY_PAY",
        issueName: "지원고고 정기 결제 등록",
        customer: {
          customerId: user.id || user.email || crypto.randomUUID(),
        },
      });
      const response = await PortOne.requestIssueBillingKey({
        storeId,
        channelKey,
        billingKeyMethod: "EASY_PAY",
        issueName: "지원고고 정기 결제 등록",
        customer: {
          customerId: user.id || user.email || crypto.randomUUID(),
        },
      } as any);

      console.log("[Client Page] PortOne Response:", response);

      if (response?.code != null) {
        console.error("[Client Page] PortOne Error:", response);
        alert(`인증 실패: ${response.message}`);
        return;
      }

      const billingKey = response.billingKey; // Captured billing key
      console.log("[Client Page] Received billingKey:", billingKey);

      // 2. Register Billing Key & Charge Initial Payment on Server
      console.log("[Client Page] Registering billing key with data:", {
        billingKey,
        channelKey,
      });
      const res = await fetch("/api/billing/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingKey, channelKey }),
      });

      console.log("[Client Page] API Response Status:", res.status);

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
    // Check for hash in URL to handle anchor scrolling after hydration
    if (window.location.hash === "#payment-section") {
      const element = document.getElementById("payment-section");
      if (element) {
        // Short timeout to ensure layout is stable
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
      // In a real app, call API to cancel subscription
      setPlan("FREE");
      alert("플랜 해지가 예약되었습니다. (실제 해지 API 미구현)");
    }
  };

  const handleDeleteAccount = () => {
    // Mock delete logic
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
