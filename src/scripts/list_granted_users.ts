import "dotenv/config";
import { prisma } from "../lib/prisma.js";

async function main() {
  const BENEFIT_START_DATE = new Date("2026-01-18T00:00:00+09:00");

  const grantedUsers = await prisma.user.findMany({
    where: {
      plan_type: "PASS_BETA_3DAY",
      created_at: {
        gte: BENEFIT_START_DATE,
      },
    },
    select: {
      email: true,
      name: true,
      plan_expires_at: true,
      created_at: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  console.log(`[Granted Users Count]: ${grantedUsers.length}`);
  grantedUsers.forEach((u, i) => {
    console.log(
      `${i + 1}. ${u.email} (${u.name || "N/A"}) | Joined: ${u.created_at.toISOString()} | Expires: ${u.plan_expires_at?.toISOString()}`,
    );
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
