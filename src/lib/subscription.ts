import { prisma } from "@/lib/prisma";
import { PlanCode } from "@prisma/client";

export async function getUserSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  if (!subscription) {
    // Default to FREE plan properties if no subscription found (should exist if seeded/created on signup)
    // For now, return a default object or fetch the FREE plan details
    const freePlan = await prisma.plan.findUnique({
      where: { code: PlanCode.FREE },
    });

    return {
      plan: PlanCode.FREE,
      quota: freePlan?.monthlyQuota || 3.0,
    };
  }

  return {
    plan: subscription.planCode,
    quota: subscription.plan.monthlyQuota, // Logic to calculate remaining quota will be added later (UsageLog)
  };
}
