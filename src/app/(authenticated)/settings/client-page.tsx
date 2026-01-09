"use client";

import { useApp } from "../../context/app-context";
import { SettingsPage } from "../../components/settings-page";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import * as PortOne from "@portone/browser-sdk/v2";

interface SettingsClientPageProps {
  user: {
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
      const paymentId = `payment-${crypto.randomUUID()}`;
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;

      if (!storeId) {
        alert("상점 ID가 설정되지 않았습니다.");
        return;
      }

      const response = await PortOne.requestPayment({
        storeId,
        paymentId,
        orderName: "ApplyGogo Pro 플랜 구독",
        totalAmount: 9900,
        currency: "CURRENCY_KRW",
        channelKey: undefined, // Optional if multiple channels
        payMethod: "CARD",
        customer: {
          fullName: user.name || "고객",
          email: user.email || "",
          phoneNumber: "010-0000-0000", // Required by some PG, better to ask user or use dummy
        },
      });

      if (response?.code != null) {
        // Error occurred
        console.error("Payment failed:", response);
        alert(`결제 실패: ${response.message}`);
        return;
      }

      // Payment successful, verifying...
      const verifyRes = await fetch("/api/payment/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });

      if (!verifyRes.ok) {
        throw new Error("Payment verification failed on server");
      }

      alert("결제가 완료되었습니다! Pro 플랜이 시작됩니다.");
      setPlan("PRO");
      router.refresh();
    } catch (error) {
      console.error("Payment flow error:", error);
      alert("결제 처리 중 오류가 발생했습니다. 관리자에게 문의하세요.");
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
