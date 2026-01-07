import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runTest() {
  console.log("🚀 Starting E2E Data Layer Test...");

  // 1. Cleanup previous test data
  const testEmail = "test_e2e_user@example.com";
  await prisma.user.deleteMany({ where: { email: testEmail } });
  console.log("✅ Cleanup complete");

  // 2. Create User (Simulate Login/Signup)
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      name: "E2E Test User",
    },
  });
  console.log("✅ User created:", user.id);

  // 3. Create Resume (Simulate Upload & Analysis)
  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: "Test Resume",
      originalFileUrl: "https://example.com/resume.pdf",
      status: "IDLE",
    },
  });
  console.log("✅ Resume created:", resume.id);

  // 4. Add Details (Simulate Editor Save)
  await prisma.workExperience.create({
    data: {
      resumeId: resume.id,
      companyNameKr: "Test Corp",
      companyNameEn: "Test Corp Global",
      roleKr: "Developer",
      roleEn: "Software Engineer",
      startDate: "2023.01",
      endDate: "Present",
      bulletsKr: ["개발했다", "배포했다"],
      bulletsEn: ["Developed features", "Deployed apps"],
    },
  });
  console.log("✅ Work Experience added");

  // 5. Upgrade Subscription (Simulate Payment)
  const sub = await prisma.subscription.create({
    data: {
      userId: user.id,
      planCode: "PRO",
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("✅ Subscription upgraded to PRO");

  // 6. Verify Final State
  const finalUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      resumes: { include: { workExperiences: true } },
      subscription: true,
    },
  });

  if (finalUser?.resumes[0].workExperiences.length !== 1)
    throw new Error("Resume data mismatch");
  if (finalUser?.subscription?.planCode !== "PRO")
    throw new Error("Subscription mismatch");

  console.log("🎉 E2E Data Layer Test PASSED!");
}

runTest()
  .catch((e) => {
    console.error("❌ Test Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
