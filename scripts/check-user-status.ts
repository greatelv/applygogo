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

async function main() {
  const email = "greatelv@gmail.com";
  console.log(`Checking status for user: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      credits: true,
      plan_type: true,
      plan_expires_at: true,
      created_at: true,
    },
  });

  if (!user) {
    console.log("User not found.");
    return;
  }

  console.log("User Status (Before):");
  console.log(JSON.stringify(user, null, 2));

  // Grant credits and plan for testing
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(now.getMonth() + 1);

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      credits: 500,
      plan_type: "PASS_BETA_3DAY",
      plan_expires_at: nextMonth,
    },
  });

  console.log("User Status (After Update):");
  console.log(JSON.stringify(updatedUser, null, 2));

  // Check billing logic simulation
  // Note: The following billing logic now uses the 'updatedUser' for consistency.
  console.log(`Current Time: ${now.toISOString()}`);

  if (updatedUser.plan_expires_at) {
    console.log(
      `Plan Expires At: ${updatedUser.plan_expires_at.toISOString()}`,
    );
    console.log(`Is Expired? ${updatedUser.plan_expires_at <= now}`);
  } else {
    console.log("Plan Expires At: null");
  }
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
