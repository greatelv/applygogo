import "dotenv/config";
import { prisma } from "../lib/prisma.js";

async function main() {
  const BENEFIT_START_DATE = new Date("2026-01-18T00:00:00+09:00");

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
      created_at: true,
    },
  });

  console.log(`[Target Users Count]: ${targetUsers.length}`);
  targetUsers.forEach((u) => {
    console.log(`- ${u.email} (Joined: ${u.created_at.toISOString()})`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
