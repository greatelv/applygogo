import dotenv from "dotenv";
dotenv.config();

import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Skill 데이터 마이그레이션 시작...");

  const skills = await prisma.skill.findMany({
    where: {
      OR: [{ name_source: "" }, { name_target: null }],
    },
  });

  console.log(`업데이트 대상 스킬: ${skills.length}개`);

  let updatedCount = 0;

  for (const skill of skills) {
    if (!skill.name) continue;

    const nameSource = skill.name_source || skill.name;
    const nameTarget = skill.name_target || skill.name;

    await prisma.skill.update({
      where: { id: skill.id },
      data: {
        name_source: nameSource,
        name_target: nameTarget,
      },
    });
    updatedCount++;
  }

  console.log(`총 ${updatedCount}개의 스킬 데이터가 업데이트되었습니다.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
