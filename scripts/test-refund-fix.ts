import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

console.log("🔌 Connecting to DB...");
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Starting Refund Logic Verification...");

  // 1. Setup Test User & Payment
  const testEmail = `test-refund-${Date.now()}@example.com`;

  // Clean up if exists (unlikely with timestamp)

  const user = await prisma.user.create({
    data: {
      email: testEmail,
      credits: 50, // User has 50 credits total
    },
  });

  const paymentId = `pay_${Date.now()}`;
  const payment = await prisma.paymentHistory.create({
    data: {
      userId: user.id,
      paymentId: paymentId,
      orderName: "10 Credit Pack",
      amount: 1000,
      currency: "KRW",
      status: "PAID",
      initialCredits: 10,
      remainingCredits: 10, // Full
      paidAt: new Date(),
    },
  });

  console.log(`✅ Created Test User (${user.id}) & Payment (${payment.id})`);

  // ====================================================
  // TEST CASE 1: Refund Blocked if Credits Used
  // ====================================================
  console.log("\n🧪 [Test 1] Verifying Refund Block on Used Credits...");

  // Simulate usage: remaining 9 < initial 10
  await prisma.paymentHistory.update({
    where: { id: payment.id },
    data: { remainingCredits: 9 },
  });

  // Execute Logic (replicated from route)
  let blocked = false;
  try {
    const target = await prisma.paymentHistory.findUnique({
      where: { id: payment.id },
    });
    const initial = Number(target?.initialCredits);
    const remaining = Number(target?.remainingCredits);

    if (remaining < initial) {
      throw new Error(
        "Refund is not possible if any of the credits from this payment have been used."
      );
    }
  } catch (e: any) {
    if (e.message.includes("Refund is not possible")) {
      console.log(
        "   ✅ Success: Refund was correctly blocked because credits were used."
      );
      blocked = true;
    } else {
      console.log("   ⚠️ Unexpected error during block test:", e.message);
    }
  }

  if (!blocked) {
    console.error("   ❌ Failed: Refund should have been blocked!");
    process.exit(1);
  }

  // ====================================================
  // TEST CASE 2: Refund Allowed & Revocation
  // ====================================================
  console.log("\n🧪 [Test 2] Verifying Credit Revocation on Valid Refund...");

  // Reset failure state
  await prisma.paymentHistory.update({
    where: { id: payment.id },
    data: { remainingCredits: 10 }, // Full again
  });

  // Current User Credits
  const beforeUser = await prisma.user.findUnique({ where: { id: user.id } });
  console.log(`   User Credits Before Refund: ${beforeUser?.credits}`);

  // Execute Logic (Transaction)
  await prisma.$transaction(async (tx) => {
    const p = await tx.paymentHistory.findUnique({ where: { id: payment.id } });
    if (!p) throw new Error("Payment not found");
    const currentInitial = Number(p.initialCredits);

    // Deduct from User
    await tx.user.update({
      where: { id: user.id },
      data: {
        credits: { decrement: currentInitial },
      },
    });

    // Update Payment
    await tx.paymentHistory.update({
      where: { id: payment.id },
      data: { status: "REFUNDED", remainingCredits: 0 },
    });
  });

  const afterUser = await prisma.user.findUnique({ where: { id: user.id } });
  const afterPayment = await prisma.paymentHistory.findUnique({
    where: { id: payment.id },
  });

  console.log(`   User Credits After Refund: ${afterUser?.credits}`);
  console.log(`   Payment Status: ${afterPayment?.status}`);

  // Expect 50 -> 40
  const expectedCredits = (beforeUser?.credits || 0) - 10;

  if (afterUser?.credits === expectedCredits) {
    console.log(
      `   ✅ Success: Credits were correctly revoked (Expected: ${expectedCredits}, Actual: ${afterUser?.credits}).`
    );
  } else {
    console.error(
      `   ❌ Failed: Credit deduction calculation is wrong. Expected ${expectedCredits}, got ${afterUser?.credits}`
    );
    process.exit(1);
  }

  // Cleanup
  console.log("\n🧹 Cleaning up test data...");
  await prisma.paymentHistory.delete({ where: { id: payment.id } });
  await prisma.user.delete({ where: { id: user.id } });

  console.log("✅ Verification Complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
