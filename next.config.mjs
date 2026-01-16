import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
console.log(
  "🔍 [DEBUG] Current Supabase URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);
console.log(
  "🔍 [DEBUG] Current Storage Bucket:",
  process.env.NEXT_PUBLIC_STORAGE_BUCKET
);

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default withNextIntl(nextConfig);
