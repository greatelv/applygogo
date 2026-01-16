import { config } from "dotenv";
// Load .env first
config({ path: ".env" });
// Load .env.kr as fallback or override depending on need (ApplyGoGo seems to use .env.kr for local dev maybe?)
config({ path: ".env.kr" });

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DIRECT_URL and DATABASE_URL are missing.");
    process.exit(1);
  }

  console.log("Connecting to DB..."); // URL 자체는 로깅하지 않음

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const email = "patakeique@gmail.com";
  console.log(`Revoking plan for user: ${email}...`);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`User with email ${email} not found.`);
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        planType: "FREE",
        planExpiresAt: null,
      },
    });

    console.log(`Successfully revoked plan for user: ${updatedUser.email}`);
    console.log(
      `Current Plan: ${updatedUser.planType}, ExpiresAt: ${updatedUser.planExpiresAt}`
    );
  } catch (e) {
    console.error("Error updating user:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
