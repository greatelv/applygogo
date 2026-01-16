import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
}

export function Logo({ className, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 hover:opacity-80 transition-opacity",
        className
      )}
    >
      <div className="flex items-center font-bold text-xl tracking-tight">
        <span className="text-blue-600">Apply</span>
        <span className="text-foreground">Gogo</span>
      </div>
    </Link>
  );
}
