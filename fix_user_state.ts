import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fix() {
  const email = "greatelv@gmail.com";

  // 1. 유저 조회
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("User not found");
    return;
  }

  console.log(
    `Target User: ${user.email} (Current Credits: ${user.credits}, Plan: ${user.planType})`
  );

  try {
    // 2. 미처 회수되지 않은 결제 내역들의 상태를 REFUNDED로 강제 동기화
    const updatedHistory = await prisma.$executeRawUnsafe(
      `
      UPDATE payment_histories 
      SET status = 'REFUNDED', remaining_credits = 0 
      WHERE user_id = $1 AND status = 'PAID'
    `,
      user.id
    );

    console.log(
      `Updated ${updatedHistory} payment history records to REFUNDED.`
    );

    // 3. 유저 권한 및 크레딧 회수 (결제 2건분 = 100 크레딧 회수 및 플랜 초기화)
    // 현재 100이시니 0으로 만들고 플랜을 FREE로 바꿉니다.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        planType: "FREE",
        planExpiresAt: null,
        credits: 0, // 혹은 상황에 맞게 차감. 현재 100인 것이 모두 환불 대상이므로 0으로 설정
      },
    });

    console.log("Successfully revoked credits and reset plan to FREE.");
  } catch (e) {
    console.error("Fix failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

fix();
