import axios from "axios";

const API_KEY = process.env.INDEXNOW_API_KEY || "";
const HOST = process.env.INDEXNOW_HOST || "applygogo.com";
const KEY_LOCATION = `https://${HOST}/${API_KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;

async function submitToIndexNow(urls: string[]) {
  if (!API_KEY) {
    console.error("Error: INDEXNOW_API_KEY env var is not set");
    process.exit(0);
  }

  const cleaned = Array.from(
    new Set(urls.map((u) => u?.trim()).filter((u): u is string => !!u)),
  );
  if (cleaned.length === 0) {
    console.error("Error: at least one URL is required");
    process.exit(0);
  }

  // Always notify the sitemap so receiving engines re-fetch the full URL set.
  if (!cleaned.includes(SITEMAP_URL)) cleaned.push(SITEMAP_URL);

  console.log(`Submitting ${cleaned.length} URL(s) to IndexNow:`);
  for (const u of cleaned) console.log(`  - ${u}`);

  try {
    const response = await axios.post(
      "https://api.indexnow.org/indexnow",
      {
        host: HOST,
        key: API_KEY,
        keyLocation: KEY_LOCATION,
        urlList: cleaned,
      },
      {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      },
    );

    if (response.status === 200 || response.status === 202) {
      console.log("Successfully submitted to IndexNow!");
      console.log("Response:", response.status, response.statusText);
    } else {
      console.warn("IndexNow submission might have failed.");
      console.log("Response:", response.status, response.statusText);
    }
  } catch (error: any) {
    console.error("Error submitting to IndexNow:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }
    // Don't fail the workflow just because indexing failed
    process.exit(0);
  }
}

const urlArgs = process.argv.slice(2);
submitToIndexNow(urlArgs);
