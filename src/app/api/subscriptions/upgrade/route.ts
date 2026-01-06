import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // In a real app, verify payment signature here using req.body

    // Update or create subscription
    // Assuming 'PRO' is the plan name. You might need to check if Plan exists first or use upsert.
    // For simplicity, we assume Plans are seeded or we just set a flag on user if schema allowed,
    // but schema uses Subscription model.

    // Check if PRO plan exists, if not create it (seed)
    let proPlan = await prisma.plan.findUnique({ where: { code: "PRO" } });
    if (!proPlan) {
      proPlan = await prisma.plan.create({
        data: {
          code: "PRO",
          monthlyQuota: 1000,
          maxResumes: 100,
        },
      });
    }

    // Upsert subscription
    // Check if user already has a subscription to update, or create new.
    // Since userId is not unique in Subscription (technically user could have history), we should probably find the active one or just create a new one for this demo.
    // However, for simplicity let's assume one active subscription per user.
    // But schema doesn't enforce one subscription per user.
    // Let's find any existing active subscription and cancel it, then create new one?
    // Or just create a new one.

    // For this MVP, let's just create a new subscription.
    await prisma.subscription.create({
      data: {
        userId,
        planCode: proPlan.code,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription Upgrade Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
