import puppeteer from "puppeteer";
import axios from "axios";
import * as fs from "fs/promises";
import * as path from "path";
import { createWriteStream } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";

const streamPipeline = promisify(pipeline);

// Google Play 패키지명 매핑
const GOOGLE_PLAY_PACKAGES: Record<string, string> = {
  // Streaming
  youtube: "com.google.android.youtube",
  netflix: "com.netflix.mediaclient",
  disneyplus: "com.disney.disneyplus",
  tving: "com.tving.android",
  wavve: "com.wavve.player",
  watcha: "com.frograms.watcha",
  crunchyroll: "com.crunchyroll.crunchyroid",
  peacocktv: "com.peacocktv.peacockandroid",

  // Music
  spotify: "com.spotify.music",
  tidal: "com.aspiro.tidal",
  soundcloud: "com.soundcloud.android",
  deezer: "deezer.android.app",

  // AI
  chatgpt: "com.openai.chatgpt",

  // Software
  capcut: "com.lemon.lvoverseas",
  canva: "com.canva.editor",
  notion: "notion.id",
  figma: "com.figma.mirror",

  // Education
  duolingo: "com.duolingo",
  speak: "com.speakbuddy.speak",

  // VPN & Security
  nordvpn: "com.nordvpn.android",
  nordpass: "com.nordpass.android.app",

  // Travel
  myrealtrip: "com.mrt.producktion",
  klook: "com.klook",
  kkday: "com.kkday.kkday",

  // Shopping
  aliexpress: "com.alibaba.aliexpresshd",
};

interface LogoResult {
  serviceId: string;
  success: boolean;
  logoUrl?: string;
  localPath?: string;
  error?: string;
}

async function downloadImage(
  url: string,
  outputPath: string
): Promise<boolean> {
  try {
    const response = await axios.get(url, { responseType: "stream" });
    await streamPipeline(response.data, createWriteStream(outputPath));
    return true;
  } catch (error) {
    console.error(`Failed to download image from ${url}:`, error);
    return false;
  }
}

async function fetchLogoFromGooglePlay(
  packageName: string
): Promise<string | null> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const url = `https://play.google.com/store/apps/details?id=${packageName}`;
    console.log(`Fetching logo from: ${url}`);

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Google Play 앱 아이콘 선택자
    const logoUrl = await page.evaluate(() => {
      // 여러 가능한 선택자 시도
      const selectors = [
        'img[alt="Icon image"]',
        'img[itemprop="image"]',
        ".T75of.cN0oRe.fFmL2e",
        'img[class*="T75of"]',
      ];

      for (const selector of selectors) {
        const img = document.querySelector(selector) as HTMLImageElement;
        if (img && img.src) {
          // 고해상도 버전 URL로 변환
          let src = img.src;
          // s512-rw 파라미터로 512x512 고해상도 이미지 요청
          if (src.includes("play-lh.googleusercontent.com")) {
            src = src.split("=")[0] + "=s512-rw";
          }
          return src;
        }
      }
      return null;
    });

    await browser.close();
    return logoUrl;
  } catch (error) {
    console.error(`Error fetching logo for ${packageName}:`, error);
    await browser.close();
    return null;
  }
}

async function main() {
  const results: LogoResult[] = [];
  const outputDir = path.join(process.cwd(), "public/service-icons");

  // 출력 디렉토리 생성
  try {
    await fs.access(outputDir);
  } catch {
    await fs.mkdir(outputDir, { recursive: true });
  }

  console.log(
    `\n🚀 Starting logo fetch for ${
      Object.keys(GOOGLE_PLAY_PACKAGES).length
    } services...\n`
  );

  for (const [serviceId, packageName] of Object.entries(GOOGLE_PLAY_PACKAGES)) {
    console.log(`\n📱 Processing: ${serviceId} (${packageName})`);

    try {
      const logoUrl = await fetchLogoFromGooglePlay(packageName);

      if (logoUrl) {
        const filename = `${serviceId}.png`;
        const localPath = path.join(outputDir, filename);

        const success = await downloadImage(logoUrl, localPath);

        if (success) {
          results.push({
            serviceId,
            success: true,
            logoUrl,
            localPath: `/service-icons/${filename}`,
          });
          console.log(`✅ Success: ${serviceId} -> ${filename}`);
        } else {
          results.push({
            serviceId,
            success: false,
            error: "Failed to download image",
          });
          console.log(`❌ Failed to download: ${serviceId}`);
        }
      } else {
        results.push({
          serviceId,
          success: false,
          error: "Logo URL not found",
        });
        console.log(`❌ Logo not found: ${serviceId}`);
      }

      // Rate limiting - Google Play 요청 간 딜레이
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      results.push({
        serviceId,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      console.log(`❌ Error: ${serviceId}`);
    }
  }

  // 결과 요약
  console.log("\n\n📊 Summary:");
  console.log(`✅ Success: ${results.filter((r) => r.success).length}`);
  console.log(`❌ Failed: ${results.filter((r) => !r.success).length}`);

  // 성공한 서비스들의 로고 경로 출력
  console.log("\n\n📝 Logo paths to update in services.json:");
  results
    .filter((r) => r.success)
    .forEach((r) => {
      console.log(`  "${r.serviceId}": "${r.localPath}",`);
    });

  // 실패한 서비스들 출력
  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    console.log("\n\n⚠️  Failed services:");
    failed.forEach((r) => {
      console.log(`  ${r.serviceId}: ${r.error}`);
    });
  }

  // 결과를 JSON 파일로 저장
  const resultPath = path.join(process.cwd(), "logo-fetch-results.json");
  await fs.writeFile(resultPath, JSON.stringify(results, null, 2));
  console.log(`\n\n💾 Results saved to: ${resultPath}`);
}

main().catch(console.error);
