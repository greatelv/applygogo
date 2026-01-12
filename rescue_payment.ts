import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function rescue() {
  const paymentId = "payment-1768208754417-78s4m6vzl";
  const email = "greatelv@gmail.com";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("User not found");
    return;
  }

  console.log(`Rescuing payment ${paymentId} for user ${user.id}`);

  try {
    // Insert into payment_histories
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO payment_histories (
        id, user_id, payment_id, order_name, amount, currency, status, method, 
        paid_at, receipt_url, initial_credits, remaining_credits, details
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 
        NOW(), $9, $10, $11, $12
      )
    `,
      `rescued_${paymentId}`,
      user.id,
      paymentId,
      "ApplyGoGo 7일 이용권",
      9900,
      "KRW",
      "PAID",
      "card",
      "https://pay.toss.im/payfront/web/external/sales-check?payToken=N4e1SqREpXysq8mdBZQe06&transactionId=d8ca61b7-7daf-4702-9469-d8b11f1aa63a",
      50,
      50,
      JSON.stringify({ rescued: true })
    );

    console.log("Successfully inserted payment record.");

    // Also update user's plan and credits since they paid but the transaction rolled back
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        planType: "PASS_7DAY",
        planExpiresAt: expiresAt,
        credits: {
          increment: 50,
        },
      },
    });

    console.log("Successfully updated user plan and credits.");
  } catch (e) {
    console.error("Rescue failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

rescue();
