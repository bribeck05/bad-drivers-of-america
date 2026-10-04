import { Switch, Route, Router, Link, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/top-bar";
import Feed from "@/pages/feed";
import ReportDetail from "@/pages/report-detail";
import CreateReport from "@/pages/create-report";
import PlateLookup from "@/pages/plate-lookup";
import Stats from "@/pages/stats";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // While checking auth state, show nothing (prevents flash)
  if (isLoading) {
    return null;
  }

  // Routes that require authentication
  const requiresAuth = false; // Reporting is open to all users

  if (requiresAuth && !isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Switch>
      <Route path="/" component={Feed} />
      <Route path="/reports/:id" component={ReportDetail} />
      <Route path="/create" component={CreateReport} />
      <Route path="/plate" component={PlateLookup} />
      <Route path="/stats" component={Stats} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <div className="flex flex-col min-h-[100dvh] max-w-md mx-auto relative bg-background">
              <TopBar />
              <main className="flex-1 overflow-y-auto pb-28">
                <Router hook={useHashLocation}>
                  <AppRouter />
                </Router>
              </main>
              <BottomNav />
            </div>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
