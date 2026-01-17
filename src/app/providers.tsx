"use client";

import { ThemeProvider } from "./components/theme-provider";
import { AppProvider } from "./context/app-context";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/en/api/auth">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
