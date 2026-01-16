import Link from "next/link";
import { cn } from "@/lib/utils";

import Image from "next/image";

interface LogoProps {
  className?: string;
  href?: string;
  alt?: string;
}

export function Logo({ className, href = "/", alt = "ApplyGogo" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 hover:opacity-80 transition-opacity",
        className
      )}
    >
      <div className="relative h-8 w-32">
        <Image
          src="/logo-for-light.svg"
          alt={alt}
          fill
          className="object-contain dark:hidden"
          priority
        />
        <Image
          src="/logo-for-dark.svg"
          alt={alt}
          fill
          className="object-contain hidden dark:block"
          priority
        />
      </div>
    </Link>
  );
}
