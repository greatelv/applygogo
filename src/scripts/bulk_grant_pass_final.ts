import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { grantPass } from "../lib/billing.js";

async function main() {
  const BENEFIT_START_DATE = new Date("2026-01-18T00:00:00+09:00");

  console.log("Starting bulk grant for PASS_BETA_3DAY...");

  const targetUsers = await prisma.user.findMany({
    where: {
      created_at: {
        gte: BENEFIT_START_DATE,
      },
      plan_type: "FREE",
    },
    select: {
      id: true,
      email: true,
    },
  });

  console.log(`[Total Target Users]: ${targetUsers.length}`);

  for (const user of targetUsers) {
    try {
      console.log(`Granting pass to: ${user.email} (${user.id})`);
      await grantPass(user.id, "PASS_BETA_3DAY", prisma);
    } catch (error) {
      console.error(`Failed to grant pass to ${user.email}:`, error);
    }
  }

  console.log("Bulk grant completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
