import { prisma } from "@/lib/prisma";

/**
 * 액션 타입과 플랜 타입에 따라 소모될 크레딧 비용을 계산합니다.
 */
export function calculateCost(
  action: "GENERATE" | "RETRANSLATE" | "DOWNLOAD",
  planType: string
): number {
  if (action === "GENERATE") {
    return 5; // 모든 사용자 동일
  }

  if (action === "RETRANSLATE") {
    // FREE 사용자는 1 크레딧, 유료 사용자는 무제한(0 크레딧)
    return planType === "FREE" ? 1 : 0;
  }

  if (action === "DOWNLOAD") {
    return 0; // 다운로드는 무료
  }

  return 0;
}

/**
 * 사용자가 충분한 크레딧을 가지고 있는지 확인합니다.
 */
export async function checkCredits(
  userId: string,
  cost: number
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
      planType: true,
      planExpiresAt: true,
    },
  });

  if (!user) return false;

  // 크레딧 잔액 확인
  return user.credits >= cost;
}

/**
 * 사용자의 크레딧을 차감합니다.
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 크레딧 차감
    await tx.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: amount,
        },
      },
    });

    // 사용 로그 기록
    await tx.usageLog.create({
      data: {
        userId,
        amount,
        description,
      },
    });
  });
}

/**
 * 사용자에게 이용권을 부여합니다 (7일 또는 30일).
 */
export async function grantPass(
  userId: string,
  passType: "PASS_7DAY" | "PASS_30DAY"
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now);
  let creditsToAdd = 0;

  if (passType === "PASS_7DAY") {
    expiresAt.setDate(expiresAt.getDate() + 7);
    creditsToAdd = 50;
  } else if (passType === "PASS_30DAY") {
    expiresAt.setDate(expiresAt.getDate() + 30);
    creditsToAdd = 300;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      planType: passType,
      planExpiresAt: expiresAt,
      credits: {
        increment: creditsToAdd,
      },
    },
  });
}

/**
 * 사용자의 크레딧만 충전합니다 (만료일/플랜 타입 변경 없음).
 */
export async function refillCredits(
  userId: string,
  amount: number
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      credits: {
        increment: amount,
      },
    },
  });
}

/**
 * 유료 플랜 사용 중이지만 크레딧이 부족한지 확인합니다.
 */
export async function checkLowCredit(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
      planExpiresAt: true,
    },
  });

  if (!user) return false;

  const now = new Date();
  const isPaidActive = user.planExpiresAt && user.planExpiresAt > now;

  return isPaidActive && user.credits < 5;
}

/**
 * 사용자의 현재 플랜 상태를 확인합니다.
 * 만료일이 지났다면 자동으로 FREE로 전환합니다.
 */
export async function checkAndUpdatePlanStatus(userId: string): Promise<{
  planType: string;
  credits: number;
  planExpiresAt: Date | null;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      planType: true,
      credits: true,
      planExpiresAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();

  // 만료일이 지났다면 FREE로 전환
  if (
    user.planExpiresAt &&
    user.planExpiresAt <= now &&
    user.planType !== "FREE"
  ) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        planType: "FREE",
        planExpiresAt: null,
      },
    });

    return {
      planType: "FREE",
      credits: user.credits,
      planExpiresAt: null,
    };
  }

  return {
    planType: user.planType,
    credits: user.credits,
    planExpiresAt: user.planExpiresAt,
  };
}
