const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const resumeId = "d036287c-aa31-4823-96ba-2e9e57c206b1";
  const experiences = await prisma.workExperience.findMany({
    where: { resume_id: resumeId },
    orderBy: { order: "asc" },
  });
  console.log(JSON.stringify(experiences, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
