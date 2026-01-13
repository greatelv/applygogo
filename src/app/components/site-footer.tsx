import Link from "next/link";

interface SiteFooterProps {
  simple?: boolean;
}

export function SiteFooter({ simple }: SiteFooterProps) {
  if (simple) {
    return (
      <footer className="border-t border-border py-4 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 text-[11px] text-muted-foreground">
              <div className="flex gap-4">
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors"
                >
                  이용약관
                </Link>
                <Link
                  href="/privacy"
                  className="font-bold hover:text-foreground transition-colors"
                >
                  개인정보처리방침
                </Link>
                <a
                  href="mailto:support@applygogo.com"
                  className="hover:text-foreground transition-colors"
                >
                  고객문의
                </a>
              </div>
              <div className="hidden md:block text-[10px] text-muted-foreground/60">
                © 2026 지원고고 (K-Corporation). All rights reserved.
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground/60 leading-normal text-center md:text-left">
              <span>케익코퍼레이션</span>
              <span className="mx-1.5">|</span>
              <span>대표자: 전태경</span>
              <span className="mx-1.5">|</span>
              <span>사업자등록번호: 639-34-01724</span>
              <span className="mx-1.5 hidden sm:inline">|</span>
              <br className="sm:hidden" />
              <span>주소: 서울시 성북구 동소문로 60 동방빌딩 4층</span>
              <span className="mx-1.5">|</span>
              <span>이메일: support@applygogo.com</span>
            </div>

            <div className="md:hidden text-center text-[10px] text-muted-foreground/60">
              © 2026 지원고고 (K-Corporation). All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border py-12 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            {/* Links */}
            <div className="flex gap-6 text-sm text-foreground/80">
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                이용약관
              </Link>
              <Link
                href="/privacy"
                className="font-bold hover:text-foreground transition-colors"
              >
                개인정보처리방침
              </Link>
              <a
                href="mailto:support@applygogo.com"
                className="hover:text-foreground transition-colors"
              >
                고객문의
              </a>
              {/* Blog link hidden for now
              <Link
                href="/blog"
                className="hover:text-foreground transition-colors"
              >
                블로그
              </Link>
              */}
            </div>

            {/* Business Info */}
            <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
              <p>
                <span className="font-medium">케익코퍼레이션</span>
                <span className="mx-2">|</span>
                대표자: 전태경
                <span className="mx-2">|</span>
                사업자등록번호: 639-34-01724
              </p>
              <p>
                주소: 서울시 성북구 동소문로 60 동방빌딩 4층
                <span className="mx-2">|</span>
                이메일: support@applygogo.com
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-xs text-muted-foreground">
            © 2026 지원고고 (K-Corporation). All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
