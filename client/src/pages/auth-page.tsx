import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Shield, User, Lock, Eye, EyeOff, Car } from "lucide-react";

export default function AuthPage() {
  const { login, signup } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signup" && (!username.trim() || !password || !displayName.trim())) {
      toast({ title: "Missing fields", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (mode === "login" && (!username.trim() || !password)) {
      toast({ title: "Missing fields", description: "Username and password are required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        await signup(username.trim(), password, displayName.trim());
        toast({ title: "Account created!", description: "Welcome to Bad Drivers of America." });
      } else {
        await login(username.trim(), password);
        toast({ title: "Welcome back!" });
      }
      setLocation("/");
    } catch (err: any) {
      let message = err.message;
      try {
        const parsed = JSON.parse(err.message.split(": ").slice(1).join(": "));
        message = parsed.error || message;
      } catch {}
      toast({ title: "Authentication failed", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 min-h-[calc(100dvh-7rem)] flex flex-col justify-center">
      {/* Logo / Header */}
      <div className="text-center mb-2">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3">
          <Shield className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="font-display font-black text-xl">
          {mode === "signup" ? "Join the Community" : "Welcome Back"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "signup"
            ? "Create an account to report bad drivers"
            : "Sign in to report and interact"}
        </p>
      </div>

      <Card className="p-5 space-y-4 border-card-border">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name (signup only) */}
          {mode === "signup" && (
            <div>
              <Label htmlFor="displayName" className="text-sm font-semibold mb-1.5 block">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  Display Name
                </span>
              </Label>
              <Input
                id="displayName"
                data-testid="input-display-name"
                placeholder="e.g., Road Watcher"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
              />
            </div>
          )}

          {/* Username */}
          <div>
            <Label htmlFor="username" className="text-sm font-semibold mb-1.5 block">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Username
              </span>
            </Label>
            <Input
              id="username"
              data-testid="input-username"
              placeholder="e.g., johndriver"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
              maxLength={30}
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-sm font-semibold mb-1.5 block">
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                Password
              </span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                data-testid="input-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={100}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            data-testid="button-submit-auth"
            disabled={isSubmitting}
            className="w-full h-11 text-base font-bold"
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "signup"
                ? "Create Account"
                : "Sign In"}
          </Button>
        </form>

        {/* Toggle mode */}
        <div className="text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Already have an account? " : "New to Bad Drivers? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "login" : "signup");
              setPassword("");
            }}
            className="text-primary font-medium hover:underline"
          >
            {mode === "signup" ? "Sign in" : "Sign up"}
          </button>
        </div>
      </Card>

      {/* Continue as Guest */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setLocation("/")}
          data-testid="button-continue-guest"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          Continue as Guest
        </button>
      </div>

      <p className="text-xs text-center text-muted-foreground leading-relaxed px-4">
        <Car className="w-3 h-3 inline mr-1" />
        Your account lets you submit reports, vote, and comment. Rate limits protect against spam and abuse.
      </p>
    </div>
  );
}
