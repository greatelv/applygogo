import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env') });
config({ path: path.resolve(process.cwd(), '.env.local') });

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { grantPass } from "../lib/billing";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL is required in .env");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * 2026-02-08 23:59:59 이후 가입자 중 혜택을 받지 못한(FREE) 유저들에게
 * 3일 무제한 이용권을 소급 지급하는 스크립트입니다.
 */
async function main() {
  console.log("Searching for users who missed the beta benefit...");

  // 1. 대상 유저 찾기 (2월 8일 이후 가입자 중 FREE 플랜인 유저)
  const missedUsers = await prisma.user.findMany({
    where: {
      created_at: {
        gt: new Date("2026-02-08T23:59:59+09:00"),
      },
      plan_type: "FREE",
    },
  });

  console.log(`Found ${missedUsers.length} users to backfill.`);

  if (missedUsers.length === 0) {
    console.log("No users found. Exiting.");
    return;
  }

  // 2. 이용권 지급 (순차 처리)
  let successCount = 0;
  let failCount = 0;

  for (const user of missedUsers) {
    try {
      console.log(`Granting pass to ${user.email} (${user.id})...`);
      
      // PASS_BETA_3DAY 지급
      await grantPass(user.id, "PASS_BETA_3DAY", prisma);
      
      successCount++;
    } catch (error) {
      console.error(`Failed to grant pass to ${user.id}:`, error);
      failCount++;
    }
  }

  console.log("------------------------------------------------");
  console.log(`Backfill completed.`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
