"use client";

import { Sparkles } from "lucide-react";

interface BetaBannerProps {
  isConsole?: boolean;
}

export function BetaBanner({ isConsole }: BetaBannerProps) {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 text-xs text-center font-medium shadow-md">
      <p className="flex items-center justify-center gap-2">
        <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">
          BETA
        </span>
        <span className="flex items-center gap-1.5 flex-wrap justify-center text-center">
          <Sparkles className="size-3 text-yellow-300" />
          <span>
            <span className="text-yellow-300 font-bold">
              베타 런칭 기념 2만원 상당의 3일 무제한 이용권 증정!
            </span>
            {isConsole && (
              <span className="ml-1">
                마음껏 이용해보시고{" "}
                <span className="underline underline-offset-2 decoration-yellow-300/50 font-semibold">
                  좌측 하단
                </span>
                에서 서비스 의견 혹은 버그를 제보해주세요.
              </span>
            )}
          </span>
        </span>
      </p>
    </div>
  );
}
