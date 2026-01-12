import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { processPaymentSuccess } from "@/lib/billing";

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

    // 2. Process Payment using shared logic
    // Refactored to use processPaymentSuccess which handles DB updates and idempotency
    const result = await processPaymentSuccess(paymentData, session.user.email);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Payment complete error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
