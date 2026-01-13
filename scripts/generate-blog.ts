import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
import * as fs from "fs/promises";
import * as path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import { createWriteStream } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import { UnsplashScraper } from "./unsplash-scraper";

// Load environment variables from .env file if it exists (for local development)
// In GitHub Actions, environment variables are set directly
dotenv.config({ override: false });

const API_KEY =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!API_KEY) {
  console.error("Error: GOOGLE_GENERATIVE_AI_API_KEY is not set");
  console.error(
    "Please set it in .env file (local) or as an environment variable (CI/CD)"
  );
  process.exit(1);
}

const client = new GoogleGenAI({
  apiKey: API_KEY,
});

// Configure the client to use the AI Studio (Generative Language API) by default
// This avoids the 404 errors caused by the client defaulting to Vertex AI behavior
const models = client.models;

const streamPipeline = promisify(pipeline);

// Helper: Generate with Fallback
async function generateWithRetry(
  prompt: string,
  modelName: string = "gemini-3-flash-preview"
): Promise<any> {
  const fallbackModel = "gemini-2.5-flash";
  try {
    return await models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
  } catch (error: any) {
    const status = error.status || (error.response && error.response.status);
    console.warn(
      `Primary model (${modelName}) failed (${status}). Trying fallback (${fallbackModel})...`
    );
    return await models.generateContent({
      model: fallbackModel,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
  }
}

// Helper: Download Image
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

// Helper: Scrape OG Image
async function fetchOgImage(url: string, outputPath: string): Promise<boolean> {
  try {
    console.log(`Fetching OG image from: ${url}`);
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 5000,
    });
    const $ = cheerio.load(data);
    const ogImage =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content");

    if (ogImage) {
      // Resolve relative URLs
      const absoluteOgImage = new URL(ogImage, url).toString();
      console.log(`Found OG Image: ${absoluteOgImage}`);

      const success = await downloadImage(absoluteOgImage, outputPath);
      if (success) {
        console.log(`Saved OG Image to: ${outputPath}`);
        return true;
      }
    }
  } catch (error) {
    console.error(
      `Failed to fetch OG image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
  return false;
}

// SVG Generation Removed by request

// Helper: Load Prompt Template
async function loadPrompt(
  name: string,
  variables: Record<string, any>
): Promise<string> {
  const promptPath = path.join(process.cwd(), "scripts/prompts", `${name}.md`);
  let content = await fs.readFile(promptPath, "utf-8");

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{${key}}}`, "g");
    content = content.replace(placeholder, String(value));
  }

  return content;
}

async function generateBlog() {
  const scraper = new UnsplashScraper();

  try {
    // 0. Load Services Data
    const servicesPath = path.join(process.cwd(), "src/lib/data/services.json");
    const servicesData = JSON.parse(await fs.readFile(servicesPath, "utf-8"));
    const serviceNames = Object.values(servicesData)
      .map((s: any) => s.name)
      .join(", ");
    const serviceIds = Object.keys(servicesData).join(", ");

    // 0.1. Generate Current Date Context (KST: UTC+9)
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);

    const currentYear = kstDate.getUTCFullYear();
    const currentMonth = kstDate.getUTCMonth() + 1;
    const currentDay = kstDate.getUTCDate();

    // YYYY-MM-DD format based on KST
    const currentDateStr = `${currentYear}-${String(currentMonth).padStart(
      2,
      "0"
    )}-${String(currentDay).padStart(2, "0")}`;
    const currentDateKorean = `${currentYear}년 ${currentMonth}월`;

    // Generate Unix Timestamp (milliseconds)
    const currentIsoDate = now.getTime();

    console.log(
      `Loaded ${Object.keys(servicesData).length} services from services.json`
    );

    // 1. Generate Topic
    console.log("Generating topic...");

    const postsDir = path.join(process.cwd(), "content/posts");
    let existingTitles: string[] = [];
    try {
      const files = await fs.readdir(postsDir);
      existingTitles = files.map((f) =>
        f.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(".md", "")
      );
    } catch (e) {
      console.log("No existing posts found or error reading dir.");
    }

    // Handle Manual Topic Override
    const manualTopic = process.env.MANUAL_TOPIC;
    let topicPrompt = "";

    if (manualTopic) {
      console.log(`\n!!! MANUAL TOPIC DETECTED: "${manualTopic}" !!!\n`);
      topicPrompt = await loadPrompt("topic-refinement", {
        manualTopic, // Pass the manual input
        serviceNum: Object.keys(servicesData).length,
        serviceNames,
        serviceIds,
        // Existing titles are less relevant for manual override, but kept for context if needed
        existingTitles: existingTitles.join(", "),
        currentDateKorean,
        currentDateStr,
        currentYear,
      });
    } else {
      // Standard Automatic Generation
      topicPrompt = await loadPrompt("topic-generation", {
        serviceNum: Object.keys(servicesData).length,
        serviceNames,
        serviceIds,
        existingTitles: existingTitles.join(", "),
        currentDateKorean,
        currentDateStr,
        currentYear,
      });
    }

    const result = await generateWithRetry(topicPrompt);
    const text = (result.candidates?.[0]?.content?.parts?.[0]?.text || "")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const topicData = JSON.parse(text);

    console.log(`Selected Topic: ${topicData.title}`);

    // Sanitize title for YAML (escape double quotes)
    const safeTitle = topicData.title.replace(/"/g, '\\"');

    // Handle null/missing targetServiceId
    const isServiceReview =
      topicData.targetServiceId &&
      topicData.targetServiceId !== "null" &&
      topicData.targetServiceId !== "msg_missing";
    const targetServiceId = isServiceReview ? topicData.targetServiceId : "";

    const articleType = topicData.articleType || "service_guide"; // Default to guide if missing

    // Prepare conditional frontmatter values
    const officialWebsiteUrl = isServiceReview ? "대상 서비스의 공식 URL" : "";
    const targetLinkVariable = "";
    const buttonText = isServiceReview ? `${targetServiceId} 바로가기` : "";

    console.log(
      `Is Service Review: ${isServiceReview}, Target Service: ${targetServiceId}`
    );

    // 3. Write Article
    console.log("Writing article...");

    const articlePrompt = await loadPrompt("article-generation", {
      title: safeTitle,
      targetServiceId: targetServiceId,
      isSponsored: isServiceReview,
      officialWebsiteUrl: officialWebsiteUrl,
      targetLink: targetLinkVariable,
      buttonText: buttonText,
      articleType: articleType,
      focus: topicData.focus,
      currentDateKorean,
      currentDateStr,
      currentYear,
      lastYear: currentYear - 1,
      currentIsoDate,
    });

    const articleResult = await generateWithRetry(articlePrompt);
    let articleContent = (
      articleResult.candidates?.[0]?.content?.parts?.[0]?.text || ""
    ).trim();

    // Robustly strip potential markdown blocks around the JSON/Frontmatter
    // Sometimes AI wraps the whole response in ```markdown ... ``` or ```yaml ... ```
    articleContent = articleContent
      .replace(/^```[a-z]*\n/i, "") // Removes starting ```markdown or ```yaml
      .replace(/\n```$/g, "") // Removes ending ```
      .trim();

    // Ensure it starts with ---, if it starts with something else try to find the first ---
    // Use Regex to find the first valid yaml frontmatter block
    // It looks for a line starting with ---, followed by content, and closing with ---
    const frontmatterRegex = /^---\n[\s\S]*?\n---/m;
    const fmMatch = articleContent.match(frontmatterRegex);

    if (fmMatch) {
      // If found, keep everything starting from the match
      articleContent = articleContent.substring(fmMatch.index!);
    } else {
      console.warn(
        "Warning: Could not find valid frontmatter block. Keeping content as is."
      );
    }

    // Secondary check: remove any leading/trailing garbage that might have been left
    articleContent = articleContent.trim();

    // --- Dynamic Image Processing ---
    console.log("Processing Images...");

    // Setup Directory
    const generatedDir = path.join(process.cwd(), "public/generated");
    try {
      await fs.access(generatedDir);
    } catch {
      await fs.mkdir(generatedDir, { recursive: true });
    }

    // 1. Hero Image Strategy
    // Priority 1: Unsplash with Explicit Thumbnail Keyword (if provided)
    // Priority 2: OG Image from Target URL
    // Priority 3: Unsplash Fallback (Title -> Category)

    const urlMatch = articleContent.match(
      /officialWebsiteUrl:\s*["']?([^"'\n]+)["']?/
    );
    const targetUrl = urlMatch ? urlMatch[1] : null;
    let heroImagePath = "";

    await scraper.init(); // Initialize once

    // --- Priority 1: Explicit Keyword ---
    if (topicData.thumbnailSearchKeyword) {
      console.log(
        `[Hero Strategy] Priority 1: Searching Unsplash with keyword: "${topicData.thumbnailSearchKeyword}"`
      );
      try {
        const photo = await scraper.searchPhoto(
          topicData.thumbnailSearchKeyword
        );
        if (photo) {
          const safeTitle = topicData.slug;
          const filename = `${safeTitle}-hero.jpg`;
          const outputPath = path.join(generatedDir, filename);

          const success = await downloadImage(photo.url, outputPath);
          if (success) {
            heroImagePath = `/generated/${filename}`;
            console.log(
              `[Hero Strategy] Success: Saved Unsplash Hero Image from keyword.`
            );
          }
        } else {
          console.log(
            `[Hero Strategy] Priority 1 Failed: No photo found for keyword.`
          );
        }
      } catch (e) {
        console.error("[Hero Strategy] Priority 1 Error:", e);
      }
    }

    // --- Priority 2: OG Image ---
    if (!heroImagePath && targetUrl) {
      console.log(
        `[Hero Strategy] Priority 2: Attempting OG Image from ${targetUrl}`
      );
      const ogFilename = `${topicData.slug}-og.jpg`;
      const ogPath = path.join(generatedDir, ogFilename);
      const success = await fetchOgImage(targetUrl, ogPath);
      if (success) {
        heroImagePath = `/generated/${ogFilename}`;
        console.log(`[Hero Strategy] Success: Saved OG Image.`);
      } else {
        console.log(
          `[Hero Strategy] Priority 2 Failed: Could not fetch OG Image.`
        );
      }
    }

    // --- Priority 3: Unsplash Fallbacks (Title -> Category) ---
    if (!heroImagePath) {
      console.log(
        "[Hero Strategy] Priority 3: Fallback to Title/Category search..."
      );
      try {
        let photo = await scraper.searchPhoto(topicData.title);

        if (!photo) {
          const catMatch = articleContent.match(/categories:\s*\[(.*?)\]/);
          const firstCategory = catMatch
            ? catMatch[1].split(",")[0].replace(/['"]/g, "").trim()
            : "marketing";
          console.log(
            `[Hero Strategy] Title search failed. Retrying with category: ${firstCategory}`
          );
          photo = await scraper.searchPhoto(firstCategory);
        }

        if (photo) {
          const safeTitle = topicData.slug;
          const filename = `${safeTitle}-hero.jpg`;
          const outputPath = path.join(generatedDir, filename);

          const success = await downloadImage(photo.url, outputPath);
          if (success) {
            heroImagePath = `/generated/${filename}`;
            console.log(
              `[Hero Strategy] Success: Saved Unsplash Fallback Image.`
            );
          }
        }
      } catch (e) {
        console.error("[Hero Strategy] Priority 3 Error:", e);
      }
    }

    if (heroImagePath) {
      articleContent = articleContent.replace(
        "![HERO](HERO_PLACEHOLDER)",
        `![${topicData.title}](${heroImagePath})`
      );
      articleContent = articleContent.replace(
        /thumbnail:.*$/m,
        `thumbnail: "${heroImagePath}"`
      );
    }

    // 2. Unsplash Body Images with Puppeteer
    const unsplashRegex = /!\[(.*?)\]\(UNSPLASH:(.*?)\)/g;
    let match;
    const replacements: {
      match: string;
      replacement: string;
      credit: string;
    }[] = [];

    // Reset regex index
    unsplashRegex.lastIndex = 0;

    // We definitely want to search sequentially to reuse browser instance and avoid race conditions or bans
    const matches: RegExpExecArray[] = [];
    while ((match = unsplashRegex.exec(articleContent)) !== null) {
      matches.push(match);
    }

    // Limit to maximum 2 body images
    const limitedMatches = matches.slice(0, 2);
    console.log(
      `Found ${matches.length} image placeholders, processing ${limitedMatches.length}`
    );

    // If we have matches, scraper is already initialized.

    // Track used photo URLs to prevent duplicates
    const usedPhotoUrls = new Set<string>();

    for (const match of limitedMatches) {
      const fullMatch = match[0];
      const altText = match[1];
      const query = match[2].trim();

      console.log(`Processing Unsplash Request: "${query}"`);

      // Use scraper
      let photo = await scraper.searchPhoto(query);

      // Check for duplicate and retry if needed
      if (photo && usedPhotoUrls.has(photo.url)) {
        console.log(`Duplicate photo detected, searching for alternative...`);
        photo = await scraper.searchPhoto(`${query} alternative`);
      }

      if (photo) {
        const ext = "jpg";
        const safeQuery = query.replace(/[^a-z0-9]/gi, "-");
        const suffix = Math.random().toString(36).substring(7);
        const filename = `${topicData.slug}-${safeQuery}-${suffix}.${ext}`;
        const outputPath = path.join(generatedDir, filename);

        const success = await downloadImage(photo.url, outputPath);
        if (success) {
          usedPhotoUrls.add(photo.url);
          replacements.push({
            match: fullMatch,
            replacement: `![${altText}](/generated/${filename})`,
            credit: `<p class="text-xs text-center text-gray-500 mt-2">Photo by <a href="${photo.photographerUrl}?utm_source=teep_blog&utm_medium=referral" target="_blank" rel="noopener noreferrer">${photo.photographer}</a> on <a href="https://unsplash.com/?utm_source=teep_blog&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a></p>`,
          });
        } else {
          replacements.push({
            match: fullMatch,
            replacement: `> [Image Placeholder: ${altText}]`,
            credit: "",
          });
        }
      } else {
        console.warn(`No photo found for query: ${query}`);

        // Retry with a generic keyword from category
        const catMatch = articleContent.match(/categories:\s*\[(.*?)\]/);
        const category = catMatch
          ? catMatch[1].split(",")[0].replace(/['"]/g, "").trim()
          : "technology";
        console.log(`Retrying with generic category: ${category}`);

        const fallbackPhoto = await scraper.searchPhoto(category);

        if (fallbackPhoto) {
          const ext = "jpg";
          const suffix = Math.random().toString(36).substring(7);
          const filename = `${topicData.slug}-fallback-${suffix}.${ext}`;
          const outputPath = path.join(generatedDir, filename);

          const success = await downloadImage(fallbackPhoto.url, outputPath);
          if (success) {
            usedPhotoUrls.add(fallbackPhoto.url);
            replacements.push({
              match: fullMatch,
              replacement: `![${altText}](/generated/${filename})`,
              credit: `<p class="text-xs text-center text-gray-500 mt-2">Photo by <a href="${fallbackPhoto.photographerUrl}?utm_source=teep_blog&utm_medium=referral" target="_blank" rel="noopener noreferrer">${fallbackPhoto.photographer}</a> on <a href="https://unsplash.com/?utm_source=teep_blog&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a></p>`,
            });
          } else {
            replacements.push({
              match: fullMatch,
              replacement: `> [Image Placeholder: ${altText}]`,
              credit: "",
            });
          }
        } else {
          replacements.push({
            match: fullMatch,
            replacement: `> *${altText}*`,
            credit: "",
          });
        }
      }
    }

    // Apply replacements
    for (const item of replacements) {
      const finalCheck = item.credit
        ? `${item.replacement}\n${item.credit}`
        : item.replacement;
      articleContent = articleContent.replace(item.match, finalCheck);
    }

    // Save File
    const filename = `${currentDateStr}-${topicData.slug}.md`;
    const filepath = path.join(postsDir, filename);

    // Ensure the posts directory exists (especially for CI/CD environments)
    try {
      await fs.access(postsDir);
    } catch {
      await fs.mkdir(postsDir, { recursive: true });
    }

    await fs.writeFile(filepath, articleContent, "utf8");
    console.log(`Successfully generated article: ${filepath}`);

    if (process.env.GITHUB_OUTPUT) {
      const slug = `${currentDateStr}-${topicData.slug}`;
      const url = `https://applygogo.com/blog/${slug}`;
      await fs.appendFile(process.env.GITHUB_OUTPUT, `new_post_url=${url}\n`);
      console.log(`Exported new_post_url=${url} to GITHUB_OUTPUT`);
    }
  } catch (error) {
    console.error("Error generating blog post:", error);
    process.exit(1);
  } finally {
    await scraper.close();
  }
}

generateBlog();
