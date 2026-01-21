import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Testing Prisma User creation properly...");
  try {
    const email = `test_recovery_${Date.now()}@example.com`;
    console.log(
      `Attempting to create user with email: ${email} (NO ID provided)`,
    );

    // id 없이 생성 시도
    const user = await prisma.user.create({
      data: {
        email,
      },
    });

    console.log("✅ SUCCESS: User created successfully!");
    console.log("Generated ID:", user.id);
    console.log("Created At:", user.created_at);

    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
    console.log("Cleaned up test user.");
  } catch (error) {
    console.error("❌ FAILURE: Could not create user without ID.");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
