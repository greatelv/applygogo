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
        destination: "https://applygogo-global.vercel.app/en/:path*",
      },
      {
        source: "/en",
        destination: "https://applygogo-global.vercel.app/en",
      },
    ];
  },
};

export default nextConfig;
