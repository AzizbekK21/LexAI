import React, { useState } from "react";
import { 
  BarChart3, 
  FileText, 
  MessageSquare, 
  Crown, 
  TrendingUp, 
  Calendar,
  Clock,
  Star,
  Download,
  Filter,
  Search,
  Plus,
  Settings,
  Bell,
  Archive,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { UsageProgress } from "@/components/ui/usage-progress";
import { AnalysisHistory } from "@/components/ui/document-analyzer";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { cn } from "@/lib/utils";

interface DashboardStat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ComponentType<any>;
  color: string;
}

interface RecentActivity {
  id: string;
  type: "chat" | "document" | "analysis";
  title: string;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
  category: string;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  type: "tip" | "warning" | "update";
  actionText?: string;
  actionHref?: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  
  const { usage, isLoading } = useUsageTracking();

  const stats: DashboardStat[] = [
    {
      title: "Questions Asked",
      value: usage?.current.toString() || "0",
      change: "+12%",
      trend: "up",
      icon: MessageSquare,
      color: "text-blue-500",
    },
    {
      title: "Documents Analyzed",
      value: "23",
      change: "+5%",
      trend: "up",
      icon: FileText,
      color: "text-green-500",
    },
    {
      title: "Hours Saved",
      value: "45.5",
      change: "+18%",
      trend: "up",
      icon: Clock,
      color: "text-purple-500",
    },
    {
      title: "Success Rate",
      value: "99.2%",
      change: "+0.3%",
      trend: "up",
      icon: TrendingUp,
      color: "text-yellow-500",
    },
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: "1",
      type: "chat",
      title: "Employment Contract Review",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: "completed",
      category: "Employment Law",
    },
    {
      id: "2",
      type: "document",
      title: "NDA Analysis - TechCorp",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: "completed",
      category: "Contract Law",
    },
    {
      id: "3",
      type: "chat",
      title: "Criminal Procedure Rights",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      status: "completed",
      category: "Criminal Law",
    },
    {
      id: "4",
      type: "analysis",
      title: "Business Formation Guide",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      status: "pending",
      category: "Business Law",
    },
  ];

  const insights: Insight[] = [
    {
      id: "1",
      title: "Upgrade Available",
      description: "You're approaching your monthly limit. Upgrade to Elite for unlimited questions.",
      type: "warning",
      actionText: "Upgrade Now",
      actionHref: "/#pricing",
    },
    {
      id: "2",
      title: "New Feature: Real-time Updates",
      description: "Get instant notifications about legal changes in your jurisdiction.",
      type: "update",
      actionText: "Learn More",
    },
    {
      id: "3",
      title: "Pro Tip",
      description: "Use specific keywords when asking legal questions to get more accurate responses.",
      type: "tip",
    },
  ];

  const mockAnalyses = [
    {
      id: "1",
      fileName: "Employment_Contract.pdf",
      status: "completed" as const,
      progress: 100,
      summary: "Standard employment agreement with favorable terms.",
      riskLevel: "low" as const,
    },
    {
      id: "2",
      fileName: "NDA_Agreement.pdf", 
      status: "completed" as const,
      progress: 100,
      summary: "Comprehensive non-disclosure agreement with strict confidentiality clauses.",
      riskLevel: "medium" as const,
    },
  ];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "chat": return MessageSquare;
      case "document": return FileText;
      case "analysis": return BarChart3;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-500 bg-green-500/20";
      case "pending": return "text-yellow-500 bg-yellow-500/20";
      case "failed": return "text-red-500 bg-red-500/20";
      default: return "text-gray-500 bg-gray-500/20";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "warning": return "⚠️";
      case "update": return "🆕";
      case "tip": return "💡";
      default: return "ℹ️";
    }
  };

  const filteredActivities = recentActivities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" || activity.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <AnimatedLogo size="md" />
              <div>
                <h1 className="text-2xl font-bold text-gradient">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back! Here's your legal intelligence overview.
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="outline" className="glass-morphism">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 glass-morphism">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Activity
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Documents
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard key={index} stat={stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                {usage && (
                  <UsageProgress
                    current={usage.current}
                    limit={usage.limit}
                    period={usage.period}
                    planType={usage.planType}
                  />
                )}
              </div>

              <Card className="lg:col-span-2 glass-morphism">
                <CardHeader>
                  <CardTitle className="text-gradient">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      className="h-20 flex-col space-y-2 bg-gradient-to-r from-primary to-yellow-400 text-primary-foreground hover:scale-105 transition-transform"
                      onClick={() => window.location.href = "/chat"}
                    >
                      <MessageSquare className="w-6 h-6" />
                      <span>Start New Chat</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2 glass-morphism hover:scale-105 transition-transform"
                    >
                      <FileText className="w-6 h-6" />
                      <span>Analyze Document</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2 glass-morphism hover:scale-105 transition-transform"
                    >
                      <BarChart3 className="w-6 h-6" />
                      <span>View Reports</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2 glass-morphism hover:scale-105 transition-transform"
                    >
                      <Crown className="w-6 h-6" />
                      <span>Upgrade Plan</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="text-gradient">Insights & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className={cn(
                        "p-4 rounded-lg border flex items-start space-x-4",
                        insight.type === "warning" && "bg-yellow-500/10 border-yellow-500/20",
                        insight.type === "update" && "bg-blue-500/10 border-blue-500/20",
                        insight.type === "tip" && "bg-green-500/10 border-green-500/20"
                      )}
                    >
                      <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                        {insight.actionText && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => insight.actionHref && (window.location.href = insight.actionHref)}
                          >
                            {insight.actionText}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-morphism"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="glass-morphism">
                    <Filter className="w-4 h-4 mr-2" />
                    {selectedFilter === "all" ? "All Activities" : selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSelectedFilter("all")}>
                    All Activities
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("chat")}>
                    Chats
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("document")}>
                    Documents
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedFilter("analysis")}>
                    Analysis
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="text-gradient">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {filteredActivities.map((activity) => {
                      const IconComponent = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-secondary/20 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{activity.title}</h4>
                            <p className="text-sm text-muted-foreground">{activity.category}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(activity.status)}>
                              {activity.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTime(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gradient">Document Analysis</h2>
                <p className="text-muted-foreground">Manage and review your analyzed documents</p>
              </div>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <AnalysisHistory 
              analyses={mockAnalyses}
              onAnalysisSelect={(analysis) => {
                console.log("Selected analysis:", analysis);
              }}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gradient">Analytics</h2>
              <p className="text-muted-foreground">Track your legal intelligence usage and insights</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle>Usage Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">This Week</span>
                      <span className="font-semibold">24 questions</span>
                    </div>
                    <Progress value={60} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">This Month</span>
                      <span className="font-semibold">{usage?.current || 0} questions</span>
                    </div>
                    <Progress value={usage ? (usage.current / usage.limit) * 100 : 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle>Question Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { category: "Employment Law", count: 12, color: "bg-blue-500" },
                      { category: "Contract Law", count: 8, color: "bg-green-500" },
                      { category: "Business Law", count: 6, color: "bg-yellow-500" },
                      { category: "Criminal Law", count: 4, color: "bg-red-500" },
                    ].map((item) => (
                      <div key={item.category} className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-sm">{item.category}</span>
                          <span className="font-semibold">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ stat }: { stat: DashboardStat }) {
  const IconComponent = stat.icon;
  
  return (
    <Card className="glass-morphism hover-lift">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
            <div className="flex items-center space-x-1 mt-1">
              <TrendingUp className={cn("w-4 h-4", stat.color)} />
              <span className={cn("text-sm font-medium", stat.color)}>
                {stat.change} from last month
              </span>
            </div>
          </div>
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", 
            stat.color.replace("text-", "bg-").replace("-500", "-500/20")
          )}>
            <IconComponent className={cn("w-6 h-6", stat.color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
