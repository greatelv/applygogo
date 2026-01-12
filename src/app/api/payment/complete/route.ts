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
      if (amount === 9900) {
        // 7일 이용권
        await grantPass(user.id, "PASS_7DAY");
        await tx.paymentHistory.create({
          data: {
            userId: user.id,
            paymentId: paymentData.id,
            orderName: "ApplyGoGo 7일 이용권",
            amount: 9900,
            currency: "KRW",
            status: "PAID",
            method: paymentData.method?.type || null,
            receiptUrl: paymentData.receiptUrl || null,
            details: paymentData,
          },
        });
      } else if (amount === 12900) {
        // 30일 이용권
        await grantPass(user.id, "PASS_30DAY");
        await tx.paymentHistory.create({
          data: {
            userId: user.id,
            paymentId: paymentData.id,
            orderName: "ApplyGoGo 30일 이용권",
            amount: 12900,
            currency: "KRW",
            status: "PAID",
            method: paymentData.method?.type || null,
            receiptUrl: paymentData.receiptUrl || null,
            details: paymentData,
          },
        });
      } else if (amount === 3900) {
        // 크레딧 충전 50
        await refillCredits(user.id, 50);
        await tx.paymentHistory.create({
          data: {
            userId: user.id,
            paymentId: paymentData.id,
            orderName: "크레딧 충전 50",
            amount: 3900,
            currency: "KRW",
            status: "PAID",
            method: paymentData.method?.type || null,
            receiptUrl: paymentData.receiptUrl || null,
            details: paymentData,
          },
        });
      } else {
        throw new Error(`Invalid payment amount: ${amount}`);
      }
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
