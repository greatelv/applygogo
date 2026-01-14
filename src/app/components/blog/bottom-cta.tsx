import Image from "next/image";
import { Card, CardContent } from "@/app/components/ui/card";
import { CTAButton } from "@/app/components/blog/cta-button";

interface BottomCTAProps {
  targetLink?: string;
  buttonText?: string;
  isSponsored?: boolean;
  relatedServices?: string[];
  isMobileFixed?: boolean;
}

export function BottomCTA({
  targetLink,
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
            <h3 className="text-lg font-bold mb-1">
              국문 이력서, 영문으로 바로 변환
            </h3>
            <p className="text-sm text-muted-foreground">
              PDF 이력서를 올려보세요.
              <br />
              지원고고에서 <b>국제 표준 이력서</b>로 변환해드립니다.
            </p>
          </div>
          <CTAButton
            targetLink={targetLink || "/"}
            buttonText="무료로 변환하기"
            isSponsored={isSponsored}
          />
        </div>
      </CardContent>
    </Card>
  );
}
