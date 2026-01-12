import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function setTestCredits() {
  const email = "greatelv@gmail.com";
  await prisma.user.update({
    where: { email },
    data: { credits: 10 },
  });
  console.log("Credits successfully set to 10 for testing.");
}

setTestCredits()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
