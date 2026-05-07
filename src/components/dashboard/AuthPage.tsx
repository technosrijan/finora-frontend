import { useState } from "react";
import {
  TrendingUp,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Sparkles,
  BarChart3,
  Shield,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { login, register } from "@/lib/api";
import { BackgroundGraphics } from "@/components/ui/BackgroundGraphics";
import { TypewriterText } from "@/components/ui/TypewriterText";

interface AuthPageProps {
  onAuth: () => void;
}

export function AuthPage({ onAuth }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
      onAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen animate-in fade-in duration-500 relative">
      <BackgroundGraphics variant="auth" />

      {/* Content layer above background */}
      <div className="relative z-10 flex w-full">

      {/* Left Panel — Branding with green tint */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.30) 0%, rgba(20,184,166,0.10) 55%, transparent 100%)" }}>
        <div className="relative z-10 flex flex-col justify-center px-16 py-12 w-full">
          {/* Logo row with back button */}
          <div className="flex items-center gap-3 mb-10">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center h-9 w-9 rounded-lg border border-border/40 bg-card/40 text-foreground/70 hover:text-foreground hover:bg-card/60 transition-colors shrink-0"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex h-11 w-11 items-center justify-center bg-primary/10 text-primary border border-primary/20">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold tracking-tight">
              <span>Finora</span>
              <span className="text-primary">.</span>
            </div>
          </div>

          {/* Heading with typewriter */}
          <div className="mb-6">
            <h1 className="text-5xl font-bold tracking-tight leading-[1.05]">
              <TypewriterText
                lines={["Enterprise", "Financial", "Intelligence"]}
                speed={55}
                lineDelay={400}
                className="text-gradient-hero"
              />
            </h1>
          </div>

          <p className="text-lg text-foreground/80 leading-relaxed max-w-lg mb-12">
            Transform corporate annual reports into actionable investor dashboards. AI-powered extraction, comparison charts, and real-time chat analysis.
          </p>

          {/* Feature pills — consistent colored icons */}
          <div className="space-y-4">
            {[
              { icon: Zap, text: "Process 100+ page PDFs in under a minute", color: "text-primary bg-primary/10 border-primary/20" },
              { icon: BarChart3, text: "Auto-generated charts, scorecards, and risk analysis", color: "text-accent bg-accent/10 border-accent/20" },
              { icon: Sparkles, text: "AI chat grounded in your uploaded documents", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
              { icon: Shield, text: "Enterprise-grade security with encrypted storage", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            ].map(({ icon: Icon, text, color }, i) => (
              <div
                key={i}
                className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
              >
                <div className={cn("flex h-9 w-9 items-center justify-center shrink-0 border", color)}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-sm font-medium text-foreground/80">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 relative">
        <div className="relative w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center bg-primary/10 text-primary border border-primary/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Finora<span className="text-primary">.</span>
            </span>
          </div>

          {/* Double-layered rounded form box */}
          <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-md p-1.5 shadow-lg">
            <div className="rounded-lg border border-border/30 bg-card/70 p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight">
                  {mode === "login" ? "Welcome back" : "Create Account"}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {mode === "login"
                    ? "Sign in to access your financial dashboards"
                    : "Start analyzing annual reports in seconds"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div className="space-y-1.5">
                    <label htmlFor="displayName" className="text-sm font-medium text-foreground/80">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                      <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full h-11 pl-11 pr-4 border bg-background/60 backdrop-blur-sm text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-foreground/80">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full h-11 pl-11 pr-4 border bg-background/60 backdrop-blur-sm text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-foreground/80">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "register" ? "Min. 6 characters" : "Enter your password"}
                      required
                      minLength={6}
                      className="w-full h-11 pl-11 pr-12 border bg-background/60 backdrop-blur-sm text-sm font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-2 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 text-sm font-semibold transition-transform hover:scale-[1.01] active:scale-[0.99] border border-primary/20 rounded-lg"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
                </Button>
              </form>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setError(null);
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {mode === "login" ? (
                    <>
                      Don't have an account?{" "}
                      <span className="font-semibold text-primary hover:underline">Sign up</span>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <span className="font-semibold text-primary hover:underline">Sign in</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      </div>{/* /content layer */}
    </div>
  );
}
