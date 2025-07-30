import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useCapacitor } from "@/hooks/useCapacitor";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import WillBuilder from "@/pages/will-builder";
import DigitalVault from "@/pages/digital-vault";
import Family from "@/pages/family";
import Subscribe from "@/pages/subscribe";
import TestSimple from "@/pages/test-simple";
import SimpleWill from "@/pages/simple-will";
import KeyboardWill from "@/pages/keyboard-will";
import InputTest from "@/pages/input-test";
import FixedWillBuilder from "@/pages/fixed-will-builder";
import UltraSimpleWill from "@/pages/ultra-simple-will";
import AIWillBuilder from "@/pages/ai-will-builder";
import AIEnhancedDashboard from "@/pages/ai-enhanced-dashboard";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log("Auth state:", { isAuthenticated, isLoading, user });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Enable full authentication protection
  const protectedRoutes = ['/dashboard', '/will-builder', '/digital-vault', '/family', '/subscribe'];
  const currentPath = window.location.pathname;
  
  if (!isAuthenticated && protectedRoutes.includes(currentPath)) {
    window.location.href = '/api/login';
    return null;
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={AIEnhancedDashboard} />
      <Route path="/dashboard-old" component={Dashboard} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/will-builder" component={AIWillBuilder} />
      <Route path="/will-builder-old" component={WillBuilder} />
      <Route path="/simple-will" component={SimpleWill} />
      <Route path="/keyboard-will" component={KeyboardWill} />
      <Route path="/input-test" component={InputTest} />
      <Route path="/digital-vault" component={DigitalVault} />
      <Route path="/family" component={Family} />
      <Route path="/test" component={TestSimple} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isNative, platform } = useCapacitor();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className={`app-container ${isNative ? 'native-app' : 'web-app'} platform-${platform} overflow-x-hidden`}>
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
