import { prisma } from "./src/lib/prisma";

async function cleanup() {
  try {
    console.log("🧹 기존 테스트 데이터 정리 중...\n");

    // Delete all work experiences, educations, skills
    const deletedExp = await prisma.workExperience.deleteMany({});
    console.log(`✅ 경력사항 ${deletedExp.count}개 삭제`);

    const deletedEdu = await prisma.education.deleteMany({});
    console.log(`✅ 학력사항 ${deletedEdu.count}개 삭제`);

    const deletedSkills = await prisma.skill.deleteMany({});
    console.log(`✅ 기술스택 ${deletedSkills.count}개 삭제`);

    // Delete all resumes
    const deletedResumes = await prisma.resume.deleteMany({});
    console.log(`✅ 이력서 ${deletedResumes.count}개 삭제`);

    console.log(
      "\n✨ 정리 완료! 이제 새로운 이력서를 업로드하여 테스트하세요."
    );
  } catch (error) {
    console.error("❌ 에러:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
