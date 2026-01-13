"use client";

import { useEffect, useState } from "react";

export const useInAppBrowser = () => {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userAgent = window.navigator.userAgent || window.navigator.vendor;

    // List of common in-app browser keywords
    const rules = [
      "KAKAOTALK",
      "Instagram",
      "LinkedIn",
      "Threads",
      "FBAV",
      "Line",
      "NAVER",
      "Daum",
    ];

    const isMatch = rules.some((rule) => userAgent.includes(rule));
    setIsInAppBrowser(isMatch);
  }, []);

  return { isInAppBrowser };
};
