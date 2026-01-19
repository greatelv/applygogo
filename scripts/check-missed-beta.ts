import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkMissedUsers() {
  const today = new Date("2026-01-18T00:00:00+09:00");

  const users = await prisma.user.findMany({
    where: {
      created_at: {
        gte: today,
      },
      plan_type: "FREE",
    },
    select: {
      id: true,
      email: true,
      created_at: true,
    },
  });

  console.log(
    `Found ${users.length} users who joined today and are on FREE plan.`,
  );
  users.forEach((u) =>
    console.log(`- ${u.email} (Joined: ${u.created_at.toISOString()})`),
  );

  await prisma.$disconnect();
}

checkMissedUsers();
