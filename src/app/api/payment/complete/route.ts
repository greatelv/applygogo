import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assuming prisma instance helper exists, if not I'll revert to standard import
import { auth } from "@/auth"; // Assuming auth helper exists

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { paymentId } = await req.json();
    const secret = process.env.PORTONE_API_SECRET;

    if (!paymentId) {
      return NextResponse.json(
        { message: "Missing paymentId" },
        { status: 400 }
      );
    }

    // 1. Verify payment with PortOne API (V2)
    const verifyRes = await fetch(
      `https://api.portone.io/payments/${paymentId}`,
      {
        headers: {
          Authorization: `PortOne ${secret}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!verifyRes.ok) {
      const errorText = await verifyRes.text();
      console.error("PortOne verification failed:", errorText);
      return NextResponse.json(
        { message: "Payment verification failed" },
        { status: 400 }
      );
    }

    const paymentData = await verifyRes.json();

    // Check if payment is actually paid
    // V2 API response structure: { id, status, amount: { total, ... }, ... }
    // Status should be "PAID"
    if (paymentData.status !== "PAID") {
      return NextResponse.json(
        { message: "Payment status is not PAID" },
        { status: 400 }
      );
    }

    // Verify amount (9900)
    if (paymentData.amount.total !== 9900) {
      // In a real app, you might refund here automatically
      return NextResponse.json(
        { message: "Payment amount mismatch" },
        { status: 400 }
      );
    }

    // 2. Update Database
    // Ensure "PRO" plan exists (idempotent check ideally, or assumes seeded)
    // We update/create the subscription.

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Upsert Subscription
    // Calculate period end (1 month later)
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await prisma.$transaction(async (tx) => {
      // Ensure Plan exists
      const plan = await tx.plan.findUnique({ where: { code: "PRO" } });
      if (!plan) {
        await tx.plan.create({
          data: {
            code: "PRO",
            monthly_quota: 100,
            max_resumes: -1, // unlimited
          },
        });
      }

      await tx.subscription.upsert({
        where: { userId: user.id },
        update: {
          planCode: "PRO",
          status: "ACTIVE",
          current_period_start: now,
          current_period_end: periodEnd,
          billing_key: paymentData.billingKey || null, // If using billing key
        },
        create: {
          userId: user.id,
          planCode: "PRO",
          status: "ACTIVE",
          current_period_start: now,
          current_period_end: periodEnd,
          billing_key: paymentData.billingKey || null,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment complete error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
