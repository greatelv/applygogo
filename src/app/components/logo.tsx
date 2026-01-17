import Link from "next/link";
import { cn } from "@/lib/utils";

import Image from "next/image";

interface LogoProps {
  className?: string;
  href?: string;
  alt?: string;
}

export function Logo({ className, href = "/", alt = "ApplyGogo" }: LogoProps) {
  const basePath =
    process.env.NEXT_PUBLIC_BASE_URL?.replace("http://localhost:3000", "")
      .replace("https://applygogo.com", "")
      .replace(/\/$/, "") || "";

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 hover:opacity-80 transition-opacity",
        className,
      )}
    >
      <div className="relative h-8 w-32">
        <Image
          src={`${basePath}/logo-for-light.svg`}
          alt={alt}
          fill
          className="object-contain dark:hidden"
          priority
        />
        <Image
          src={`${basePath}/logo-for-dark.svg`}
          alt={alt}
          fill
          className="object-contain hidden dark:block"
          priority
        />
      </div>
    </Link>
  );
}
