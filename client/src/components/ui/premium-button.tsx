import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface PremiumButtonProps extends ButtonProps {
  gradient?: boolean;
  glow?: boolean;
}

export function PremiumButton({ 
  children, 
  className, 
  gradient = true,
  glow = false,
  ...props 
}: PremiumButtonProps) {
  return (
    <Button
      className={cn(
        gradient && "button-premium",
        glow && "glow",
        "font-semibold transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
