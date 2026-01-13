import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    process.exit(1);
  }

  // Checking typical known models if listModels isn't easily accessible via simple client.
  // Actually the SDK has no direct 'listModels' on the client instance usually, it's on the ModelManager or requires specific call.
  // Wait, the error message literally said: "Call ListModels to see the list of available models".
  // But the JS SDK v0.24.x might not expose it on the top level class easily without looking at docs.
  // Let's try a direct fetch to the API endpoint using fetch to be sure.

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Available Models:");
    if (data.models) {
      data.models.forEach((m: any) => {
        if (
          m.supportedGenerationMethods &&
          m.supportedGenerationMethods.includes("generateContent")
        ) {
          console.log(`- ${m.name}`);
        }
      });
    } else {
      console.log("No models found or error:", data);
    }
  } catch (e) {
    console.error("Error fetching models:", e);
  }
}

main();
