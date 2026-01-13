const fs = require("fs");
const path = require("path");

const SERVICES_JSON = path.join(__dirname, "../lib/data/services.json");

// Gamsgo에서 제공하는 서비스 판단 기준:
// 1. logo URL이 https://static.gamsgocdn.com/image/로 시작
// 2. cta.url이 gamsgo.com/partner/로 시작 (Gamsgo 파트너 링크)
function isFromGamsgo(service) {
  const hasGamsgoLogo =
    service.logo &&
    service.logo.startsWith("https://static.gamsgocdn.com/image/");
  const hasGamsgoPartnerLink =
    service.cta &&
    service.cta.url &&
    service.cta.url.includes("gamsgo.com/partner/");

  return hasGamsgoLogo || hasGamsgoPartnerLink;
}

function addGamsgoFlag() {
  console.log("=== Gamsgo 서비스 플래그 추가 시작 ===\n");

  // 서비스 데이터 읽기
  const services = JSON.parse(fs.readFileSync(SERVICES_JSON, "utf-8"));

  let gamsgoCount = 0;
  let otherCount = 0;

  // 각 서비스에 isFromGamsgo 플래그 추가
  Object.keys(services).forEach((serviceId) => {
    const service = services[serviceId];

    if (isFromGamsgo(service)) {
      service.isFromGamsgo = true;
      console.log(`✓ ${serviceId}: isFromGamsgo = true`);
      gamsgoCount++;
    } else {
      console.log(`  ${serviceId}: Gamsgo 서비스 아님`);
      otherCount++;
    }
  });

  // 업데이트된 서비스 데이터 저장
  fs.writeFileSync(SERVICES_JSON, JSON.stringify(services, null, 2), "utf-8");

  console.log("\n=== 업데이트 완료 ===");
  console.log(`총 ${Object.keys(services).length}개 서비스 처리`);
  console.log(`- Gamsgo 서비스: ${gamsgoCount}개`);
  console.log(`- 기타 서비스: ${otherCount}개`);
  console.log(`\n서비스 데이터가 ${SERVICES_JSON}에 저장되었습니다.`);
}

// 실행
addGamsgoFlag();
