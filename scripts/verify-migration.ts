/**
 * 마이그레이션 검증 스크립트
 * 싱가폴 DB와 서울 DB의 데이터 일치성 확인
 */

import { createClient } from "@supabase/supabase-js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// 싱가폴 (소스)
const SOURCE_DB_URL =
  "postgresql://postgres.aiwwrzngxhmrbhdixwwr:Tkjeon3670!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";
const SOURCE_SUPABASE_URL = "https://aiwwrzngxhmrbhdixwwr.supabase.co";
const SOURCE_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpd3dyem5neGhtcmJoZGl4d3dyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY4MDQ2NCwiZXhwIjoyMDgzMjU2NDY0fQ.o8cV34j1eH71NgvY0NhEzrrCMji4nxT0kgpgM4ajwn8";

// 서울 (타겟)
const TARGET_DB_URL =
  "postgresql://postgres.hvvtfbacktphxaedifeq:Tkjeon3670!@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres";
const TARGET_SUPABASE_URL = "https://hvvtfbacktphxaedifeq.supabase.co";
const TARGET_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dnRmYmFja3RwaHhhZWRpZmVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ3NzAzNiwiZXhwIjoyMDg0MDUzMDM2fQ.lnC7jlJrK1ZzINj0WhktasfiWrfYUZ0tMTEh7JsLSjQ";

const sourceSupabase = createClient(SOURCE_SUPABASE_URL, SOURCE_SUPABASE_KEY);
const targetSupabase = createClient(TARGET_SUPABASE_URL, TARGET_SUPABASE_KEY);

// PostgreSQL 경로 설정
process.env.PATH = `/opt/homebrew/opt/postgresql@17/bin:${process.env.PATH}`;

interface TableCount {
  table: string;
  source: number;
  target: number;
  match: boolean;
}

interface StorageCount {
  bucket: string;
  source: number;
  target: number;
  match: boolean;
}

async function getTableCount(
  dbUrl: string,
  tableName: string
): Promise<number> {
  try {
    const { stdout } = await execAsync(
      `psql "${dbUrl}" -t -c "SELECT COUNT(*) FROM ${tableName};"`
    );
    return parseInt(stdout.trim());
  } catch (error) {
    console.error(`테이블 ${tableName} 카운트 실패:`, error);
    return -1;
  }
}

async function getStorageFileCount(
  client: ReturnType<typeof createClient>,
  bucketName: string
): Promise<number> {
  try {
    let count = 0;
    const files = await getAllFiles(client, bucketName);
    return files.length;
  } catch (error) {
    console.error(`버킷 ${bucketName} 파일 카운트 실패:`, error);
    return -1;
  }
}

async function getAllFiles(
  client: ReturnType<typeof createClient>,
  bucketName: string,
  prefix: string = ""
): Promise<string[]> {
  const files: string[] = [];

  const { data, error } = await client.storage.from(bucketName).list(prefix, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });

  if (error || !data) return files;

  for (const item of data) {
    if (item.name === ".emptyFolderPlaceholder") continue;

    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;

    if (item.id === null) {
      const subFiles = await getAllFiles(client, bucketName, fullPath);
      files.push(...subFiles);
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function verifyMigration() {
  console.log("🔍 마이그레이션 검증 시작...\n");
  console.log("=".repeat(80));

  // 1. 데이터베이스 테이블 검증
  console.log("\n📊 데이터베이스 테이블 검증\n");

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

  const tableResults: TableCount[] = [];

  for (const table of tables) {
    const sourceCount = await getTableCount(SOURCE_DB_URL, table);
    const targetCount = await getTableCount(TARGET_DB_URL, table);
    const match = sourceCount === targetCount;

    tableResults.push({
      table,
      source: sourceCount,
      target: targetCount,
      match,
    });

    const status = match ? "✅" : "❌";
    const color = match ? "\x1b[32m" : "\x1b[31m";
    const reset = "\x1b[0m";

    console.log(
      `${status} ${color}${table.padEnd(25)}${reset} | 싱가폴: ${String(
        sourceCount
      ).padStart(5)} | 서울: ${String(targetCount).padStart(5)} | ${
        match ? "일치" : "불일치"
      }`
    );
  }

  // 2. 스토리지 검증
  console.log("\n📦 스토리지 버킷 검증\n");

  const buckets = ["resumes", "applygogo"];
  const storageResults: StorageCount[] = [];

  for (const bucket of buckets) {
    const sourceCount = await getStorageFileCount(sourceSupabase, bucket);
    const targetCount = await getStorageFileCount(targetSupabase, bucket);
    const match = sourceCount === targetCount;

    storageResults.push({
      bucket,
      source: sourceCount,
      target: targetCount,
      match,
    });

    const status = match ? "✅" : "❌";
    const color = match ? "\x1b[32m" : "\x1b[31m";
    const reset = "\x1b[0m";

    console.log(
      `${status} ${color}${bucket.padEnd(25)}${reset} | 싱가폴: ${String(
        sourceCount
      ).padStart(5)} | 서울: ${String(targetCount).padStart(5)} | ${
        match ? "일치" : "불일치"
      }`
    );
  }

  // 3. 스키마 검증 (테이블 목록)
  console.log("\n🗂️  스키마 검증\n");

  const schemaQuery = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;

  const { stdout: sourceTables } = await execAsync(
    `psql "${SOURCE_DB_URL}" -t -c "${schemaQuery}"`
  );
  const { stdout: targetTables } = await execAsync(
    `psql "${TARGET_DB_URL}" -t -c "${schemaQuery}"`
  );

  const sourceTableList = sourceTables
    .trim()
    .split("\n")
    .map((t) => t.trim())
    .filter((t) => t && !t.startsWith("_"));
  const targetTableList = targetTables
    .trim()
    .split("\n")
    .map((t) => t.trim())
    .filter((t) => t && !t.startsWith("_"));

  const schemaMatch =
    JSON.stringify(sourceTableList.sort()) ===
    JSON.stringify(targetTableList.sort());

  if (schemaMatch) {
    console.log("✅ 스키마 일치: 모든 테이블이 동일합니다");
    console.log(`   테이블 수: ${sourceTableList.length}개`);
  } else {
    console.log("❌ 스키마 불일치");
    console.log("   싱가폴 테이블:", sourceTableList);
    console.log("   서울 테이블:", targetTableList);
  }

  // 4. 최종 결과
  console.log("\n" + "=".repeat(80));
  console.log("📋 검증 결과 요약\n");

  const allTablesMatch = tableResults.every((r) => r.match);
  const allStorageMatch = storageResults.every((r) => r.match);
  const allMatch = allTablesMatch && allStorageMatch && schemaMatch;

  console.log(`스키마 일치: ${schemaMatch ? "✅ 통과" : "❌ 실패"}`);
  console.log(`데이터베이스 데이터: ${allTablesMatch ? "✅ 통과" : "❌ 실패"}`);
  console.log(`스토리지 파일: ${allStorageMatch ? "✅ 통과" : "❌ 실패"}`);

  if (allMatch) {
    console.log(
      "\n🎉 모든 검증 통과! 마이그레이션이 성공적으로 완료되었습니다."
    );
  } else {
    console.log("\n⚠️  일부 검증 실패. 위의 세부 내용을 확인하세요.");
  }

  console.log("=".repeat(80));

  // 5. 상세 통계
  console.log("\n📈 상세 통계\n");

  const totalSourceRecords = tableResults.reduce((sum, r) => sum + r.source, 0);
  const totalTargetRecords = tableResults.reduce((sum, r) => sum + r.target, 0);
  const totalSourceFiles = storageResults.reduce((sum, r) => sum + r.source, 0);
  const totalTargetFiles = storageResults.reduce((sum, r) => sum + r.target, 0);

  console.log(`총 데이터베이스 레코드:`);
  console.log(`  싱가폴: ${totalSourceRecords.toLocaleString()}개`);
  console.log(`  서울:   ${totalTargetRecords.toLocaleString()}개`);
  console.log(`\n총 스토리지 파일:`);
  console.log(`  싱가폴: ${totalSourceFiles.toLocaleString()}개`);
  console.log(`  서울:   ${totalTargetFiles.toLocaleString()}개`);

  console.log("\n✅ 검증 완료!\n");
}

// 실행
verifyMigration().catch(console.error);
