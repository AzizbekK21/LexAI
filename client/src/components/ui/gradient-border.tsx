import { cn } from "@/lib/utils";

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  glowing?: boolean;
}

export function GradientBorder({ 
  children, 
  className, 
  innerClassName,
  glowing = false 
}: GradientBorderProps) {
  return (
    <div className={cn(
      "gradient-border",
      glowing && "glow",
      className
    )}>
      <div className={cn("gradient-border-content", innerClassName)}>
        {children}
      </div>
    </div>
  );
}
