/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  async rewrites() {
    // Check if the current environment is global site
    const isGlobal = process.env.AUTH_URL?.endsWith("/en");

    if (isGlobal) {
      // Global Site: Handle /en internally
      return [
        {
          source: "/en/:path*",
          destination: "/:path*",
        },
        {
          source: "/en",
          destination: "/",
        },
      ];
    }

    // KR Site: Proxy to Global Site
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
