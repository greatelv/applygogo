import type { Metadata } from "next";
import "../styles/index.css";
import { Providers } from "./providers";
import NextTopLoader from "nextjs-toploader";
import { GoogleAnalytics, MicrosoftClarity } from "./components/analytics";

const title = "ApplyGogo - AI-Powered Korean Resume Builder for Global Talents";
const description =
  "Convert your English resume to professional Korean in minutes. AI-powered localization optimized for the Korean job market.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  title: {
    default: title,
    template: "%s | ApplyGogo",
  },
  description: description,
  keywords: [
    "English to Korean resume",
    "Korean resume builder",
    "AI resume translation",
    "Korea job application",
    "Korean CV builder",
    "English resume localization",
    "Korean job market",
    "Global talent Korea",
    "Professional Korean resume",
    "AI Korean translation",
  ],
  authors: [{ name: "ApplyGogo Team" }],
  creator: "ApplyGogo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: title,
    description: description,
    siteName: "ApplyGogo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ApplyGogo - AI Korean Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    other: {
      "naver-site-verification": "61cfbc317ca630d31a228bf870264b602c553a67",
      "msvalidate.01": "E2E86ADA9E417FFA0BA39FE15B56ABB7",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=2" },
      { url: "/favicon-16x16.png?v=2", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png?v=2", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=2" }],
  },
  manifest: "/site.webmanifest?v=2",
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <GoogleAnalytics />
        <MicrosoftClarity />
        <NextTopLoader
          color="#2563eb"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563eb,0 0 5px #2563eb"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
