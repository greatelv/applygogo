// scripts/fix-broken-thumbnails.mjs
// One-shot fix for broken blog thumbnails.
// - ko: posts with `thumbnail: "/placeholder.svg..."`
// - en/ja: posts referencing /generated/<file>.jpg that doesn't exist on disk
// - any: duplicate /generated paths shared across multiple posts
// For each broken post, fetches a fresh Unsplash photo and writes <slug>-hero-fix[N].jpg,
// then rewrites the post's `thumbnail:` line.

import fs from "fs/promises";
import { createWriteStream, existsSync } from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
import axios from "axios";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const POSTS_DIR = path.join(ROOT, "content/posts");
const GEN_DIR = path.join(ROOT, "public/generated");
const LOCALES = ["ko", "en", "ja"];

const streamPipeline = promisify(pipeline);

// --- Helpers ---
function slugFromFilename(name) {
  return name.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
}

function extractFrontmatterField(text, field) {
  const re = new RegExp(`^${field}:\\s*"([^"]*)"`, "m");
  const m = text.match(re);
  return m ? m[1] : null;
}

function extractTitle(text) {
  return extractFrontmatterField(text, "title");
}

function extractCategoriesFirst(text) {
  const m = text.match(/^categories:\s*\[(.*?)\]/m);
  if (!m) return "career";
  const first = m[1].split(",")[0].replace(/['"]/g, "").trim();
  return first || "career";
}

function buildSearchQuery(title, slug, locale) {
  // Prefer slug words (English) for better Unsplash matches.
  const words = slug.replace(/-/g, " ").replace(/\b(2026|2025)\b/g, "").trim();
  // Keep first 6 words
  const trimmed = words.split(/\s+/).slice(0, 6).join(" ");
  if (trimmed.length >= 6) return trimmed;
  return title || slug;
}

async function downloadImage(url, outputPath) {
  try {
    const response = await axios.get(url, { responseType: "stream", timeout: 30000 });
    await streamPipeline(response.data, createWriteStream(outputPath));
    return true;
  } catch (e) {
    console.error(`  ✗ download failed: ${url} -> ${outputPath} (${e.message})`);
    return false;
  }
}

function nextFixFilename(slug) {
  // pick next available -hero-fix[N].jpg in GEN_DIR
  let candidate = path.join(GEN_DIR, `${slug}-hero-fix.jpg`);
  if (!existsSync(candidate)) return candidate;
  for (let i = 2; i < 50; i++) {
    candidate = path.join(GEN_DIR, `${slug}-hero-fix${i}.jpg`);
    if (!existsSync(candidate)) return candidate;
  }
  return path.join(GEN_DIR, `${slug}-hero-fix-${Date.now()}.jpg`);
}

// --- Unsplash scraper (ported from scripts/unsplash-scraper.ts) ---
class UnsplashScraper {
  constructor() {
    this.browser = null;
  }
  async init() {
    if (this.browser) return;
    console.log("Launching headless browser...");
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ],
    });
  }
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
  async searchPhoto(query) {
    if (!this.browser) await this.init();
    const page = await this.browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    try {
      const searchUrl = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 20000 });

      const photoData = await page.evaluate(() => {
        const figures = document.querySelectorAll(
          'figure[data-testid="asset-grid-masonry-figure"], figure'
        );
        if (figures.length === 0) return null;

        const validItems = [];
        for (const fig of figures) {
          const img =
            fig.querySelector('img[data-testid="asset-grid-masonry-img"]') ||
            fig.querySelector("img");
          if (!img) continue;
          const tempSrc = img.src || img.currentSrc || img.srcset || "";
          const isFreeUnsplash =
            tempSrc.includes("images.unsplash.com/photo-") &&
            !tempSrc.includes("plus.unsplash.com");
          if (isFreeUnsplash) validItems.push({ fig, img });
        }
        if (validItems.length === 0) return null;

        const idx = Math.floor(Math.random() * Math.min(validItems.length, 5));
        const targetImg = validItems[idx].img;
        let src =
          targetImg.currentSrc ||
          targetImg.src ||
          (targetImg.srcset ? targetImg.srcset.split(" ")[0] : "");
        if (!src) return null;
        const u = new URL(src);
        u.searchParams.set("w", "1200");
        u.searchParams.set("q", "80");
        u.searchParams.set("auto", "format");
        return { url: u.toString() };
      });

      return photoData;
    } catch (e) {
      console.error(`  ! scrape error "${query}": ${e.message}`);
      return null;
    } finally {
      await page.close();
    }
  }
}

// --- Audit: find broken posts ---
async function auditBroken() {
  const broken = []; // { locale, file, fullPath, reason, currentThumb }
  const seenThumbs = new Map(); // thumb -> [ {locale, file, fullPath} ]

  for (const locale of LOCALES) {
    const dir = path.join(POSTS_DIR, locale);
    const entries = await fs.readdir(dir);
    for (const name of entries.filter((n) => n.endsWith(".md")).sort()) {
      const full = path.join(dir, name);
      const text = await fs.readFile(full, "utf-8");
      const thumb = extractFrontmatterField(text, "thumbnail");
      if (!thumb) continue;

      let reason = null;
      if (thumb.includes("placeholder")) reason = "placeholder";
      else if (thumb.startsWith("/generated/")) {
        const onDisk = path.join(ROOT, "public", thumb);
        if (!existsSync(onDisk)) reason = "missing-file";
      }

      if (reason) {
        broken.push({ locale, file: name, fullPath: full, reason, currentThumb: thumb });
      }
      if (thumb.startsWith("/generated/")) {
        const arr = seenThumbs.get(thumb) || [];
        arr.push({ locale, file: name, fullPath: full });
        seenThumbs.set(thumb, arr);
      }
    }
  }

  // Add duplicate-file targets: keep first occurrence, mark others to regenerate.
  for (const [thumb, posts] of seenThumbs.entries()) {
    if (posts.length > 1) {
      // Skip first; for the rest, add as 'duplicate' if not already broken
      for (let i = 1; i < posts.length; i++) {
        const p = posts[i];
        if (!broken.find((b) => b.fullPath === p.fullPath)) {
          broken.push({ ...p, reason: "duplicate", currentThumb: thumb });
        }
      }
    }
  }
  return broken;
}

// --- Main ---
(async () => {
  await fs.mkdir(GEN_DIR, { recursive: true });
  const broken = await auditBroken();
  console.log(`\nFound ${broken.length} posts to fix:`);
  const byLocale = { ko: 0, en: 0, ja: 0 };
  const byReason = { placeholder: 0, "missing-file": 0, duplicate: 0 };
  for (const b of broken) {
    byLocale[b.locale]++;
    byReason[b.reason]++;
  }
  console.log("  by locale:", byLocale);
  console.log("  by reason:", byReason);

  const scraper = new UnsplashScraper();
  await scraper.init();

  const succeeded = [];
  const failed = [];

  for (let i = 0; i < broken.length; i++) {
    const item = broken[i];
    const text = await fs.readFile(item.fullPath, "utf-8");
    const title = extractTitle(text) || "";
    const category = extractCategoriesFirst(text);
    const slug = slugFromFilename(item.file);
    const queryPrimary = buildSearchQuery(title, slug, item.locale);

    console.log(
      `\n[${i + 1}/${broken.length}] [${item.locale}] (${item.reason}) ${item.file}`
    );
    console.log(`   query: "${queryPrimary}"`);

    let photo = await scraper.searchPhoto(queryPrimary);
    if (!photo) {
      console.log(`   retry with category: "${category}"`);
      photo = await scraper.searchPhoto(category);
    }
    if (!photo) {
      console.log(`   final fallback: "career professional"`);
      photo = await scraper.searchPhoto("career professional");
    }
    if (!photo) {
      console.log(`   ✗ no photo found, skipping`);
      failed.push(item);
      continue;
    }

    const outPath = nextFixFilename(slug);
    const ok = await downloadImage(photo.url, outPath);
    if (!ok) {
      failed.push(item);
      continue;
    }
    const newThumbWeb = "/generated/" + path.basename(outPath);

    // Rewrite the post: replace thumbnail line and any HERO_PLACEHOLDER
    let newText = text.replace(
      /^thumbnail:\s*".*"$/m,
      `thumbnail: "${newThumbWeb}"`
    );
    if (newText.includes("HERO_PLACEHOLDER")) {
      const altSafe = (title || slug).replace(/"/g, "'");
      newText = newText.replace(
        /!\[HERO\]\(HERO_PLACEHOLDER\)/g,
        `![${altSafe}](${newThumbWeb})`
      );
    }
    await fs.writeFile(item.fullPath, newText, "utf-8");
    console.log(`   ✓ ${newThumbWeb}`);
    succeeded.push({ ...item, newThumb: newThumbWeb });
  }

  await scraper.close();

  console.log(`\n=== Done ===`);
  console.log(`succeeded: ${succeeded.length}`);
  console.log(`failed:    ${failed.length}`);
  if (failed.length) {
    console.log("\nFailed items:");
    for (const f of failed) console.log(`  [${f.locale}] ${f.file} (${f.reason})`);
  }
})();
