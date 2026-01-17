import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ko", "en", "ja"],
  defaultLocale: "ko",
  localeDetection: process.env.NODE_ENV !== "development",
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
