import React from "react";
import { Scale, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumLogoProps {
  className?: string;
  showCrown?: boolean;
  showSparkles?: boolean;
  animated?: boolean;
}

export function PremiumLogo({ 
  className = "", 
  showCrown = true, 
  showSparkles = true,
  animated = true 
}: PremiumLogoProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Main logo container */}
      <div className="relative">
        {/* Crown for premium indicator */}
        {showCrown && (
          <Crown 
            className={cn(
              "absolute -top-2 -right-1 w-4 h-4 text-primary z-10",
              animated && "animate-pulse"
            )} 
          />
        )}
        
        {/* Premium gradient background */}
        <div className="w-12 h-12 bg-gradient-to-br from-primary via-yellow-400 to-primary rounded-2xl flex items-center justify-center premium-glow">
          <Scale className="w-7 h-7 text-primary-foreground" />
        </div>

        {/* Sparkles around the logo */}
        {showSparkles && (
          <>
            <Sparkles 
              className={cn(
                "absolute -top-1 -left-1 w-3 h-3 text-primary opacity-80",
                animated && "animate-ping"
              )}
              style={{ animationDelay: "0s" }}
            />
            <Sparkles 
              className={cn(
                "absolute -bottom-1 -right-1 w-2 h-2 text-yellow-400 opacity-60",
                animated && "animate-ping"
              )}
              style={{ animationDelay: "1s" }}
            />
            <Sparkles 
              className={cn(
                "absolute top-1 right-3 w-2 h-2 text-primary opacity-70",
                animated && "animate-ping"
              )}
              style={{ animationDelay: "2s" }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export function PremiumBadge({ className = "" }: { className?: string }) {
  return (
    <div className={cn(
      "inline-flex items-center space-x-2 px-4 py-2 rounded-full",
      "bg-gradient-to-r from-primary/20 to-yellow-400/20",
      "border border-primary/30 backdrop-blur-sm",
      className
    )}>
      <Crown className="w-4 h-4 text-primary" />
      <span className="text-sm font-semibold text-primary">Premium</span>
    </div>
  );
}

export function EliteBadge({ className = "" }: { className?: string }) {
  return (
    <div className={cn(
      "inline-flex items-center space-x-2 px-4 py-2 rounded-full",
      "bg-gradient-to-r from-primary to-yellow-400",
      "text-primary-foreground font-bold text-sm",
      "premium-glow animate-glow",
      className
    )}>
      <Crown className="w-4 h-4" />
      <span>LexAI Elite</span>
    </div>
  );
}
