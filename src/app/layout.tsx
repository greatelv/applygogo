import type { Metadata } from "next";
import "../styles/index.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ApplyGogo - Global Standard Resume Builder",
  description: "AI-powered resume builder for global opportunities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
