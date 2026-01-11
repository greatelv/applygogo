import { prisma } from "@/lib/prisma";

/**
 * Check if the user has enough credits for the requested operation.
 */
export async function checkCredits(
  userId: string,
  cost: number
): Promise<boolean> {
  // 1. Get user with subscription and usage logs
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
      usage_logs: true,
    },
  });

  if (!user) return false;

  // 2. Calculate current usage
  // - PRO: Based on billing cycle (current_period_start) -> Resets every month
  // - FREE: All time usage (No reset) -> One-time 10 credits
  const isPro =
    user.subscription?.plan?.code === "PRO" &&
    user.subscription?.status === "ACTIVE";

  let periodStart: Date | null = null; // Default: All time (FREE)

  if (isPro && user.subscription?.current_period_start) {
    periodStart = new Date(user.subscription.current_period_start);
  }

  const usageCount = user.usage_logs
    .filter((log) => (periodStart ? log.created_at >= periodStart : true))
    .reduce((sum, log) => sum + log.amount, 0);

  // 3. Get quota
  // Default to 10 (Free tier) if not found
  const planQuota = user.subscription?.plan?.monthly_quota ?? 10;

  // 4. Check if enough remaining
  return usageCount + cost <= planQuota;
}

/**
 * Deduct credits from the user's account.
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string
): Promise<void> {
  await prisma.usageLog.create({
    data: {
      userId,
      amount,
      description,
    },
  });
}
