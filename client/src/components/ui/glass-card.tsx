import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "strong";
  hoverable?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  variant = "default",
  hoverable = false 
}: GlassCardProps) {
  return (
    <div className={cn(
      variant === "strong" ? "glass-strong" : "glass",
      "rounded-xl",
      hoverable && "hover-lift cursor-pointer",
      className
    )}>
      {children}
    </div>
  );
}
