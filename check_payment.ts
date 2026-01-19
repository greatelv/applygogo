import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const paymentId = "payment-1768208754417-78s4m6vzl";
  const payment = await prisma.$queryRawUnsafe(
    "SELECT * FROM payment_histories WHERE payment_id = $1",
    paymentId,
  );
  console.log("Payment result:", JSON.stringify(payment, null, 2));

  // Check user by email as well to see if they got credits
  const users = await prisma.user.findMany({
    where: { email: "greatelv@gmail.com" }, // Assuming this is the user based on previous logs
    select: { id: true, email: true, plan_type: true, credits: true },
  });
  console.log("User status:", JSON.stringify(users, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
