import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "applygogo";

console.log("Checking bucket:", bucketName);
console.log("URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    console.error("Error listing buckets:", error);
    return;
  }

  const bucketExists = buckets.some((b) => b.name === bucketName);

  if (bucketExists) {
    console.log(`Bucket '${bucketName}' already exists.`);
  } else {
    console.log(`Bucket '${bucketName}' does not exist. Creating...`);
    const { data, error: createError } = await supabase.storage.createBucket(
      bucketName,
      {
        public: true,
        fileSizeLimit: 5242880,
        allowedMimeTypes: ["application/pdf"],
      }
    );

    if (createError) {
      console.error("Error creating bucket:", createError);
    } else {
      console.log(`Bucket '${bucketName}' created successfully.`);
    }
  }
}

checkAndCreateBucket();
