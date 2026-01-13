import axios from "axios";

const API_KEY = process.env.INDEXNOW_API_KEY || "";
const HOST = "applygogo.com";
const KEY_LOCATION = `https://${HOST}/${API_KEY}.txt`;

async function submitToIndexNow(url: string) {
  if (!url) {
    console.error("Error: URL is required");
    process.exit(1);
  }

  console.log(`Submitting ${url} to IndexNow...`);

  try {
    const payload = {
      host: HOST,
      key: API_KEY,
      keyLocation: KEY_LOCATION,
      urlList: [url],
    };

    const response = await axios.post(
      "https://api.indexnow.org/indexnow",
      payload,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
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

const urlArg = process.argv[2];
submitToIndexNow(urlArg);
