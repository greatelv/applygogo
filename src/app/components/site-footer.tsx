import Link from "next/link";

interface SiteFooterProps {
  simple?: boolean;
}

export function SiteFooter({ simple }: SiteFooterProps) {
  if (simple) {
    return (
      <footer className="border-t border-border p-4 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 text-[11px] text-muted-foreground">
              <div className="flex gap-4">
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/privacy"
                  className="font-bold hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
                <a
                  href="mailto:patakeique@gmail.com"
                  className="hover:text-foreground transition-colors"
                >
                  Contact Us
                </a>
              </div>
              <div className="hidden md:block text-[10px] text-muted-foreground/60">
                © 2026 ApplyGogo (K-Corporation). All rights reserved.
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground/60 leading-normal text-center md:text-left">
              <span>케익코퍼레이션</span>
              <span className="mx-1.5">|</span>
              <span>CEO: 전태경</span>
              <span className="mx-1.5">|</span>
              <span>Business Number: 639-34-01724</span>
              <span className="mx-1.5 hidden sm:inline">|</span>
              <br className="sm:hidden" />
              <span>Address: 서울시 성북구 동소문로 60 동방빌딩 4층</span>
              <span className="mx-1.5">|</span>
              <span>Email: patakeique@gmail.com</span>
            </div>

            <div className="md:hidden text-center text-[10px] text-muted-foreground/60">
              © 2026 ApplyGogo (K-Corporation). All rights reserved.
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
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="font-bold hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <a
                href="mailto:patakeique@gmail.com"
                className="hover:text-foreground transition-colors"
              >
                Contact Us
              </a>
              <Link
                href="/company"
                className="hover:text-foreground transition-colors"
              >
                Company
              </Link>
              <Link
                href="/introduction"
                className="hover:text-foreground transition-colors"
              >
                Service Info
              </Link>
              <Link
                href="/blog"
                className="hover:text-foreground transition-colors"
              >
                Blog
              </Link>
            </div>

            {/* Business Info */}
            <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
              <p>
                <span className="font-medium">케익코퍼레이션</span>
                <span className="mx-2">|</span>
                CEO: 전태경
                <span className="mx-2">|</span>
                Business Number: 639-34-01724
              </p>
              <p>
                Address: 서울시 성북구 동소문로 60 동방빌딩 4층
                <span className="mx-2">|</span>
                Email: patakeique@gmail.com
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-xs text-muted-foreground">
            © 2026 ApplyGogo (K-Corporation). All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
