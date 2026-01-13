import Image from "next/image";
import { Card, CardContent } from "@/app/components/ui/card";
import { CTAButton } from "@/app/components/blog/cta-button";
import { SERVICES } from "@/lib/constants/services";
import { PromoCode } from "@/app/components/blog/promo-code";

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
  // If there are related services, show all of them (or just first one for mobile fixed)
  if (relatedServices && relatedServices.length > 0) {
    // For mobile fixed, only show the first service with compact design
    const servicesToShow = isMobileFixed
      ? relatedServices.slice(0, 1)
      : relatedServices;

    return (
      <div className={isMobileFixed ? "space-y-0" : "space-y-6"}>
        {servicesToShow.map((serviceId) => {
          const service = SERVICES[serviceId];
          if (!service) return null;

          return (
            <Card
              key={serviceId}
              className={
                isMobileFixed
                  ? "border-0 bg-transparent shadow-none"
                  : "border-2 border-primary/20 bg-accent/30 shadow-lg"
              }
            >
              <CardContent className={isMobileFixed ? "p-0" : "p-6"}>
                <div
                  className={
                    isMobileFixed ? "flex items-center gap-3" : "space-y-4"
                  }
                >
                  {isMobileFixed ? (
                    <>
                      {/* Mobile Fixed: Logo + Button only */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={service.logo}
                          alt={service.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <CTAButton
                          targetLink={service.cta.url}
                          buttonText={service.cta.text}
                          isSponsored={isSponsored}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Desktop: Logo + Text + Button */}
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={service.logo}
                            alt={service.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold mb-1 truncate">
                            {service.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      {/* Bottom block: Button */}
                      {service.isFromGamsgo && <PromoCode />}
                      <CTAButton
                        targetLink={service.cta.url}
                        buttonText={service.cta.text}
                        isSponsored={isSponsored}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Fallback: show generic CTA if no related services
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
