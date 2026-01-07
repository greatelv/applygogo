const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv").config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  console.log(
    "Connecting to:",
    connectionString ? "String present" : "MISSING"
  );

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const usersCount = await prisma.user.count();
    console.log("Users count:", usersCount);
  } catch (e) {
    console.error("Connection failed:", e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
