import { prisma } from "./src/lib/prisma";

async function checkResumeData() {
  try {
    // 가장 최근 이력서 조회
    const latestResume = await prisma.resume.findFirst({
      orderBy: { created_at: "desc" },
      include: {
        work_experiences: {
          orderBy: { order: "asc" },
        },
        educations: {
          orderBy: { order: "asc" },
        },
        skills: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!latestResume) {
      console.log("❌ 이력서가 없습니다.");
      return;
    }

    console.log("\n📄 이력서 정보:");
    console.log("  ID:", latestResume.id);
    console.log("  제목:", latestResume.title);
    console.log("  상태:", latestResume.status);
    console.log("  현재 단계:", latestResume.current_step);

    if (latestResume.failure_message) {
      console.log("  ⚠️  실패 메시지:", latestResume.failure_message);
    }

    console.log(
      "\n💼 경력사항 (" + latestResume.work_experiences.length + "개):"
    );
    latestResume.work_experiences.forEach((exp, idx) => {
      console.log(
        `\n  [${idx + 1}] ${exp.company_name_kr} (${exp.company_name_en})`
      );
      console.log(`      직무: ${exp.role_kr} / ${exp.role_en}`);
      console.log(`      기간: ${exp.start_date} ~ ${exp.end_date}`);
      console.log(`      업무(한글):`, exp.bullets_kr);
      console.log(`      업무(영문):`, exp.bullets_en);
    });

    console.log("\n🎓 학력사항 (" + latestResume.educations.length + "개):");
    latestResume.educations.forEach((edu, idx) => {
      console.log(`\n  [${idx + 1}] ${edu.school_name}`);
      console.log(`      전공: ${edu.major}`);
      console.log(`      학위: ${edu.degree}`);
      console.log(`      기간: ${edu.start_date} ~ ${edu.end_date}`);
    });

    console.log("\n🛠️  기술 스택 (" + latestResume.skills.length + "개):");
    latestResume.skills.forEach((skill, idx) => {
      console.log(`  [${idx + 1}] ${skill.name} - ${skill.level || "N/A"}`);
    });

    console.log("\n✅ 테스트 완료!");
  } catch (error) {
    console.error("❌ 에러 발생:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkResumeData();
