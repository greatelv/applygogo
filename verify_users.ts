import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
  const targetEmails = ["zzanglug7@dreamwiz.com", "sos6152@naver.com"];

  console.log("Verifying user status for:", targetEmails);

  const users = await prisma.user.findMany({
    where: {
      email: { in: targetEmails },
    },
    select: {
      email: true,
      plan_type: true,
      plan_expires_at: true,
      credits: true,
    },
  });

  users.forEach((user) => {
    console.log(`[VERIFY] User: ${user.email}`);
    console.log(`  - Plan Type: ${user.plan_type}`);
    console.log(`  - Expires At: ${user.plan_expires_at}`);
    console.log(`  - Credits: ${user.credits}`);
    console.log("---");
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
