import { prisma } from "../src/lib/prisma";

async function main() {
  // 1. Identify "Today" in Korea (UTC+9)
  // Current time is roughly 2026-01-19 17:25 KST.
  // Start of day KST (00:00) is 2026-01-18 15:00:00 UTC.
  const startOfDayKST = new Date("2026-01-18T15:00:00Z");

  console.log(
    `Checking data created after (UTC): ${startOfDayKST.toISOString()}`,
  );

  // 2. Fetch Resumes created today
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
    },
  });

  console.log(`Found ${resumes.length} resumes created today.`);

  const discrepancies: any[] = [];

  for (const resume of resumes) {
    const resumeErrors: string[] = [];

    // --- Check Resume Fields ---
    // Mapping Assumption: _kr -> _source, _en -> _target
    // Also check 'summary' (legacy) vs 'summary_target' or 'summary_source'?
    // Schema has 'summary' and 'summary_kr'. 'summary_kr' -> 'summary_source'. 'summary' (often EN result) -> 'summary_target'.

    // name_kr -> name_source
    if (resume.name_kr && resume.name_kr !== resume.name_source) {
      resumeErrors.push(
        `Resume.name_kr ('${resume.name_kr}') != name_source ('${resume.name_source}')`,
      );
    }
    // name_en -> name_target
    if (resume.name_en && resume.name_en !== resume.name_target) {
      resumeErrors.push(
        `Resume.name_en ('${resume.name_en}') != name_target ('${resume.name_target}')`,
      );
    }

    // summary_kr -> summary_source
    if (resume.summary_kr && resume.summary_kr !== resume.summary_source) {
      resumeErrors.push(`Resume.summary_kr != summary_source`);
    }
    // summary -> summary_target (Assuming older 'summary' was the target equivalent, usually EN)
    // Note: summary might be empty if not generated yet.
    if (resume.summary && resume.summary !== resume.summary_target) {
      // Sometimes summary is same as target, sometimes slightly different?
      // Strict check:
      resumeErrors.push(`Resume.summary != summary_target`);
    }

    // --- Check WorkExperience Fields ---
    for (const we of resume.work_experiences) {
      // company_name_kr -> company_name_source
      if (we.company_name_kr && we.company_name_kr !== we.company_name_source) {
        resumeErrors.push(
          `WorkExperience(${we.id}).company_name_kr != company_name_source`,
        );
      }
      // company_name_en -> company_name_target
      if (we.company_name_en && we.company_name_en !== we.company_name_target) {
        resumeErrors.push(
          `WorkExperience(${we.id}).company_name_en != company_name_target`,
        );
      }

      // role_kr -> role_source
      if (we.role_kr && we.role_kr !== we.role_source) {
        resumeErrors.push(`WorkExperience(${we.id}).role_kr != role_source`);
      }
      // role_en -> role_target
      if (we.role_en && we.role_en !== we.role_target) {
        resumeErrors.push(`WorkExperience(${we.id}).role_en != role_target`);
      }

      // bullets_kr -> bullets_source
      if (we.bullets_kr) {
        if (
          JSON.stringify(we.bullets_kr) !== JSON.stringify(we.bullets_source)
        ) {
          // Sometimes formatting differs? Checking strict equality first.
          resumeErrors.push(
            `WorkExperience(${we.id}).bullets_kr != bullets_source`,
          );
        }
      }
      // bullets_en -> bullets_target
      if (we.bullets_en) {
        if (
          JSON.stringify(we.bullets_en) !== JSON.stringify(we.bullets_target)
        ) {
          resumeErrors.push(
            `WorkExperience(${we.id}).bullets_en != bullets_target`,
          );
        }
      }
    }

    // --- Check Education Fields ---
    // Legacy: school_name, school_name_en
    for (const edu of resume.educations) {
      // school_name -> school_name_source
      if (edu.school_name && edu.school_name !== edu.school_name_source) {
        resumeErrors.push(
          `Education(${edu.id}).school_name != school_name_source`,
        );
      }
      // school_name_en -> school_name_target
      if (edu.school_name_en && edu.school_name_en !== edu.school_name_target) {
        resumeErrors.push(
          `Education(${edu.id}).school_name_en != school_name_target`,
        );
      }

      // major -> major_source
      if (edu.major && edu.major !== edu.major_source) {
        resumeErrors.push(`Education(${edu.id}).major != major_source`);
      }
      // major_en -> major_target
      if (edu.major_en && edu.major_en !== edu.major_target) {
        resumeErrors.push(`Education(${edu.id}).major_en != major_target`);
      }

      // degree -> degree_source
      if (edu.degree && edu.degree !== edu.degree_source) {
        resumeErrors.push(`Education(${edu.id}).degree != degree_source`);
      }
      // degree_en -> degree_target
      if (edu.degree_en && edu.degree_en !== edu.degree_target) {
        resumeErrors.push(`Education(${edu.id}).degree_en != degree_target`);
      }
    }

    // --- Check AdditionalItem Fields ---
    for (const item of resume.additional_items) {
      // name_kr -> name_source
      if (item.name_kr && item.name_kr !== item.name_source) {
        resumeErrors.push(`AdditionalItem(${item.id}).name_kr != name_source`);
      }
      // name_en -> name_target
      if (item.name_en && item.name_en !== item.name_target) {
        resumeErrors.push(`AdditionalItem(${item.id}).name_en != name_target`);
      }
      // description_kr -> description_source
      if (
        item.description_kr &&
        item.description_kr !== item.description_source
      ) {
        resumeErrors.push(
          `AdditionalItem(${item.id}).description_kr != description_source`,
        );
      }
      // description_en -> description_target
      if (
        item.description_en &&
        item.description_en !== item.description_target
      ) {
        resumeErrors.push(
          `AdditionalItem(${item.id}).description_en != description_target`,
        );
      }
    }

    if (resumeErrors.length > 0) {
      discrepancies.push({
        resumeId: resume.id,
        title: resume.title,
        status: resume.status,
        createdAt: resume.created_at,
        errors: resumeErrors,
      });
    }
  }

  console.log("---------------------------------------------------");
  console.log(`Found ${discrepancies.length} resumes with data discrepancies.`);
  console.log("---------------------------------------------------");

  if (discrepancies.length > 0) {
    console.log(JSON.stringify(discrepancies, null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
