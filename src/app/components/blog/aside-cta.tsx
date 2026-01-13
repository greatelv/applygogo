import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { CTAButton } from "@/app/components/blog/cta-button";
import { SERVICES } from "@/lib/constants/services";
import { PromoCode } from "@/app/components/blog/promo-code";

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
  // Extract Korean name from service name (e.g., "Netflix (넷플릭스)" -> "넷플릭스")
  const extractKoreanName = (name: string): string => {
    const match = name.match(/\(([^)]+)\)/);
    return match ? match[1] : name;
  };

  // If there are related services, show all of them
  if (relatedServices && relatedServices.length > 0) {
    return (
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          {relatedServices.map((serviceId) => {
            const service = SERVICES[serviceId];
            if (!service) return null;

            return (
              <Card
                key={serviceId}
                className="border-2 border-primary/20 shadow-lg transition-all hover:border-primary/40"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-white/5 p-1">
                      <Image
                        src={service.logo}
                        alt={service.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-bold leading-tight truncate">
                        {extractKoreanName(service.name)}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1 line-clamp-1">
                        {service.category}
                      </CardDescription>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-snug">
                    {service.description}
                  </p>
                </CardHeader>
                <CardContent>
                  {service.isFromGamsgo && <PromoCode />}
                  <CTAButton
                    targetLink={service.cta.url}
                    buttonText={service.cta.text}
                    isSponsored={isSponsored}
                    variant="sticky"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </aside>
    );
  }

  // Fallback: show generic CTA if no related services
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
