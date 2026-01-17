/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  async rewrites() {
    return [
      {
        source: "/en/:path*",
        destination: "https://project-global.vercel.app/en/:path*", // TODO: Update this to the actual global Vercel URL
      },
      {
        source: "/en",
        destination: "https://project-global.vercel.app/en", // TODO: Update this to the actual global Vercel URL
      },
    ];
  },
};

export default nextConfig;
