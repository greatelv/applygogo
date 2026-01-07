"use client";

import { ThemeProvider } from "./components/theme-provider";
import { AppProvider } from "./context/app-context";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppProvider>
        {children}
        <Toaster />
      </AppProvider>
    </ThemeProvider>
  );
}
