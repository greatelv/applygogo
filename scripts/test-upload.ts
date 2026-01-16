import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load .env explicitly
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = "applygogo";

console.log("--- Supabase Upload Test ---");
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseServiceKey ? "Loaded (Hidden)" : "Missing"}`);
console.log(`Bucket: ${bucketName}`);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUpload() {
  const fileName = `test-upload-${Date.now()}.txt`;
  const fileContent =
    "This is a test file for ApplyGoGo Global bucket verification.";

  console.log(`\nAttempting to upload "${fileName}"...`);

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileContent, {
      contentType: "text/plain",
      upsert: true,
    });

  if (error) {
    console.error("❌ Upload Failed!");
    console.error("Error Message:", error.message);
    console.error("Error Details:", error);
  } else {
    console.log("✅ Upload Successful!");
    console.log("Path:", data.path);
    console.log("Id:", data.id);
  }
}

testUpload();
