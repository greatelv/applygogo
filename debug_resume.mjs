import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const resumeId = "d036287c-aa31-4823-96ba-2e9e57c206b1";

  // Resume 정보
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    select: {
      id: true,
      status: true,
      current_step: true,
      title: true,
      app_locale: true,
      name_source: true,
      name_target: true,
    },
  });

  console.log("=== Resume Info ===");
  console.log(JSON.stringify(resume, null, 2));

  // Work Experiences 개수
  const workExpCount = await prisma.workExperience.count({
    where: { resume_id: resumeId },
  });

  console.log("\n=== Work Experiences Count ===");
  console.log(workExpCount);

  // Educations 개수
  const eduCount = await prisma.education.count({
    where: { resume_id: resumeId },
  });

  console.log("\n=== Education Count ===");
  console.log(eduCount);

  // Skills 개수
  const skillCount = await prisma.skill.count({
    where: { resume_id: resumeId },
  });

  console.log("\n=== Skills Count ===");
  console.log(skillCount);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
