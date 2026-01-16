/**
 * 데이터베이스 마이그레이션 스크립트
 * 싱가폴 리전 → 서울 리전
 *
 * 두 개의 Prisma Client 인스턴스를 사용하여 데이터를 복사합니다.
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const SOURCE_DB_URL =
  "postgresql://postgres.aiwwrzngxhmrbhdixwwr:Tkjeon3670!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";
const TARGET_DB_URL =
  "postgresql://postgres.hvvtfbacktphxaedifeq:Tkjeon3670!@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres";

async function migrateData() {
  console.log("🚀 데이터 마이그레이션 시작...\n");

  try {
    // 각 테이블의 데이터를 복사하는 SQL 생성
    const tables = [
      "users",
      "accounts",
      "sessions",
      "resumes",
      "work_experiences",
      "educations",
      "skills",
      "additional_items",
      "usage_logs",
      "payment_histories",
      "feedbacks",
      "verification_tokens",
    ];

    for (const table of tables) {
      console.log(`📋 ${table} 테이블 마이그레이션 중...`);

      // 1. 소스에서 데이터 카운트
      const countCmd = `psql "${SOURCE_DB_URL}" -t -c "SELECT COUNT(*) FROM ${table};"`;
      const { stdout: countOutput } = await execAsync(countCmd);
      const count = parseInt(countOutput.trim());
      console.log(`   발견: ${count}개의 레코드`);

      if (count === 0) {
        console.log(`   ℹ️  데이터가 없습니다. 건너뜁니다.\n`);
        continue;
      }

      // 2. 소스에서 데이터 덤프
      const dumpCmd = `psql "${SOURCE_DB_URL}" -c "\\COPY (SELECT * FROM ${table}) TO STDOUT WITH CSV HEADER" > /tmp/${table}.csv`;
      await execAsync(dumpCmd);

      // 3. 타겟으로 데이터 복원
      const restoreCmd = `psql "${TARGET_DB_URL}" -c "\\COPY ${table} FROM '/tmp/${table}.csv' WITH CSV HEADER"`;
      await execAsync(restoreCmd);

      console.log(`   ✅ ${count}개의 레코드 마이그레이션 완료\n`);
    }

    console.log("=".repeat(60));
    console.log("✅ 모든 데이터 마이그레이션 완료!");
    console.log("=".repeat(60));
    console.log("\n다음 단계:");
    console.log("1. Storage 마이그레이션: npx tsx scripts/migrate-storage.ts");
    console.log("2. .env 파일 업데이트");
    console.log("3. 애플리케이션 재시작 및 테스트");
  } catch (error) {
    console.error("❌ 마이그레이션 중 오류 발생:", error);
    throw error;
  }
}

// 실행
migrateData();
