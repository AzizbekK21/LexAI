import React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UsageProgressProps {
  current: number;
  limit: number;
  period: string;
  planType: "free" | "premium";
  className?: string;
}

export function UsageProgress({ 
  current, 
  limit, 
  period, 
  planType,
  className = "" 
}: UsageProgressProps) {
  const percentage = (current / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <Card className={cn("glass-morphism", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Usage This {period}
          </CardTitle>
          <Badge 
            variant={planType === "premium" ? "default" : "secondary"}
            className={cn(
              planType === "premium" && "bg-primary text-primary-foreground"
            )}
          >
            {planType === "premium" && <Crown className="w-3 h-3 mr-1" />}
            {planType === "premium" ? "Elite" : "Free"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Questions Used</span>
            <span className={cn(
              "font-semibold",
              isAtLimit ? "text-destructive" : isNearLimit ? "text-yellow-500" : "text-foreground"
            )}>
              {current} / {limit}
            </span>
          </div>
          
          <Progress 
            value={Math.min(percentage, 100)} 
            className={cn(
              "h-3",
              isAtLimit && "bg-destructive/20"
            )}
          />
        </div>

        {/* Status indicator */}
        <div className="flex items-center space-x-2">
          {isAtLimit ? (
            <>
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive font-medium">
                Limit reached
              </span>
            </>
          ) : isNearLimit ? (
            <>
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-500 font-medium">
                Near limit
              </span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500 font-medium">
                Good usage
              </span>
            </>
          )}
        </div>

        {/* Additional info */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            {planType === "free" 
              ? "Upgrade to Elite for more questions and advanced features"
              : "Your Elite plan includes priority support and unlimited features"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickUsageIndicator({ 
  current, 
  limit, 
  className = "" 
}: { 
  current: number; 
  limit: number; 
  className?: string; 
}) {
  const percentage = (current / limit) * 100;
  const isNearLimit = percentage >= 80;

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="flex-1">
        <Progress 
          value={Math.min(percentage, 100)} 
          className="h-2" 
        />
      </div>
      <span className={cn(
        "text-xs font-medium",
        isNearLimit ? "text-yellow-500" : "text-muted-foreground"
      )}>
        {current}/{limit}
      </span>
    </div>
  );
}

export function UsageWarning({ 
  current, 
  limit, 
  onUpgrade 
}: { 
  current: number; 
  limit: number; 
  onUpgrade?: () => void; 
}) {
  const remaining = limit - current;
  const percentage = (current / limit) * 100;

  if (percentage < 80) return null;

  return (
    <Card className="border-yellow-500/20 bg-yellow-500/5">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-500 mb-1">
              {percentage >= 100 ? "Usage Limit Reached" : "Approaching Usage Limit"}
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              {percentage >= 100 
                ? "You've used all your questions for this month."
                : `You have ${remaining} questions remaining this month.`
              }
            </p>
            {onUpgrade && (
              <button 
                onClick={onUpgrade}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Upgrade to Elite →
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
