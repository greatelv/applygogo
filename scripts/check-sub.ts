import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "patakeique@gmail.com";
  const user = await prisma.user.findUnique({
    where: { email },
    include: { subscription: true },
  });

  if (!user) {
    console.log(`User with email ${email} not found.`);
  } else {
    console.log("User found:", user.id);
    console.log("Subscription:", user.subscription);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
