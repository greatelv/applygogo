"use client";

import { useApp } from "../../context/app-context";
import { SettingsPage } from "../../components/settings-page";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

  const handleUpgrade = (newPlan: "PRO") => {
    // Mock upgrade logic - fully implementing payment is separate task
    setPlan(newPlan);
    alert(`${newPlan} 플랜으로 업그레이드되었습니다! (결제 모듈 연동 필요)`);
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
      setPlan("FREE");
      alert("플랜 해지가 예약되었습니다.");
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
