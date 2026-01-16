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
  targetLink?: string;
  buttonText?: string;
  isSponsored?: boolean;
  title?: string;
  description?: string;
  relatedServices?: string[];
}

export function AsideCTA({ targetLink, isSponsored }: AsideCTAProps) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-4">
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">
              {"국문 Resume, 영문으로 바로 변환"}
            </CardTitle>
            <CardDescription className="text-sm">
              PDF Resume를 올려보세요.
              <br />
              지원고고에서 <b>국제 표준 Resume</b>로 변환해드립니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CTAButton
              targetLink={targetLink || "/"}
              buttonText="Free로 변환하기"
              isSponsored={isSponsored}
              variant="sticky"
            />
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
