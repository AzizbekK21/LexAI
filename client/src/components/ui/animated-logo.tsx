import React from "react";
import { Scale, Zap, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "text";
  className?: string;
  animated?: boolean;
}

export function AnimatedLogo({ 
  size = "md", 
  variant = "full", 
  className = "", 
  animated = true 
}: AnimatedLogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-6xl",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const neuralSizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
    xl: "w-6 h-6",
  };

  if (variant === "icon") {
    return (
      <div className={cn("relative", className)}>
        <Scale 
          className={cn(
            iconSizeClasses[size], 
            "text-primary",
            animated && "logo-scales"
          )} 
        />
        <div className={cn(
          neuralSizeClasses[size],
          "absolute -top-1 -right-1 bg-primary rounded-full neural-network"
        )} />
        <div className={cn(
          neuralSizeClasses[size],
          "absolute -bottom-1 -left-1 bg-platinum rounded-full neural-network opacity-70"
        )} 
        style={{ animationDelay: animated ? "1s" : "0s" }} />
      </div>
    );
  }

  if (variant === "text") {
    return (
      <span className={cn(
        sizeClasses[size], 
        "font-display font-bold text-gradient",
        className
      )}>
        LexAI
      </span>
    );
  }

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="relative">
        <Scale 
          className={cn(
            iconSizeClasses[size], 
            "text-primary",
            animated && "logo-scales"
          )} 
        />
        <div className={cn(
          neuralSizeClasses[size],
          "absolute -top-1 -right-1 bg-primary rounded-full",
          animated && "neural-network"
        )} />
        <div className={cn(
          neuralSizeClasses[size],
          "absolute -bottom-1 -left-1 bg-platinum rounded-full",
          animated && "neural-network opacity-70"
        )} 
        style={{ animationDelay: animated ? "1s" : "0s" }} />
      </div>
      <span className={cn(
        sizeClasses[size], 
        "font-display font-bold text-gradient"
      )}>
        LexAI
      </span>
    </div>
  );
}

export function LoadingLogo({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative">
        <Scale className="w-8 h-8 text-primary animate-spin" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-platinum rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export function SuccessLogo({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative">
        <Scale className="w-8 h-8 text-green-500" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
        <Zap className="absolute -bottom-1 -left-1 w-3 h-3 text-primary animate-pulse" />
      </div>
    </div>
  );
}

export function ThinkingLogo({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="relative">
        <Brain className="w-6 h-6 text-primary animate-pulse" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
      </div>
      <span className="text-sm text-muted-foreground">AI is thinking...</span>
    </div>
  );
}
