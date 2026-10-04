import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/components/auth-provider";
import { useLocation, Link } from "wouter";
import { Moon, Sun, LogIn, LogOut, Scale } from "lucide-react";
import { FlagShieldCar } from "@/components/americana";

export function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      setLocation("/auth");
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-header border-b border-border/60">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo + Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-md overflow-hidden">
            <FlagShieldCar className="w-[27px] h-[31px] text-white/25" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-card" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-black text-base tracking-tight">
              Bad Drivers
            </span>
            <span className="text-[9px] text-muted-foreground font-semibold tracking-[0.15em] uppercase">
              of America
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link
            href="/terms"
            data-testid="link-terms"
            aria-label="Terms and Conditions"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all"
          >
            <Scale className="w-[18px] h-[18px]" />
          </Link>
          <button
            onClick={handleAuthClick}
            data-testid="button-auth"
            aria-label={isAuthenticated ? "Log out" : "Log in"}
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all"
          >
            {isAuthenticated ? (
              <>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {user?.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
                <LogOut className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
          <button
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-all"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
