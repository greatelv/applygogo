"use client";

import { BillingPage } from "../../components/billing-page";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const handleUpgrade = (newPlan: "STANDARD" | "PRO") => {
    // Mock upgrade
    alert(`${newPlan} 플랜으로 업그레이드되었습니다!`);
  };

  const handleCancel = () => {
    if (
      confirm(
        "정말 플랜을 해지하시겠습니까? 현재 결제 주기가 끝나면 Free 플랜으로 전환됩니다."
      )
    ) {
      alert("플랜 해지가 예약되었습니다.");
    }
  };

  return (
    <BillingPage
      currentPlan="FREE"
      quota={2}
      onUpgrade={handleUpgrade}
      onCancel={handleCancel}
    />
  );
}
