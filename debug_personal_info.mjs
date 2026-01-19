import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const resumeId = "bb3a4840-1549-4325-b856-d1b67ac2499a";

  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    select: {
      id: true,
      name_source: true,
      name_target: true,
      email: true,
      phone: true,
      links: true,
      summary_source: true,
      summary_target: true,
    },
  });

  console.log("=== Resume Personal Info ===");
  console.log(JSON.stringify(resume, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
