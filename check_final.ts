import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const email = "greatelv@gmail.com";
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      payment_histories: {
        orderBy: { paid_at: "desc" },
      },
    },
  });

  console.log(
    "Current User Status:",
    JSON.stringify(
      {
        id: user?.id,
        email: user?.email,
        planType: user?.plan_type,
        credits: user?.credits,
        planExpiresAt: user?.plan_expires_at,
      },
      null,
      2,
    ),
  );

  console.log(
    "Payment Histories (last 5):",
    JSON.stringify(user?.payment_histories.slice(0, 5), null, 2),
  );
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
