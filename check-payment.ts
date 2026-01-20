import { prisma } from "./src/lib/prisma";

// const prisma = new PrismaClient();

async function main() {
  try {
    const payment = await prisma.paymentHistory.findFirst({
      orderBy: { paid_at: "desc" },
    });

    if (payment) {
      console.log("✅ 최근 결제 내역 발견:");
      console.log(`- 주문명: ${payment.order_name}`);
      console.log(`- 금액: ${payment.amount} ${payment.currency}`);
      console.log(`- 상태: ${payment.status}`);
      console.log(`- 결제일: ${payment.paid_at}`);
      console.log(`- 결제ID: ${payment.payment_id}`);
      console.log(`- 영수증: ${payment.receipt_url}`);
    } else {
      console.log("❌ 결제 내역이 없습니다.");
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
