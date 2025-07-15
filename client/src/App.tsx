import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider, useAuth } from "@/components/auth/auth-provider";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import Auth from "@/pages/auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { ComponentType } from "react";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={requireAuth(Dashboard)} />
      <Route path="/chat/:conversationId" component={requireAuth(Chat)} />
      <Route path="/chat" component={requireAuth(Chat)} />
      <Route component={NotFound} />
    </Switch>
  );
}

function requireAuth(Component: ComponentType) {
  return function AuthGuard() {
    const { isAuthenticated, isLoading } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        setLocation("/auth");
      }
    }, [isAuthenticated, isLoading]);

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthenticated) return null;
    return <Component />;
  };
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
