import { Link, useLocation } from "wouter";
import { Home, Plus, Search, BarChart3 } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const tabs = [
    { path: "/", label: "Feed", icon: Home, testId: "nav-feed" },
    { path: "/plate", label: "Lookup", icon: Search, testId: "nav-plate" },
    { path: "/create", label: "Report", icon: Plus, testId: "nav-create", primary: true },
    { path: "/stats", label: "Stats", icon: BarChart3, testId: "nav-stats" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      <div className="glass-nav border-t border-border/60 px-2 py-2">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = location === tab.path || (tab.path !== "/" && location.startsWith(tab.path));
            const Icon = tab.icon;

            if (tab.primary) {
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  data-testid={tab.testId}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all bg-gradient-to-br from-primary to-red-600 text-white ${
                    isActive ? "shadow-lg nav-glow" : "shadow-md"
                  }`}>
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <span className={`text-xs font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {tab.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={tab.path}
                href={tab.path}
                data-testid={tab.testId}
                className="flex flex-col items-center gap-1 transition-colors"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                }`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-xs font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
