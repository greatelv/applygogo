import Image from "next/image";
import { Card, CardContent } from "@/app/components/ui/card";
import { CTAButton } from "@/app/components/blog/cta-button";

interface BottomCTAProps {
  targetLink: string;
  buttonText: string;
  isSponsored?: boolean;
  relatedServices?: string[];
  isMobileFixed?: boolean;
}

export function BottomCTA({
  targetLink,
  buttonText,
  isSponsored,
  relatedServices,
  isMobileFixed = false,
}: BottomCTAProps) {
  return (
    <Card
      className={
        isMobileFixed
          ? "border-0 bg-transparent shadow-none"
          : "border-2 border-primary/20 bg-accent/30 shadow-lg"
      }
    >
      <CardContent className={isMobileFixed ? "p-0" : "pt-4 pb-4"}>
        <div className="space-y-3 text-center">
          <div>
            <h3 className="text-lg font-bold mb-1">지금 바로 시작하세요</h3>
            <p className="text-sm text-muted-foreground">
              더 많은 정보와 혜택을 확인해보세요
            </p>
          </div>
          <CTAButton
            targetLink={targetLink}
            buttonText={buttonText}
            isSponsored={isSponsored}
          />
        </div>
      </CardContent>
    </Card>
  );
}
