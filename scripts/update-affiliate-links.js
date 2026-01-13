const fs = require("fs");
const path = require("path");

// 경로 설정
const LEGACY_DIR = path.join(__dirname, "../lib/constants/legacy/services");
const SERVICES_JSON = path.join(__dirname, "../lib/data/services.json");

// Legacy 서비스 파일들에서 affiliateLink 추출
function extractAffiliateLinks() {
  const affiliateLinks = {};
  const files = fs.readdirSync(LEGACY_DIR);

  files.forEach((file) => {
    if (file.endsWith(".json")) {
      const filePath = path.join(LEGACY_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      if (data.id && data.affiliateLink) {
        affiliateLinks[data.id] = data.affiliateLink;
        console.log(`✓ ${data.id}: ${data.affiliateLink}`);
      }
    }
  });

  return affiliateLinks;
}

// 서비스 ID 매핑 (legacy ID -> current ID)
const SERVICE_ID_MAPPING = {
  gamsgo: "gamsgo",
  netflix: "netflix",
  nordvpn: "nordvpn",
  nordpass: "nordpass",
  myrealtrip: "myrealtrip",
  klook: "klook",
  kkday: "kkday",
  trip: "tripcom",
  speak: "speak",
  aliexpress: "aliexpress",
  donki: "donquijote",
  biccamera: "biccamera",
  saily: "saily",
  usimsa: "usimsa",
  goingbus: "goingbus",
  baemin: null, // 현재 서비스에 없음
  genshin: null, // 현재 서비스에 없음
  "honkai-star-rail": null, // 현재 서비스에 없음
  "zenless-zone-zero": null, // 현재 서비스에 없음
};

// 서비스 데이터 업데이트
function updateServices() {
  console.log("\n=== Legacy 서비스에서 Affiliate Link 추출 ===\n");
  const affiliateLinks = extractAffiliateLinks();

  console.log("\n=== 서비스 데이터 업데이트 시작 ===\n");

  // 현재 서비스 데이터 읽기
  const services = JSON.parse(fs.readFileSync(SERVICES_JSON, "utf-8"));

  // Gamsgo의 affiliateLink를 기본값으로 설정
  const defaultAffiliateLink =
    affiliateLinks["gamsgo"] || "https://www.gamsgo.com/partner/5FVYS";

  let updatedCount = 0;
  let notFoundCount = 0;

  // 각 서비스의 cta.url 업데이트
  Object.keys(services).forEach((serviceId) => {
    const service = services[serviceId];

    // Legacy ID 찾기
    let legacyId = null;
    for (const [legacy, current] of Object.entries(SERVICE_ID_MAPPING)) {
      if (current === serviceId) {
        legacyId = legacy;
        break;
      }
    }

    // Affiliate link 결정
    let affiliateLink;
    if (legacyId && affiliateLinks[legacyId]) {
      affiliateLink = affiliateLinks[legacyId];
      console.log(`✓ ${serviceId}: ${legacyId}의 affiliateLink 적용`);
      updatedCount++;
    } else {
      affiliateLink = defaultAffiliateLink;
      console.log(
        `⚠ ${serviceId}: 매칭되는 legacy 서비스 없음, gamsgo의 affiliateLink 적용`
      );
      notFoundCount++;
    }

    // cta.url 업데이트
    if (service.cta) {
      service.cta.url = affiliateLink;
    }
  });

  // 업데이트된 서비스 데이터 저장
  fs.writeFileSync(SERVICES_JSON, JSON.stringify(services, null, 2), "utf-8");

  console.log("\n=== 업데이트 완료 ===");
  console.log(`총 ${Object.keys(services).length}개 서비스 처리`);
  console.log(`- Legacy 매칭: ${updatedCount}개`);
  console.log(`- Gamsgo 기본값 적용: ${notFoundCount}개`);
  console.log(`\n서비스 데이터가 ${SERVICES_JSON}에 저장되었습니다.`);
}

// 실행
updateServices();
