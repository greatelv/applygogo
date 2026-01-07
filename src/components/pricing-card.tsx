"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
  isLoading?: boolean;
}

export function PricingCard({
  title,
  price,
  description,
  features,
  isPopular,
  buttonText = "시작하기",
  onButtonClick,
  isLoading,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col relative overflow-hidden",
        isPopular ? "border-primary shadow-lg scale-105 z-10" : "border-border"
      )}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
          POPULAR
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight">{price}</span>
          <span className="text-muted-foreground text-sm font-semibold">
            /월
          </span>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isPopular ? "default" : "outline"}
          onClick={onButtonClick}
          disabled={isLoading}
        >
          {isLoading ? "처리 중..." : buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
