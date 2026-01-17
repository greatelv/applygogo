"use client";

import { ThemeProvider } from "@/app/components/theme-provider";
import { AppProvider } from "@/app/context/app-context";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";

import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";

export function Providers({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}) {
  return (
    <SessionProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppProvider>
            {children}
            <Toaster />
          </AppProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
