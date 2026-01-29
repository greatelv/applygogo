import "dotenv/config";
import { prisma } from "../lib/prisma";
import { grantPass } from "../lib/billing";

async function main() {
  const url = process.env.DATABASE_URL;
  console.log(
    "DB URL loaded:",
    url ? url.substring(0, 20) + "..." : "UNDEFINED",
  );
  const email = "greatelv@gmail.com";
  console.log(`Finding user with email: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error("User not found!");
    process.exit(1);
  }

  console.log(
    `Found user: ${user.id} (${user.name}). Granting PASS_BETA_3DAY...`,
  );

  // 강제 지급 (기존 로직 활용)
  await grantPass(user.id, "PASS_BETA_3DAY", prisma);

  console.log("Successfully granted PASS_BETA_3DAY.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
