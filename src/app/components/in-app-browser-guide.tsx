"use client";

import { useInAppBrowser } from "@/hooks/use-in-app-browser";
import { Copy, ExternalLink, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function InAppBrowserGuide() {
  const { isInAppBrowser } = useInAppBrowser();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  const isLandingPage = pathname === "/";

  useEffect(() => {
    // Don't show on landing page
    if (isLandingPage) {
      setIsVisible(false);
      document.body.style.overflow = "unset";
      return;
    }

    if (isInAppBrowser) {
      setIsVisible(true);
      // Disable scrolling when the guide is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isInAppBrowser, isLandingPage]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("링크가 복사되었습니다. 주소창에 붙여넣어 주세요.");
    } catch (err) {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 p-6 text-white backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <div className="relative">
          {/* Pulsing circle animation behind the icon */}
          <div className="absolute -inset-4 animate-ping rounded-full bg-blue-500/20 duration-1000" />
          <div className="relative rounded-full bg-blue-600 p-4 shadow-lg shadow-blue-500/30">
            <ExternalLink className="h-10 w-10 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold leading-tight">
            외부 브라우저에서
            <br />
            실행해주세요
          </h2>
          <p className="text-gray-300">
            구글 로그인은 웹 보안 정책상
            <br />
            인앱 브라우저를 지원하지 않습니다.
            <br />
            <span className="text-blue-400 font-medium">
              크롬(Chrome)
            </span> 또는{" "}
            <span className="text-blue-400 font-medium">사파리(Safari)</span>로
            <br />
            접속해주세요.
          </p>
        </div>

        <div className="w-full space-y-3 rounded-2xl bg-white/10 p-6 backdrop-blur-md">
          <div className="flex items-center gap-4 text-left">
            <div className="rounded-full bg-gray-800 p-2">
              <Menu className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">1. 더보기 버튼 클릭</p>
              <p className="text-xs text-gray-400">
                화면 우측 상단 또는 하단의 점 3개 메뉴
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-left">
            <div className="rounded-full bg-gray-800 p-2">
              <ExternalLink className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">
                2. 다른 브라우저로 열기 클릭
              </p>
              <p className="text-xs text-gray-400">
                Safari / Chrome / 시스템 브라우저 등
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleCopyLink}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 font-bold text-black transition-transform active:scale-95"
        >
          <Copy className="h-5 w-5" />
          현재 링크 복사하기
        </button>
      </div>
    </div>
  );
}
