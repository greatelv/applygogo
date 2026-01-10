import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "patakeique@gmail.com";
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true },
    });

    if (!user) {
      console.log(`User with email ${email} not found.`);
    } else {
      console.log("User Subscription Data:");
      console.log(JSON.stringify(user.subscription, null, 2));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
