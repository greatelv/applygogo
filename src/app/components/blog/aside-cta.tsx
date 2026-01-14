import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { CTAButton } from "@/app/components/blog/cta-button";

interface AsideCTAProps {
  targetLink: string;
  buttonText: string;
  isSponsored?: boolean;
  title?: string;
  description?: string;
  relatedServices?: string[];
}

export function AsideCTA({
  targetLink,
  buttonText,
  isSponsored,
  title,
  description,
  relatedServices,
}: AsideCTAProps) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-4">
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">{title || "특별 혜택"}</CardTitle>
            <CardDescription className="text-sm">
              {description || "지금 바로 확인하고 할인 혜택을 받아보세요!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CTAButton
              targetLink={targetLink}
              buttonText={buttonText}
              isSponsored={isSponsored}
              variant="sticky"
            />
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
