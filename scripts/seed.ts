import Pkg from "@prisma/client";
const { PrismaClient, PlanCode } = Pkg;

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Plans...");

  const plans = [
    {
      code: PlanCode.FREE,
      monthlyQuota: 3.0,
      maxResumes: 1,
    },
    {
      code: PlanCode.PRO,
      monthlyQuota: 100.0,
      maxResumes: -1, // Unlimited
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
    console.log(`  - Upserted plan: ${plan.code}`);
  }

  console.log("✅ Seeding completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
