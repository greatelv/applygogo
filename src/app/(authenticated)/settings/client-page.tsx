"use client";

import { useApp } from "../../context/app-context";
import { SettingsPage } from "../../components/settings-page";
import { useRouter } from "next/navigation";

interface SettingsClientPageProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function SettingsClientPage({ user }: SettingsClientPageProps) {
  const router = useRouter();
  const { plan, quota, setPlan } = useApp();

  const handleUpgrade = (newPlan: "STANDARD" | "PRO") => {
    // Mock upgrade logic
    setPlan(newPlan);
    alert(`${newPlan} 플랜으로 업그레이드되었습니다!`);
  };

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
      // Mock data for now, ideally passed from server or context
      createdAt="2024-01-01"
      onDeleteAccount={handleDeleteAccount}
      currentPlan={plan}
      quota={quota}
      onUpgrade={handleUpgrade}
      onCancel={handleCancel}
    />
  );
}
