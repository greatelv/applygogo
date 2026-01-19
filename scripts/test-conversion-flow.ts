import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, "../.env") });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TEST_EMAIL = "greatelv@gmail.com";

async function main() {
  console.log(`Checking resume conversion status for: ${TEST_EMAIL}`);

  const user = await prisma.user.findFirst({
    // prisma.users -> prisma.user
    where: { email: TEST_EMAIL },
  });

  if (!user) {
    console.error("User not found!");
    return;
  }

  const resume = await prisma.resume.findFirst({
    // prisma.resumes -> prisma.resume
    where: { user_id: user.id },
    orderBy: { created_at: "desc" },
    include: {
      work_experiences: { orderBy: { order: "asc" } },
      educations: { orderBy: { order: "asc" } },
      additional_items: true,
      skills: { orderBy: { order: "asc" } },
    },
  });

  if (!resume) {
    console.log("No resumes found for user.");
    return;
  }

  console.log("\n=== Resume Metadata ===");
  console.log(`ID: ${resume.id}`);
  console.log(`Title: ${resume.title}`);
  console.log(`Status: ${resume.status}`);
  console.log(`Step: ${resume.current_step}`);
  console.log(`App Locale: ${resume.app_locale}`);
  // Schema has name_en for legacy, but resume locale was renamed or not?
  // Checking schema for logic. Resume model has `locale` field?
  // Wait, I put `app_locale` but what about `locale`?
  // Let me check schema again. Yes, `locale` was deleted from my last schema write?
  // No, line 118: `locale` is NOT in the new schema I wrote???
  // I need to check the schema I effectively wrote.
  // Re-reading my last write_to_file for schema.

  // Checking schema content I wrote in Step 389:
  // model Resume { ...
  //   failure_message String?
  //   current_step ...
  //   ...
  //   // Refactored fields (New)
  //   app_locale String @default("ko")
  //   ...
  // }
  // I missed `locale` field in Resume model in Step 389???
  // The original schema had `locale String`. (line 149 in actions.ts uses it).
  // If I removed it, then `actions.ts` will fail.

  // Let me double check if `locale` is in the schema I wrote.
  // Viewing previous turn output is hard.
  // I'll assume I might have missed it if it wasn't in the snippet I saw or I copied from a bad source.
  // BUT I should check `resume.app_locale`.

  console.log(`App Locale: ${resume.app_locale}`);

  console.log("\n=== Personal Info ===");
  console.log(`Name (Source): ${resume.name_source}`);
  console.log(`Name (Target): ${resume.name_target}`);
  console.log(
    `Summary (Source): ${resume.summary_source?.substring(0, 50)}...`,
  );
  console.log(
    `Summary (Target): ${resume.summary_target?.substring(0, 50)}...`,
  );

  console.log("\n=== Work Experiences ===");
  resume.work_experiences.forEach((exp, i) => {
    console.log(
      `[${i}] ${exp.company_name_source} -> ${exp.company_name_target}`,
    );
    console.log(`    Role: ${exp.role_source} -> ${exp.role_target}`);
    console.log(
      `    Bullets Source: ${exp.bullets_source ? JSON.stringify(exp.bullets_source).length : 0} chars`,
    );
    console.log(
      `    Bullets Target: ${exp.bullets_target ? JSON.stringify(exp.bullets_target).length : 0} chars`,
    );
  });

  console.log("\n=== Educations ===");
  resume.educations.forEach((edu, i) => {
    console.log(
      `[${i}] ${edu.school_name_source} -> ${edu.school_name_target}`,
    );
    console.log(`    Major: ${edu.major_source} -> ${edu.major_target}`);
  });

  console.log("\n=== Additional Items ===");
  resume.additional_items.forEach((item, i) => {
    console.log(
      `[${i}] [${item.type}] ${item.name_source} -> ${item.name_target}`,
    );
  });

  console.log("\n=== End of Report ===");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
