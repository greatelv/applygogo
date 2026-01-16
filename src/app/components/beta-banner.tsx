"use client";

import { Sparkles } from "lucide-react";

interface BetaBannerProps {
  isConsole?: boolean;
}

export function BetaBanner({ isConsole }: BetaBannerProps) {
  return (
    <div className="sm:sticky sm:top-0 z-50 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 text-xs text-center font-medium shadow-md">
      <div className="flex items-center justify-center gap-2">
        <span className="hidden sm:inline-block bg-white/20 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold shrink-0">
          BETA
        </span>
        <div className="flex items-center justify-center gap-1.5 text-center leading-tight">
          <Sparkles className="size-3 text-yellow-300 shrink-0" />
          <span className="inline-block">
            <span className="text-yellow-300 font-bold">
              <span className="sm:hidden">Beta Special: </span>
              <span className="hidden sm:inline">
                Celebrating Beta Launch!{" "}
              </span>
              <span className="hidden sm:inline">Worth $15, </span>
              Free 3-Day Unlimited Pass!
            </span>
            {isConsole && (
              <span className="hidden sm:inline ml-1">
                Enjoy full access and{" "}
                <span className="underline underline-offset-2 decoration-yellow-300/50 font-semibold">
                  report feedback/bugs
                </span>{" "}
                in the bottom left corner.
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
