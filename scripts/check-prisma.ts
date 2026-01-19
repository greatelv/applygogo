import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Prisma Client Keys:", Object.keys(prisma));
  // @ts-ignore
  if (prisma.resume) console.log("prisma.resume exists");
  // @ts-ignore
  if (prisma.resumes) console.log("prisma.resumes exists");

  // @ts-ignore
  if (prisma.workExperience) console.log("prisma.workExperience exists");
  // @ts-ignore
  if (prisma.workExperiences) console.log("prisma.workExperiences exists");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
