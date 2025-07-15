import React from "react";
import { Check, Crown, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: PricingFeature[];
  buttonText: string;
  buttonVariant?: "default" | "premium" | "outline";
  popular?: boolean;
  premium?: boolean;
  onButtonClick?: () => void;
  className?: string;
}

export function PricingCard({
  title,
  price,
  period = "/month",
  description,
  features,
  buttonText,
  buttonVariant = "default",
  popular = false,
  premium = false,
  onButtonClick,
  className = "",
}: PricingCardProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Popular badge */}
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-primary text-primary-foreground px-6 py-2 font-bold animate-pulse">
            MOST POPULAR
          </Badge>
        </div>
      )}

      {/* Premium border */}
      <div className={cn(
        premium ? "gradient-border hover-lift" : "border border-border",
        "rounded-2xl transition-all duration-300"
      )}>
        <Card className={cn(
          "h-full",
          premium ? "gradient-border-content" : "bg-card",
          "border-0"
        )}>
          <CardHeader className="text-center pb-8">
            {/* Title with premium icon */}
            <div className="flex items-center justify-center space-x-2 mb-2">
              {premium && <Crown className="w-5 h-5 text-primary" />}
              <h3 className={cn(
                "text-2xl font-bold",
                premium ? "text-gradient" : "text-foreground"
              )}>
                {title}
              </h3>
            </div>

            {/* Price */}
            <div className="mb-4">
              <span className={cn(
                "text-4xl font-bold",
                premium ? "text-gradient" : "text-foreground"
              )}>
                {price}
              </span>
              <span className="text-muted-foreground text-lg">{period}</span>
            </div>

            {/* Description */}
            <p className="text-muted-foreground">{description}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features list */}
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                    feature.included 
                      ? "bg-primary/20 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    <Check className="w-3 h-3" />
                  </div>
                  <span className={cn(
                    feature.included ? "text-foreground" : "text-muted-foreground line-through",
                    feature.highlight && "font-semibold text-primary"
                  )}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button
              onClick={onButtonClick}
              className={cn(
                "w-full py-4 font-semibold text-lg rounded-xl transition-all duration-300",
                buttonVariant === "premium" && [
                  "bg-gradient-to-r from-primary to-yellow-400",
                  "text-primary-foreground hover:shadow-lg",
                  "premium-glow hover:scale-105"
                ],
                buttonVariant === "outline" && [
                  "border-2 border-primary/30 bg-transparent",
                  "text-primary hover:bg-primary/10"
                ]
              )}
              variant={buttonVariant === "default" ? "default" : "ghost"}
            >
              {buttonVariant === "premium" && <Crown className="w-4 h-4 mr-2" />}
              {buttonText}
            </Button>

            {/* Additional info for premium */}
            {premium && (
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Priority support & advanced features</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ComparisonTable({ className = "" }: { className?: string }) {
  const features = [
    { name: "AI Questions per month", free: "50", premium: "150" },
    { name: "AI Model", free: "Mistral Small", premium: "GPT-4o Turbo" },
    { name: "Document Analysis", free: "❌", premium: "✅" },
    { name: "PDF Contract Review", free: "❌", premium: "✅" },
    { name: "Multi-language Support", free: "✅", premium: "✅" },
    { name: "Priority Support", free: "❌", premium: "✅" },
    { name: "No Advertisements", free: "❌", premium: "✅" },
    { name: "Advanced Legal Research", free: "❌", premium: "✅" },
  ];

  return (
    <div className={cn("glass-morphism rounded-2xl p-8", className)}>
      <h3 className="text-2xl font-bold text-center mb-8 text-gradient">
        Feature Comparison
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-4 px-4 font-semibold">Feature</th>
              <th className="text-center py-4 px-4 font-semibold">Free</th>
              <th className="text-center py-4 px-4 font-semibold text-gradient">Elite</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index} className="border-b border-border/30">
                <td className="py-4 px-4 text-foreground">{feature.name}</td>
                <td className="py-4 px-4 text-center text-muted-foreground">{feature.free}</td>
                <td className="py-4 px-4 text-center text-primary font-semibold">{feature.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
