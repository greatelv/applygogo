import { prisma } from "../src/lib/prisma";

async function main() {
  console.log(
    "Checking for resumes where 'summary' exists but 'summary_target' is missing...",
  );

  // Fetch all resumes where summary has content
  const resumes = await prisma.resume.findMany({
    where: {
      AND: [{ summary: { not: null } }, { summary: { not: "" } }],
    },
    select: {
      id: true,
      summary: true,
      summary_target: true,
      created_at: true,
    },
  });

  const targetsToUpdate = resumes.filter(
    (r) => !r.summary_target || r.summary_target.trim() === "",
  );

  console.log(`Total resumes with summary: ${resumes.length}`);
  console.log(`Resumes missing summary_target: ${targetsToUpdate.length}`);

  if (targetsToUpdate.length === 0) {
    console.log("No resumes need updating.");
    return;
  }

  console.log("Starting update...");
  let updatedCount = 0;

  for (const resume of targetsToUpdate) {
    await prisma.resume.update({
      where: { id: resume.id },
      data: {
        summary_target: resume.summary,
      },
    });
    updatedCount++;
    if (updatedCount % 10 === 0) {
      process.stdout.write(
        `\rUpdated ${updatedCount}/${targetsToUpdate.length} resumes...`,
      );
    }
  }

  console.log(
    `\nMigration completed. Successfully copied 'summary' to 'summary_target' for ${updatedCount} resumes.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
