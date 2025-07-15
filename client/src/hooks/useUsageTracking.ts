import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UsageData {
  current: number;
  limit: number;
  period: string;
  planType: "free" | "premium";
  resetDate: string;
}

export function useUsageTracking() {
  const queryClient = useQueryClient();

  const { data: usage, isLoading } = useQuery<UsageData>({
    queryKey: ["/api/usage"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const incrementUsage = useMutation({
    mutationFn: async (count: number = 1) => {
      const response = await apiRequest("POST", "/api/usage/increment", { count });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
    },
  });

  const canMakeRequest = () => {
    if (!usage) return false;
    return usage.current < usage.limit;
  };

  const getRemainingQuestions = () => {
    if (!usage) return 0;
    return Math.max(0, usage.limit - usage.current);
  };

  const getUsagePercentage = () => {
    if (!usage) return 0;
    return (usage.current / usage.limit) * 100;
  };

  const isNearLimit = () => {
    return getUsagePercentage() >= 80;
  };

  const isAtLimit = () => {
    return getUsagePercentage() >= 100;
  };

  return {
    usage,
    isLoading,
    incrementUsage,
    canMakeRequest,
    getRemainingQuestions,
    getUsagePercentage,
    isNearLimit,
    isAtLimit,
  };
}

export function useUsageWarnings() {
  const { usage, isNearLimit, isAtLimit } = useUsageTracking();
  const [hasShownWarning, setHasShownWarning] = useState(false);

  useEffect(() => {
    if (isAtLimit() && !hasShownWarning) {
      setHasShownWarning(true);
      // Show toast or modal warning
    }
  }, [isAtLimit, hasShownWarning]);

  const shouldShowUpgradePrompt = () => {
    return usage?.planType === "free" && (isNearLimit() || isAtLimit());
  };

  const getWarningMessage = () => {
    if (isAtLimit()) {
      return "You've reached your monthly question limit. Upgrade to continue.";
    }
    if (isNearLimit()) {
      return "You're approaching your monthly question limit.";
    }
    return null;
  };

  return {
    shouldShowUpgradePrompt,
    getWarningMessage,
    isNearLimit: isNearLimit(),
    isAtLimit: isAtLimit(),
  };
}
