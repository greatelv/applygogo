import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import { grantPass } from "../src/lib/billing";

dotenv.config();

const connectionString = process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function applyMissedBenefits() {
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const todayStart = new Date(new Date("2026-01-18T00:00:00+09:00"));

  console.log(`Checking users joined after: ${todayStart.toISOString()}`);

  const users = await prisma.user.findMany({
    where: {
      created_at: {
        gte: todayStart,
      },
      planType: "FREE",
    },
  });

  if (users.length === 0) {
    console.log("No missed users found.");
    return;
  }

  console.log(`Applying benefits to ${users.length} users...`);

  for (const user of users) {
    try {
      // grantPass(userId, passType, prismaClient)
      await grantPass(user.id, "PASS_BETA_3DAY", prisma);
      console.log(`✅ Successfully granted benefit to: ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to grant benefit to ${user.email}:`, error);
    }
  }

  await prisma.$disconnect();
  console.log("Finished applying missed benefits.");
}

applyMissedBenefits();
