import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export function TopBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-primary-foreground" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l2-5h14l2 5v3H3z" />
              <circle cx="7.5" cy="20" r="1.5" />
              <circle cx="16.5" cy="20" r="1.5" />
              <path d="M6 14l1-3M10 14v-3M14 14l-1-3" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-black text-base tracking-tight">Bad Drivers</span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">of America</span>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  );
}
