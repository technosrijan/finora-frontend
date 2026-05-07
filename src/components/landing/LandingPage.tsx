import { useEffect, useRef, useState } from "react";
import {
  TrendingUp,
  ArrowRight,
  Zap,
  BarChart3,
  Shield,
  Layers,
  FileText,
  ChevronDown,
  Sparkles,
  Clock,
  Activity,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BackgroundGraphics } from "@/components/ui/BackgroundGraphics";
import { TypewriterText } from "@/components/ui/TypewriterText";

interface LandingPageProps {
  onEnter: () => void;
}

/* ─── Animated Counter Hook ─── */
function useCountUp(end: number, duration = 2000, start = 0) {
  const [value, setValue] = useState(start);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    let raf: number;
    const step = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(start + (end - start) * easeOut));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);

  return value;
}

/* ─── Stat Card ─── */
function StatCard({
  value,
  suffix,
  prefix,
  label,
  icon: Icon,
  delay,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon: typeof TrendingUp;
  delay: number;
}) {
  const count = useCountUp(value, 2200);
  return (
    <div
      className="border border-border/40 bg-card/40 backdrop-blur-sm p-5 hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both rounded-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-8 w-8 items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-sm">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-medium text-muted-foreground tracking-wide">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold tracking-tight tabular-nums text-gradient-primary">
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </div>
    </div>
  );
}

/* ─── Feature Item ─── */
function FeatureItem({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: typeof Zap;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div
      className="group relative border border-border/40 bg-card/20 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-card/40 animate-in fade-in slide-in-from-bottom-5 duration-700 fill-mode-both rounded-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center bg-primary/10 text-primary border border-primary/20 transition-all duration-300 group-hover:scale-105 rounded-sm">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

/* ─── Main Landing Page ─── */
export function LandingPage({ onEnter }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-foreground">
      {/* Full animated background */}
      <BackgroundGraphics variant="landing" />

      {/* Content layer above background */}
      <div className="relative z-10">

      {/* ── Navbar ── */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/40"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-sm">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Finora<span className="text-primary">.</span>
            </span>
          </div>
          <button
            onClick={onEnter}
            className="group flex items-center gap-2 bg-primary/10 px-5 py-2 text-xs font-semibold text-primary border border-primary/20 tracking-wide transition-all hover:bg-primary hover:text-primary-foreground rounded-sm"
          >
            Enter Platform
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16">
        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-primary/5 blur-[100px] pointer-events-none" />

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary tracking-wide backdrop-blur-sm animate-in fade-in zoom-in-95 duration-700 rounded-sm">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Financial Intelligence
        </div>

        {/* Hero Heading */}
        <h1 className="max-w-4xl text-center text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95]">
          <TypewriterText
            lines={["Decode", "Financial", "Complexity"]}
            speed={60}
            lineDelay={350}
            className="text-gradient-hero"
          />
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-center text-base text-muted-foreground sm:text-lg leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-150">
          Transform corporate annual reports into actionable investor dashboards.
          Upload PDFs. Our AI extracts metrics, computes health scores, and builds
          unified visualizations — in under a minute.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-300">
          <button
            onClick={onEnter}
            className="group relative flex h-12 items-center gap-2 bg-primary px-8 text-xs font-semibold text-primary-foreground tracking-wide transition-all hover:opacity-90 active:scale-[0.98] border border-primary/30 rounded-sm"
          >
            <Zap className="h-4 w-4" />
            Get Started Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex h-12 items-center gap-2 border border-border/60 bg-card/40 px-8 text-xs font-semibold text-foreground tracking-wide backdrop-blur-sm transition-all hover:bg-card/70 hover:border-border rounded-sm"
          >
            Explore Features
          </a>
        </div>

        {/* Floating Stat Cards */}
        <div className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 px-4">
          <StatCard value={4200} suffix="T+" label="Assets Analyzed" icon={Globe} delay={400} />
          <StatCard value={600} suffix="+" label="Page PDFs" icon={FileText} delay={550} />
          <StatCard value={60} prefix="<" suffix="s" label="Processing Time" icon={Clock} delay={700} />
          <StatCard value={99} suffix=".7%" label="Extraction Accuracy" icon={Activity} delay={850} />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-in fade-in duration-1000 delay-1000">
          <span className="text-xs font-medium tracking-wide">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="relative px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center relative">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent -z-10" />
            <div className="inline-block bg-background px-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-gradient-hero">
                Built for Serious Investors
              </h2>
            </div>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Every feature engineered to surface signal from noise in corporate financial disclosures.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureItem icon={Zap} title="Intelligent Extraction" description="Our engine scores every page for financial signal density, filters boilerplate, and selectively parses tables — processing 600-page PDFs in seconds." delay={0} />
            <FeatureItem icon={BarChart3} title="Auto-Generated Dashboards" description="Health scores, key ratios, revenue breakdowns, and strategic risk analyses — all synthesized into a unified visual command center." delay={100} />
            <FeatureItem icon={Layers} title="Side-by-Side Comparison" description="Upload up to 3 annual reports and compare KPIs, margins, and growth trajectories across competitors in a single view." delay={200} />
            <FeatureItem icon={Sparkles} title="RAG-Powered AI Chat" description="Ask natural language questions about any report. Our retrieval system grounds every answer in the actual document context." delay={300} />
            <FeatureItem icon={Shield} title="Enterprise-Grade Security" description="JWT authentication, per-user data isolation, encrypted storage, and isolated vector collections for every report." delay={400} />
            <FeatureItem icon={TrendingUp} title="Real-Time Processing" description="Track every stage of the analysis pipeline with live progress updates — from PDF parsing to dashboard generation." delay={500} />
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="relative border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-10 sm:p-16 overflow-hidden rounded-sm">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-64 bg-primary/20 blur-[60px] pointer-events-none" />

            <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl text-gradient-hero">
              Ready to Analyze?
            </h2>
            <p className="relative mt-4 text-muted-foreground max-w-md mx-auto">
              Join thousands of investors using Finora to decode corporate financials faster than ever.
            </p>
            <button
              onClick={onEnter}
              className="relative mt-8 group flex h-13 items-center gap-2 bg-primary px-8 text-xs font-semibold text-primary-foreground tracking-wide transition-all hover:opacity-90 active:scale-[0.98] mx-auto border border-primary/30 rounded-sm"
            >
              <Sparkles className="h-4 w-4" />
              Launch Finora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-sm">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              Finora<span className="text-primary">.</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            © {new Date().getFullYear()} Finora. Built for the future of financial intelligence.
          </p>
        </div>
      </footer>

      </div>{/* /content layer */}
    </div>
  );
}
