import { supabaseAdmin } from "./src/lib/supabase";

async function initializeStorage() {
  const { data: buckets, error: listError } =
    await supabaseAdmin.storage.listBuckets();

  if (listError) {
    console.error("Error listing buckets:", listError);
    return;
  }

  const resumeBucket = buckets.find((b) => b.name === "resumes");

  if (!resumeBucket) {
    console.log("Bucket 'resumes' not found. Creating...");
    const { data, error } = await supabaseAdmin.storage.createBucket(
      "resumes",
      {
        public: false, // Files should be private by default
        allowedMimeTypes: ["application/pdf"],
        fileSizeLimit: 10485760, // 10MB
      }
    );

    if (error) {
      console.error("Error creating bucket:", error);
    } else {
      console.log("Bucket 'resumes' created successfully.");
    }
  } else {
    console.log("Bucket 'resumes' already exists.");
  }
}

initializeStorage();
