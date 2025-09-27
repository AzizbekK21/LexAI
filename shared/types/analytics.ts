export interface UserAnalytics {
  questionsAsked: {
    current: number;
    lastMonth: number;
  };
  documentsAnalyzed: {
    current: number;
    lastMonth: number;
  };
  hoursEstimated: {
    current: number;
    lastMonth: number;
  };
  successRate: {
    current: number;
    lastMonth: number;
  };
}
