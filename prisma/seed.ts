import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. FREE Plan
  const freePlan = await prisma.plan.upsert({
    where: { code: "FREE" },
    update: {},
    create: {
      code: "FREE",
      monthlyQuota: 3.0,
      maxResumes: 1, // Limited to 1 active resume
    },
  });

  // 2. PRO Plan
  const proPlan = await prisma.plan.upsert({
    where: { code: "PRO" },
    update: {},
    create: {
      code: "PRO",
      monthlyQuota: 100.0, // Effectively unlimited
      maxResumes: -1, // Unlimited
    },
  });

  console.log({ freePlan, proPlan });
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
