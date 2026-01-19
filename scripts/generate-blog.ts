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
    "Please set it in .env file (local) or as an environment variable (CI/CD)",
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
  modelName: string = "gemini-3-flash-preview",
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
      `Primary model (${modelName}) failed (${status}). Trying fallback (${fallbackModel})...`,
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
  outputPath: string,
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
      }`,
    );
  }
  return false;
}

// SVG Generation Removed by request

// Helper: Load Prompt Template
// ... (previous imports)

// Helper: Load Prompt Template
async function loadPrompt(
  name: string,
  variables: Record<string, any>,
): Promise<string> {
  const promptPath = path.join(process.cwd(), "scripts/prompts", `${name}.md`);
  let content = await fs.readFile(promptPath, "utf-8");

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{${key}}}`, "g");
    content = content.replace(placeholder, String(value));
  }

  return content;
}

async function generateBlogForLocale(locale: string) {
  const scraper = new UnsplashScraper();
  console.log(`\n=== Starting Blog Generation for Locale: ${locale} ===\n`);

  try {
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
      "0",
    )}-${String(currentDay).padStart(2, "0")}`;
    const currentDateKorean = `${currentYear}년 ${currentMonth}월`;

    // Generate Unix Timestamp (milliseconds)
    const currentIsoDate = now.getTime();

    // 1. Generate Topic
    console.log(`[${locale}] Generating topic...`);

    // Define posts directory based on locale
    const postsDir = path.join(process.cwd(), `content/posts/${locale}`);
    let existingTitles: string[] = [];

    // Ensure the posts directory exists
    try {
      await fs.access(postsDir);
    } catch {
      await fs.mkdir(postsDir, { recursive: true });
    }

    try {
      const files = await fs.readdir(postsDir);
      existingTitles = files.map((f) =>
        f.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(".md", ""),
      );
    } catch (e) {
      console.log(`[${locale}] No existing posts found or error reading dir.`);
    }

    // Handle Manual Topic Override
    const manualTopic = process.env.MANUAL_TOPIC || "";

    if (manualTopic) {
      console.log(`\n!!! MANUAL TOPIC DETECTED: "${manualTopic}" !!!\n`);
    }

    // Determine prompt names based on locale
    const topicPromptName =
      locale === "ko" ? "topic-generation" : `topic-generation-${locale}`;
    const articlePromptName =
      locale === "ko" ? "article-generation" : `article-generation-${locale}`;

    const topicPrompt = await loadPrompt(topicPromptName, {
      manualTopic,
      existingTitles: existingTitles.join(", "),
      currentDateKorean,
      currentDateStr,
      currentYear,
    });

    const result = await generateWithRetry(topicPrompt);
    const text = (result.candidates?.[0]?.content?.parts?.[0]?.text || "")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let topicData;
    try {
      topicData = JSON.parse(text);
    } catch (e) {
      console.error(`[${locale}] Failed to parse topic JSON. Raw text:`, text);
      throw e;
    }

    console.log(`[${locale}] Selected Topic: ${topicData.title}`);

    // Sanitize title for YAML (escape double quotes)
    const safeTitle = topicData.title.replace(/"/g, '\\"');

    // Handle null/missing targetServiceId (Mainly for KO legacy logic, but kept for compatibility)
    const isServiceReview =
      topicData.targetServiceId &&
      topicData.targetServiceId !== "null" &&
      topicData.targetServiceId !== "msg_missing";
    const targetServiceId = isServiceReview ? topicData.targetServiceId : "";

    const articleType = topicData.articleType || "service_guide";

    const officialWebsiteUrl = isServiceReview
      ? "Target Service Official URL"
      : "";
    const targetLinkVariable = "";
    const buttonText = isServiceReview ? `${targetServiceId} Link` : "";

    // 3. Write Article
    console.log(`[${locale}] Writing article...`);

    const articlePrompt = await loadPrompt(articlePromptName, {
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
    articleContent = articleContent
      .replace(/^```[a-z]*\n/i, "")
      .replace(/\n```$/g, "")
      .trim();

    const frontmatterRegex = /^---\n[\s\S]*?\n---/m;
    const fmMatch = articleContent.match(frontmatterRegex);

    if (fmMatch) {
      articleContent = articleContent.substring(fmMatch.index!);
    } else {
      console.warn(
        `[${locale}] Warning: Could not find valid frontmatter block. Constructing fallback frontmatter.`,
      );
      // Fallback: Construct frontmatter from topicData
      const fallbackFrontmatter = `---
title: "${safeTitle}"
description: "${topicData.focus || safeTitle}"
date: ${currentIsoDate}
thumbnail: "/placeholder.svg?height=600&width=1200"
author: "ApplyGoGo Team"
officialWebsiteUrl: "https://applygogo.com"
tags: ["Korea Job", "Career"]
categories: ["Career"]
targetLink: "https://applygogo.com"
isSponsored: false
---

`;
      articleContent = fallbackFrontmatter + articleContent;
    }

    articleContent = articleContent.trim();

    // --- Dynamic Image Processing ---
    console.log(`[${locale}] Processing Images...`);

    const generatedDir = path.join(process.cwd(), "public/generated");
    try {
      await fs.access(generatedDir);
    } catch {
      await fs.mkdir(generatedDir, { recursive: true });
    }

    const urlMatch = articleContent.match(
      /officialWebsiteUrl:\s*["']?([^"'\n]+)["']?/,
    );
    const targetUrl = urlMatch ? urlMatch[1] : null;
    let heroImagePath = "";

    await scraper.init();

    // --- Priority 1: Explicit Keyword ---
    if (topicData.thumbnailSearchKeyword) {
      console.log(
        `[${locale}] [Hero Strategy] Priority 1: Searching Unsplash with keyword: "${topicData.thumbnailSearchKeyword}"`,
      );
      try {
        const photo = await scraper.searchPhoto(
          topicData.thumbnailSearchKeyword,
        );
        if (photo) {
          // Use slug for filename safety
          const safeSlug = topicData.slug || `post-${Date.now()}`;
          const filename = `${safeSlug}-hero.jpg`;
          const outputPath = path.join(generatedDir, filename);

          const success = await downloadImage(photo.url, outputPath);
          if (success) {
            heroImagePath = `/generated/${filename}`;
            console.log(
              `[${locale}] [Hero Strategy] Success: Saved Unsplash Hero Image.`,
            );
          }
        }
      } catch (e) {
        console.error(`[${locale}] [Hero Strategy] Priority 1 Error:`, e);
      }
    }

    // --- Priority 2: OG Image ---
    if (!heroImagePath && targetUrl && targetUrl !== "https://applygogo.com") {
      // Skip OG fetch for own domain placeholder
      console.log(
        `[${locale}] [Hero Strategy] Priority 2: Attempting OG Image from ${targetUrl}`,
      );
      const safeSlug = topicData.slug || `post-${Date.now()}`;
      const ogFilename = `${safeSlug}-og.jpg`;
      const ogPath = path.join(generatedDir, ogFilename);
      const success = await fetchOgImage(targetUrl, ogPath);
      if (success) {
        heroImagePath = `/generated/${ogFilename}`;
        console.log(`[${locale}] [Hero Strategy] Success: Saved OG Image.`);
      }
    }

    // --- Priority 3: Unsplash Fallbacks ---
    if (!heroImagePath) {
      console.log(
        `[${locale}] [Hero Strategy] Priority 3: Fallback to Title/Category search...`,
      );
      try {
        let photo = await scraper.searchPhoto(topicData.title);

        if (!photo) {
          // Extract category safely
          const catMatch = articleContent.match(/categories:\s*\[(.*?)\]/);
          // Handle both quoted and unquoted category lists
          const rawCats = catMatch ? catMatch[1] : "business";
          const firstCategory =
            rawCats.split(",")[0].replace(/['"]/g, "").trim() || "business";

          console.log(
            `[${locale}] [Hero Strategy] Title search failed. Retrying with category: ${firstCategory}`,
          );
          photo = await scraper.searchPhoto(firstCategory);
        }

        if (photo) {
          const safeSlug = topicData.slug || `post-${Date.now()}`;
          const filename = `${safeSlug}-hero.jpg`;
          const outputPath = path.join(generatedDir, filename);

          const success = await downloadImage(photo.url, outputPath);
          if (success) {
            heroImagePath = `/generated/${filename}`;
            console.log(
              `[${locale}] [Hero Strategy] Success: Saved Unsplash Fallback Image.`,
            );
          }
        }
      } catch (e) {
        console.error(`[${locale}] [Hero Strategy] Priority 3 Error:`, e);
      }
    }

    if (heroImagePath) {
      articleContent = articleContent.replace(
        "![HERO](HERO_PLACEHOLDER)",
        `![${topicData.title}](${heroImagePath})`,
      );
      articleContent = articleContent.replace(
        /thumbnail:.*$/m,
        `thumbnail: "${heroImagePath}"`,
      );
    }

    // 2. Unsplash Body Images
    const unsplashRegex = /!\[(.*?)\]\(UNSPLASH:(.*?)\)/g;
    let match;
    const replacements: {
      match: string;
      replacement: string;
      credit: string;
    }[] = [];

    unsplashRegex.lastIndex = 0;
    const matches: RegExpExecArray[] = [];
    while ((match = unsplashRegex.exec(articleContent)) !== null) {
      matches.push(match);
    }

    const limitedMatches = matches.slice(0, 2);
    const usedPhotoUrls = new Set<string>();

    for (const match of limitedMatches) {
      const fullMatch = match[0];
      const altText = match[1];
      const query = match[2].trim();

      console.log(`[${locale}] Processing Unsplash Request: "${query}"`);

      let photo = await scraper.searchPhoto(query);

      if (photo && usedPhotoUrls.has(photo.url)) {
        photo = await scraper.searchPhoto(`${query} alternative`);
      }

      if (photo) {
        const ext = "jpg";
        const safeQuery = query.replace(/[^a-z0-9]/gi, "-");
        const suffix = Math.random().toString(36).substring(7);
        const safeSlug = topicData.slug || `post-${Date.now()}`;
        const filename = `${safeSlug}-${safeQuery}-${suffix}.${ext}`;
        const outputPath = path.join(generatedDir, filename);

        const success = await downloadImage(photo.url, outputPath);
        if (success) {
          usedPhotoUrls.add(photo.url);
          replacements.push({
            match: fullMatch,
            replacement: `![${altText}](/generated/${filename})`,
            credit: `<p class="text-xs text-center text-gray-500 mt-2">Photo by <a href="${photo.photographerUrl}?utm_source=applygogo_blog&utm_medium=referral" target="_blank" rel="noopener noreferrer">${photo.photographer}</a> on <a href="https://unsplash.com/?utm_source=applygogo_blog&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a></p>`,
          });
        } else {
          // Fallback text if download fails
          replacements.push({
            match: fullMatch,
            replacement: `> *${altText}*`,
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

    for (const item of replacements) {
      const finalCheck = item.credit
        ? `${item.replacement}\n${item.credit}`
        : item.replacement;
      articleContent = articleContent.replace(item.match, finalCheck);
    }

    // Save File
    const safeSlug = topicData.slug || `post-${Date.now()}`;
    const filename = `${currentDateStr}-${safeSlug}.md`;
    const filepath = path.join(postsDir, filename);

    await fs.writeFile(filepath, articleContent, "utf8");
    console.log(`[${locale}] Successfully generated article: ${filepath}`);

    // Export output only for the first one or accumulate (GitHub Output supports multiline?)
    // For now, let's export the last one or all.
    if (process.env.GITHUB_OUTPUT) {
      const url = `https://applygogo.com/${locale}/blog/${currentDateStr}-${safeSlug}`;
      await fs.appendFile(
        process.env.GITHUB_OUTPUT,
        `new_post_url_${locale}=${url}\n`,
      );
    }

    await scraper.close();
  } catch (error) {
    console.error(`[${locale}] Error generating blog post:`, error);
    // Determine if we should fail the whole process or just this locale.
    // For now, let's log and re-throw to ensure CI failure visibility.
    await scraper.close();
    throw error;
  }
}

async function main() {
  const locales = ["ko", "en", "ja"];

  // Check if a manual topic is provided
  const manualTopic = process.env.MANUAL_TOPIC;
  if (manualTopic) {
    console.log(
      "Manual topic provided. Applying to ALL locales (or specific one if logic added).",
    );
    // Warning: Providing a Korean manual topic to EN/JA models might confuse them or produce mixed results.
    // Ideally, we'd input locale-specific manual topics, but for now we assume it's unset mostly.
  }

  for (const locale of locales) {
    try {
      await generateBlogForLocale(locale);
    } catch (error) {
      console.error(`Failed to generate blog for ${locale}:`, error);
      process.exitCode = 1; // Mark process as failed but continue trying others if needed
    }
  }
}

main();
