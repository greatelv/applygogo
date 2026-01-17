import { ExternalLink } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/app/components/ui/button";

interface CTAButtonProps {
  targetLink: string;
  buttonText: string;
  isSponsored?: boolean;
  variant?: "default" | "sticky";
}

export function CTAButton({
  targetLink,
  buttonText,
  isSponsored = true,
  variant = "default",
}: CTAButtonProps) {
  const relAttribute = isSponsored ? "nofollow sponsored" : "nofollow";

  return (
    <Button
      asChild
      size={variant === "sticky" ? "lg" : "default"}
      className={`
        w-full gap-2 font-semibold relative overflow-hidden group
        bg-primary hover:bg-primary/90
        ${variant === "sticky" ? "text-base py-6" : ""}
      `}
    >
      {targetLink.startsWith("/") ? (
        <Link href={targetLink} target="_blank" rel={relAttribute}>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <span className="relative">{buttonText}</span>
          <ExternalLink className="h-4 w-4 relative" />
        </Link>
      ) : (
        <a href={targetLink} target="_blank" rel={relAttribute}>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <span className="relative">{buttonText}</span>
          <ExternalLink className="h-4 w-4 relative" />
        </a>
      )}
    </Button>
  );
}
