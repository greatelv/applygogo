import { prisma } from "../src/lib/prisma";

async function main() {
  const startOfDayKST = new Date("2026-01-18T15:00:00Z"); // Approx start of "Today" KST

  console.log(
    `Starting migration for resumes created after: ${startOfDayKST.toISOString()}`,
  );

  const resumes = await prisma.resume.findMany({
    where: {
      created_at: {
        gte: startOfDayKST,
      },
    },
    include: {
      work_experiences: true,
      educations: true,
      additional_items: true,
      skills: true,
    },
  });

  console.log(`Found ${resumes.length} resumes to process.`);

  let updatedCount = 0;

  for (const resume of resumes) {
    // 1. Update Resume Fields
    const resumeUpdateData: any = {};
    let needsUpdate = false;

    // name
    if (resume.name_kr && (!resume.name_source || resume.name_source === "")) {
      resumeUpdateData.name_source = resume.name_kr;
      needsUpdate = true;
    }
    if (
      resume.name_en &&
      (!resume.name_target ||
        resume.name_target === "null" ||
        resume.name_target === "")
    ) {
      resumeUpdateData.name_target = resume.name_en;
      needsUpdate = true;
    }

    // summary
    // Logic: summary_kr -> summary_source, summary -> summary_target
    if (
      resume.summary_kr &&
      (!resume.summary_source || resume.summary_source === "")
    ) {
      resumeUpdateData.summary_source = resume.summary_kr;
      needsUpdate = true;
    }
    if (
      resume.summary &&
      (!resume.summary_target || resume.summary_target === "")
    ) {
      resumeUpdateData.summary_target = resume.summary;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.resume.update({
        where: { id: resume.id },
        data: resumeUpdateData,
      });
      console.log(`Updated Resume(${resume.id}) fields.`);
    }

    // 2. Update WorkExperience
    for (const we of resume.work_experiences) {
      const weUpdate: any = {};
      let weNeedsUpdate = false;

      // Company
      if (
        we.company_name_kr &&
        (!we.company_name_source || we.company_name_source === "")
      ) {
        weUpdate.company_name_source = we.company_name_kr;
        weNeedsUpdate = true;
      }
      if (
        we.company_name_en &&
        (!we.company_name_target || we.company_name_target === "")
      ) {
        weUpdate.company_name_target = we.company_name_en;
        weNeedsUpdate = true;
      }

      // Role
      if (we.role_kr && (!we.role_source || we.role_source === "")) {
        weUpdate.role_source = we.role_kr;
        weNeedsUpdate = true;
      }
      if (we.role_en && (!we.role_target || we.role_target === "")) {
        weUpdate.role_target = we.role_en;
        weNeedsUpdate = true;
      }

      // Bullets
      // Note: Checking for null/undefined specifically for JSON fields can be tricky if they are just empty arrays []
      // Assuming if legacy has value and source is null/undefined, we copy.
      if (
        we.bullets_kr &&
        (we.bullets_source === null || we.bullets_source === undefined)
      ) {
        weUpdate.bullets_source = we.bullets_kr;
        weNeedsUpdate = true;
      }
      if (
        we.bullets_en &&
        (we.bullets_target === null || we.bullets_target === undefined)
      ) {
        weUpdate.bullets_target = we.bullets_en;
        weNeedsUpdate = true;
      }

      if (weNeedsUpdate) {
        await prisma.workExperience.update({
          where: { id: we.id },
          data: weUpdate,
        });
        // console.log(`Updated WorkExperience(${we.id})`); // Verbose
      }
    }

    // 3. Update Education
    for (const edu of resume.educations) {
      const eduUpdate: any = {};
      let eduNeedsUpdate = false;

      // School
      if (
        edu.school_name &&
        (!edu.school_name_source || edu.school_name_source === "")
      ) {
        eduUpdate.school_name_source = edu.school_name;
        eduNeedsUpdate = true;
      }
      if (
        edu.school_name_en &&
        (!edu.school_name_target || edu.school_name_target === "")
      ) {
        eduUpdate.school_name_target = edu.school_name_en;
        eduNeedsUpdate = true;
      }

      // Major
      if (edu.major && (!edu.major_source || edu.major_source === "")) {
        eduUpdate.major_source = edu.major;
        eduNeedsUpdate = true;
      }
      if (edu.major_en && (!edu.major_target || edu.major_target === "")) {
        eduUpdate.major_target = edu.major_en;
        eduNeedsUpdate = true;
      }

      // Degree
      if (edu.degree && (!edu.degree_source || edu.degree_source === "")) {
        eduUpdate.degree_source = edu.degree;
        eduNeedsUpdate = true;
      }
      if (edu.degree_en && (!edu.degree_target || edu.degree_target === "")) {
        eduUpdate.degree_target = edu.degree_en;
        eduNeedsUpdate = true;
      }

      if (eduNeedsUpdate) {
        await prisma.education.update({
          where: { id: edu.id },
          data: eduUpdate,
        });
      }
    }

    // 4. Additional Items
    for (const item of resume.additional_items) {
      const itemUpdate: any = {};
      let itemNeedsUpdate = false;

      if (item.name_kr && (!item.name_source || item.name_source === "")) {
        itemUpdate.name_source = item.name_kr;
        itemNeedsUpdate = true;
      }
      if (item.name_en && (!item.name_target || item.name_target === "")) {
        itemUpdate.name_target = item.name_en;
        itemNeedsUpdate = true;
      }

      if (
        item.description_kr &&
        (!item.description_source || item.description_source === "")
      ) {
        itemUpdate.description_source = item.description_kr;
        itemNeedsUpdate = true;
      }

      if (
        item.description_en &&
        (!item.description_target || item.description_target === "")
      ) {
        itemUpdate.description_target = item.description_en;
        itemNeedsUpdate = true;
      }

      if (itemNeedsUpdate) {
        await prisma.additionalItem.update({
          where: { id: item.id },
          data: itemUpdate,
        });
      }
    }

    // 5. Skills (just in case, though they usually have only 'name')
    for (const skill of resume.skills) {
      const skillUpdate: any = {};
      let skillNeedsUpdate = false;

      // Skills usually just have 'name'. Schema likely implies name -> name_source/target logic?
      // Schema check: Skills has name, name_source, name_target.
      if (skill.name && (!skill.name_source || skill.name_source === "")) {
        skillUpdate.name_source = skill.name;
        skillNeedsUpdate = true;
      }
      // Assuming name is the source generally.

      if (skillNeedsUpdate) {
        await prisma.skill.update({
          where: { id: skill.id },
          data: skillUpdate,
        });
      }
    }

    updatedCount++;
  }

  console.log(`Migration completed. Processed ${updatedCount} resumes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
