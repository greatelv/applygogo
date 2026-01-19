import { prisma } from "@/lib/prisma";
import { PLAN_PRODUCTS, getProductByPrice } from "@/lib/constants/plans";

/**
 * 액션 타입과 플랜 타입에 따라 소모될 크레딧 비용을 계산합니다.
 */
export function calculateCost(
  action: "GENERATE" | "RETRANSLATE" | "DOWNLOAD",
  planType: string,
): number {
  if (action === "GENERATE") {
    return 5; // 모든 사용자 동일
  }

  if (action === "RETRANSLATE") {
    // FREE 사용자는 1 크레딧, 유료 사용자는 무제한(0 크레딧)
    // 베타 3일권도 유료 플랜으로 간주됨 (NOT FREE)
    return planType === "FREE" ? 1 : 0;
  }

  if (action === "DOWNLOAD") {
    return 0; // 다운로드는 무료
  }

  return 0;
}

/**
 * [BETA PROMOTION]
 * 신규 가입 유저에게 베타 기간( ~ 2026.01.25 23:59:59) 한정으로
 * 3일 무제한 이용권(50 크레딧 포함)을 지급합니다.
 */
export async function grantBetaWelcomeBenefit(userId: string): Promise<void> {
  const BENEFIT_END_DATE = new Date("2026-01-25T23:59:59+09:00"); // KST
  const now = new Date();

  // 프로모션 기간이 지났으면 지급하지 않음
  if (now > BENEFIT_END_DATE) {
    console.log("[Beta Promo] Promotion ended. Skipping benefit grant.");
    return;
  }

  console.log(`[Beta Promo] Granting benefit to user ${userId}`);

  // 3일 이용권 부여 (내부적으로 크레딧 50 지급 포함)
  await grantPass(userId, "PASS_BETA_3DAY", prisma);
}

/**
 * 사용자가 충분한 크레딧을 가지고 있는지 확인합니다.
 */
export async function checkCredits(
  userId: string,
  cost: number,
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
      plan_type: true,
      plan_expires_at: true,
    },
  });

  if (!user) return false;

  // 크레딧 잔액 확인
  return user.credits >= cost;
}

/**
 * 사용자의 크레딧을 차감합니다 (버킷 방식).
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1. 유저 정보 및 유료 크레딧 버킷 조회
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user || user.credits < amount) {
      throw new Error("소진할 크레딧이 부족합니다.");
    }

    const paidBuckets = await tx.paymentHistory.findMany({
      where: {
        user_id: userId,
        status: "PAID",
        remaining_credits: { gt: 0 },
      },
      orderBy: { paid_at: "asc" }, // FIFO: 먼저 결제한 것부터
    });

    // 2. 소진 로직
    let remainingToDeduct = amount;

    // 전체 결제 버킷 잔액 합계 계산
    const totalPaidCredits = paidBuckets.reduce(
      (sum, b) => sum + b.remaining_credits,
      0,
    );
    const freeCredits = user.credits - totalPaidCredits;

    // 2-1. 무료 크레딧 우선 소진
    if (freeCredits > 0) {
      const freeToDeduct = Math.min(freeCredits, remainingToDeduct);
      remainingToDeduct -= freeToDeduct;
    }

    // 2-2. 부족분은 유료 버킷에서 순차적으로 소진
    if (remainingToDeduct > 0) {
      for (const bucket of paidBuckets) {
        if (remainingToDeduct <= 0) break;

        const deductFromThisBucket = Math.min(
          bucket.remaining_credits,
          remainingToDeduct,
        );

        await tx.paymentHistory.update({
          where: { id: bucket.id },
          data: {
            remaining_credits: {
              decrement: deductFromThisBucket,
            },
          },
        });

        remainingToDeduct -= deductFromThisBucket;
      }
    }

    // 3. 유저 총 잔액 업데이트 및 로그 기록
    await tx.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: amount,
        },
      },
    });

    await tx.usageLog.create({
      data: {
        id: crypto.randomUUID(),
        user: { connect: { id: userId } },
        amount,
        description,
      },
    });
  });
}

/**
 * 사용자에게 이용권을 부여합니다 (7일 또는 30일).
 * 기존 이용권이 유효하다면 기간을 연장합니다.
 */
export async function grantPass(
  userId: string,
  passType: "PASS_7DAY" | "PASS_30DAY" | "PASS_BETA_3DAY",
  client: any = prisma,
): Promise<void> {
  const planConfig = PLAN_PRODUCTS[passType];
  if (!planConfig) {
    throw new Error(`Invalid pass type: ${passType}`);
  }

  // 현재 사용자 상태 조회
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { plan_expires_at: true, plan_type: true },
  });

  const now = new Date();
  let baseDate = now;

  // 이미 유효한 이용권이 있다면 그 시점부터 연장
  if (user?.plan_expires_at && user.plan_expires_at > now) {
    baseDate = new Date(user.plan_expires_at);
  }

  const newExpiresAt = new Date(baseDate);
  newExpiresAt.setDate(newExpiresAt.getDate() + planConfig.days);

  await client.user.update({
    where: { id: userId },
    data: {
      plan_type: passType, // 항상 최신 구매한 플랜 타입으로 갱신
      plan_expires_at: newExpiresAt,
      credits: {
        increment: planConfig.credits,
      },
    },
  });
}

/**
 * 사용자의 크레딧만 충전합니다 (만료일/플랜 타입 변경 없음).
 */
export async function refillCredits(
  userId: string,
  amount: number,
  client: any = prisma,
): Promise<void> {
  await client.user.update({
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
      plan_expires_at: true,
    },
  });

  if (!user) return false;

  const now = new Date();
  const isPaidActive = user.plan_expires_at && user.plan_expires_at > now;

  return isPaidActive && user.credits < 5;
}

/**
 * 사용자 이용권을 회수합니다 (환불 시 호출).
 */
export async function revokePass(
  userId: string,
  creditsToDeduct: number,
  client: any = prisma,
): Promise<void> {
  await client.user.update({
    where: { id: userId },
    data: {
      plan_type: "FREE",
      plan_expires_at: null,
      credits: {
        decrement: creditsToDeduct,
      },
    },
  });
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
      plan_type: true,
      credits: true,
      plan_expires_at: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const now = new Date();

  // 만료일이 지났다면 FREE로 전환
  if (
    user.plan_expires_at &&
    user.plan_expires_at <= now &&
    user.plan_type !== "FREE"
  ) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan_type: "FREE",
        plan_expires_at: null,
      },
    });

    return {
      planType: "FREE",
      credits: user.credits,
      planExpiresAt: null,
    };
  }

  return {
    planType: user.plan_type,
    credits: user.credits,
    planExpiresAt: user.plan_expires_at,
  };
}

/**
 * 결제 성공 처리를 수행하는 공통 로직입니다.
 * Webhook과 클라이언트 콜백 양쪽에서 사용됩니다.
 */
export async function processPaymentSuccess(
  paymentData: any,
  userEmail: string,
) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 이미 처리된 결제인지 확인 (Idempotency)
  const existingHistory = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id FROM payment_histories WHERE payment_id = $1 LIMIT 1`,
    paymentData.id,
  );

  if (existingHistory.length > 0) {
    return { success: true, message: "Already processed" };
  }

  const amount = paymentData.amount.total;
  const product = getProductByPrice(amount);

  if (!product) {
    throw new Error(`Invalid payment amount: ${amount}`);
  }

  await prisma.$transaction(async (tx) => {
    // 1. Grant Plan or Refill Credits
    if (product.id === "PASS_7DAY" || product.id === "PASS_30DAY") {
      await grantPass(user.id, product.id, tx);
    } else if (product.id === "CREDIT_50") {
      await refillCredits(user.id, product.credits, tx);
    }

    // 2. Create History Record
    const newId = `ph_${Math.random().toString(36).substr(2, 9)}`;

    await tx.$executeRawUnsafe(
      `
        INSERT INTO payment_histories (
          id, user_id, payment_id, order_name, amount, currency, status, method, 
          paid_at, receipt_url, initial_credits, remaining_credits, details
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 
          NOW(), $9, $10, $11, $12
        )
      `,
      newId,
      user.id,
      paymentData.id,
      product.name,
      amount,
      "KRW",
      "PAID",
      paymentData.method?.type || null,
      paymentData.receiptUrl || null,
      product.credits,
      product.credits,
      JSON.stringify(paymentData),
    );
  });

  return { success: true };
}
