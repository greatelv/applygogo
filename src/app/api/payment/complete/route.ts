import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { grantPass, refillCredits } from "@/lib/billing";

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
    if (paymentData.status !== "PAID") {
      return NextResponse.json(
        { message: "Payment status is not PAID" },
        { status: 400 }
      );
    }

    // 2. Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const amount = paymentData.amount.total;

    // 3. Process based on payment amount
    await prisma.$transaction(async (tx) => {
      let orderName = "";
      let initialCredits = 0;
      let targetAmount = 0;

      if (amount === 9900) {
        orderName = "ApplyGoGo 7일 이용권";
        initialCredits = 50;
        targetAmount = 9900;
        await grantPass(user.id, "PASS_7DAY", tx);
      } else if (amount === 12900) {
        orderName = "ApplyGoGo 30일 이용권";
        initialCredits = 300;
        targetAmount = 12900;
        await grantPass(user.id, "PASS_30DAY", tx);
      } else if (amount === 3900) {
        orderName = "크레딧 충전 50";
        initialCredits = 50;
        targetAmount = 3900;
        await refillCredits(user.id, 50, tx);
      } else {
        throw new Error(`Invalid payment amount: ${amount}`);
      }

      // Generate a random CUID-like ID for the history record
      const newId = `ph_${Math.random().toString(36).substr(2, 9)}`;

      // Use Raw SQL to bypass Prisma Client schema validation issues
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
        orderName,
        targetAmount,
        "KRW",
        "PAID",
        paymentData.method?.type || null,
        paymentData.receiptUrl || null,
        initialCredits,
        initialCredits,
        JSON.stringify(paymentData)
      );
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
