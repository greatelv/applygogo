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

console.log(
  "Connecting to DB with connection string length:",
  connectionString?.length,
);

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const targetEmails = [
  "greatelv@gmail.com",
  "greatelv@naver.com",
  "wjswjs2@gmail.com",
  "patakeique@gmail.com",
];

async function main() {
  console.log("Starting resume deletion for emails:", targetEmails);

  const users = await prisma.users.findMany({
    where: {
      email: {
        in: targetEmails,
      },
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (users.length === 0) {
    console.log("No users found with these emails.");
    return;
  }

  console.log(
    `Found ${users.length} users:`,
    users.map((u) => u.email),
  );

  const userIds = users.map((u) => u.id);

  // Delete resumes for these users.
  // Due to onDelete: Cascade in schema, this should delete related items (Education, WorkExperience, etc.)
  const result = await prisma.resumes.deleteMany({
    where: {
      user_id: {
        in: userIds,
      },
    },
  });

  console.log(`Deleted ${result.count} resumes.`);
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
