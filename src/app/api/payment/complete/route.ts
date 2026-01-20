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
        { status: 400 },
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
      },
    );

    if (!verifyRes.ok) {
      const errorText = await verifyRes.text();
      console.error("PortOne verification failed:", errorText);
      return NextResponse.json(
        { message: "Payment verification failed" },
        { status: 400 },
      );
    }

    const paymentData = await verifyRes.json();

    // Check if payment is actually paid
    if (paymentData.status !== "PAID") {
      return NextResponse.json(
        { message: "Payment status is not PAID" },
        { status: 400 },
      );
    }

    // [Security] Verify Amount and Currency
    const { PLAN_PRODUCTS } = await import("@/lib/constants/plans");
    const orderName = paymentData.orderName;
    const paidAmount = paymentData.amount.total;
    const paidCurrency = paymentData.currency;

    // Find the product config by order name matching
    // (Weak matching: using find to match name strings)
    const productKey = Object.keys(PLAN_PRODUCTS).find((key) => {
      // @ts-ignore
      return PLAN_PRODUCTS[key].name === orderName;
    });

    if (!productKey) {
      console.warn(`Unknown product name: ${orderName}`);
      // If we proceed, it's a risk. Let's return error or allow with logging.
      // Ideally, we should block unknown products.
      return NextResponse.json(
        { message: "Invalid product name" },
        { status: 400 },
      );
    }

    // @ts-ignore
    const productConfig = PLAN_PRODUCTS[productKey];
    let expectedPrice = productConfig.price;
    let expectedCurrency = "KRW";

    // If paid in USD, check global price
    if (paidCurrency === "USD") {
      expectedPrice = productConfig.priceGlobal * 100; // Expected in cents
      expectedCurrency = "USD";
    }

    // Tolerance for floating point (though integers are used mostly)
    if (Math.abs(paidAmount - expectedPrice) > 1) {
      console.error(
        `Price mismatch! Expected: ${expectedPrice}, Paid: ${paidAmount}`,
      );
      return NextResponse.json(
        { message: "Payment amount mismatch" },
        { status: 400 },
      );
    }

    if (paidCurrency !== expectedCurrency) {
      console.error(
        `Currency mismatch! Expected: ${expectedCurrency}, Paid: ${paidCurrency}`,
      );
      return NextResponse.json(
        { message: "Payment currency mismatch" },
        { status: 400 },
      );
    }

    // 2. Process Payment using shared logic
    // [Fix] If USD, convert cents back to dollars for DB storage
    if (paymentData.currency === "USD") {
      paymentData.amount.total = paymentData.amount.total / 100;
    }

    // Refactored to use processPaymentSuccess which handles DB updates and idempotency
    const result = await processPaymentSuccess(paymentData, session.user.email);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Payment complete error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
