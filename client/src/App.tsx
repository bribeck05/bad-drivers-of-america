import { Switch, Route, Router, Link, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/top-bar";
import Feed from "@/pages/feed";
import ReportDetail from "@/pages/report-detail";
import CreateReport from "@/pages/create-report";
import PlateLookup from "@/pages/plate-lookup";
import Stats from "@/pages/stats";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Feed} />
      <Route path="/reports/:id" component={ReportDetail} />
      <Route path="/create" component={CreateReport} />
      <Route path="/plate" component={PlateLookup} />
      <Route path="/stats" component={Stats} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-[100dvh] max-w-md mx-auto relative bg-background">
            <TopBar />
            <main className="flex-1 overflow-y-auto pb-20">
              <Router hook={useHashLocation}>
                <AppRouter />
              </Router>
            </main>
            <BottomNav />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
