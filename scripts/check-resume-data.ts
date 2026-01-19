import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkResumeData(resumeId: string) {
  try {
    const resume = await (prisma as any).resume.findUnique({
      where: { id: resumeId },
      include: {
        work_experiences: true,
        educations: true,
        skills: true,
        additional_items: true,
        user: true,
      },
    });

    if (!resume) {
      console.log(`Resume with ID ${resumeId} not found.`);
      return;
    }

    const r = resume as any;

    console.log("Resume Basic Info:");
    console.log(
      JSON.stringify(
        {
          id: r.id,
          title: r.title,
          name_source: r.name_source,
          name_target: r.name_target,
          summary_source: r.summary_source,
          summary_target: r.summary_target,
          target_role: r.target_role,
          user_id: r.user_id,
          user_email: r.user?.email,
        },
        null,
        2,
      ),
    );

    /*
    console.log("\nWork Experiences:");
    ... (omitted)
    */
  } catch (error) {
    console.error("Error checking resume data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check with the ID provided by the user
checkResumeData("2430d40f-3833-4a49-9793-375a0bd8a875");
