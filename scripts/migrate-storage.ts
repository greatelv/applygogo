/**
 * Supabase Storage 마이그레이션 스크립트
 * 싱가폴 리전 → 서울 리전
 */

import { createClient } from "@supabase/supabase-js";

// 소스 (싱가폴)
const SOURCE_URL = "https://aiwwrzngxhmrbhdixwwr.supabase.co";
const SOURCE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpd3dyem5neGhtcmJoZGl4d3dyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY4MDQ2NCwiZXhwIjoyMDgzMjU2NDY0fQ.o8cV34j1eH71NgvY0NhEzrrCMji4nxT0kgpgM4ajwn8";

// 타겟 (서울)
const TARGET_URL = "https://hvvtfbacktphxaedifeq.supabase.co";
const TARGET_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dnRmYmFja3RwaHhhZWRpZmVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ3NzAzNiwiZXhwIjoyMDg0MDUzMDM2fQ.lnC7jlJrK1ZzINj0WhktasfiWrfYUZ0tMTEh7JsLSjQ";

const BUCKETS = ["resumes", "applygogo"];

const sourceClient = createClient(SOURCE_URL, SOURCE_KEY);
const targetClient = createClient(TARGET_URL, TARGET_KEY);

async function migrateBucket(bucketName: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📦 버킷: ${bucketName}`);
  console.log("=".repeat(60));

  try {
    // 1. 타겟에 버킷 생성 (이미 있으면 무시)
    console.log("📦 타겟 버킷 확인 중...");
    const { data: buckets } = await targetClient.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === bucketName);

    if (!bucketExists) {
      console.log(`   버킷 '${bucketName}' 생성 중...`);
      const { error } = await targetClient.storage.createBucket(bucketName, {
        public: bucketName === "applygogo", // applygogo는 public, resumes는 private
        fileSizeLimit: bucketName === "resumes" ? 10485760 : 5242880, // resumes: 10MB, applygogo: 5MB
      });
      if (error) {
        console.error("   ❌ 버킷 생성 실패:", error.message);
        return { success: 0, failed: 0, total: 0 };
      }
      console.log("   ✅ 버킷 생성 완료");
    } else {
      console.log("   ✅ 버킷이 이미 존재합니다");
    }

    // 2. 소스 버킷의 모든 파일 목록 가져오기 (재귀적으로)
    console.log("\n📂 소스 파일 목록 가져오는 중...");
    const allFiles = await getAllFiles(sourceClient, bucketName);

    if (allFiles.length === 0) {
      console.log("   ℹ️  마이그레이션할 파일이 없습니다.");
      return { success: 0, failed: 0, total: 0 };
    }

    console.log(`   ✅ ${allFiles.length}개의 파일 발견\n`);

    // 3. 각 파일을 다운로드하고 업로드
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < allFiles.length; i++) {
      const filePath = allFiles[i];
      const progress = `[${i + 1}/${allFiles.length}]`;

      try {
        console.log(`${progress} 📥 다운로드 중: ${filePath}`);

        // 소스에서 다운로드
        const { data: fileData, error: downloadError } =
          await sourceClient.storage.from(bucketName).download(filePath);

        if (downloadError) {
          console.error(`   ❌ 다운로드 실패: ${downloadError.message}`);
          failCount++;
          continue;
        }

        console.log(`${progress} 📤 업로드 중: ${filePath}`);

        // 타겟에 업로드
        const { error: uploadError } = await targetClient.storage
          .from(bucketName)
          .upload(filePath, fileData, {
            contentType: fileData.type || "application/octet-stream",
            upsert: true,
          });

        if (uploadError) {
          console.error(`   ❌ 업로드 실패: ${uploadError.message}`);
          failCount++;
          continue;
        }

        console.log(`   ✅ 완료: ${filePath}\n`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ 오류 발생:`, error);
        failCount++;
      }
    }

    return { success: successCount, failed: failCount, total: allFiles.length };
  } catch (error) {
    console.error("❌ 버킷 마이그레이션 중 오류 발생:", error);
    return { success: 0, failed: 0, total: 0 };
  }
}

async function getAllFiles(
  client: any,
  bucketName: string,
  prefix: string = ""
): Promise<string[]> {
  const files: string[] = [];

  const { data, error } = await client.storage.from(bucketName).list(prefix, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) {
    console.error(`파일 목록 가져오기 실패 (${prefix}):`, error.message);
    return files;
  }

  if (!data) return files;

  for (const item of data) {
    if (item.name === ".emptyFolderPlaceholder") continue;

    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;

    if (item.id === null) {
      // 폴더인 경우 재귀적으로 탐색
      const subFiles = await getAllFiles(client, bucketName, fullPath);
      files.push(...subFiles);
    } else {
      // 파일인 경우 경로 추가
      files.push(fullPath);
    }
  }

  return files;
}

async function migrateStorage() {
  console.log("🚀 Storage 마이그레이션 시작...\n");

  const results: Record<
    string,
    { success: number; failed: number; total: number }
  > = {};

  for (const bucketName of BUCKETS) {
    results[bucketName] = await migrateBucket(bucketName);
  }

  // 최종 결과 출력
  console.log("\n" + "=".repeat(60));
  console.log("📊 마이그레이션 결과:");
  console.log("=".repeat(60));

  let totalSuccess = 0;
  let totalFailed = 0;
  let totalFiles = 0;

  for (const [bucketName, result] of Object.entries(results)) {
    console.log(`\n📦 ${bucketName}:`);
    console.log(`   ✅ 성공: ${result.success}개`);
    console.log(`   ❌ 실패: ${result.failed}개`);
    console.log(`   📁 총 파일: ${result.total}개`);

    totalSuccess += result.success;
    totalFailed += result.failed;
    totalFiles += result.total;
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎯 전체 요약:");
  console.log(`   ✅ 성공: ${totalSuccess}개`);
  console.log(`   ❌ 실패: ${totalFailed}개`);
  console.log(`   📁 총 파일: ${totalFiles}개`);
  console.log("=".repeat(60));
}

// 실행
migrateStorage();
