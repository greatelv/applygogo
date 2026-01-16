import { createClient } from "@supabase/supabase-js";

// Service role client for bypass RLS and manage buckets
export const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  console.log("[getSupabaseAdmin] Initializing client");
  console.log("[getSupabaseAdmin] URL:", supabaseUrl);
  console.log(
    "[getSupabaseAdmin] Key (Start):",
    supabaseServiceKey?.substring(0, 10)
  );

  return createClient(supabaseUrl, supabaseServiceKey);
};
