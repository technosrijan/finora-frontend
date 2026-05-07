import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

/* ── Dashboard floating decorations — extremely subtle ── */
export function DashboardDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute top-[5%] right-[5%] w-20 h-20 border border-primary/[0.04] rotate-45 animate-float-slow" />
      <div className="absolute bottom-[15%] left-[3%] w-14 h-14 border border-accent/[0.03] -rotate-12 animate-float-delayed" />
    </div>
  );
}

/* ── Section header — clean, readable, professional ── */
export function SectionHeader({
  icon: Icon,
  color,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  };
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center border",
          colorMap[color] || colorMap.primary
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
    </div>
  );
}

/* ── Clean card with subtle hover lift ── */
export function TacticalCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "group relative border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-border/60",
        className
      )}
    >
      {/* Subtle shimmer on hover */}
      <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {children}
    </Card>
  );
}

/* ── Status badge — clean, readable ── */
export function TacticalBadge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: "bullish" | "bearish" | "neutral" | "primary" | "accent";
}) {
  const map: Record<string, string> = {
    bullish: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    bearish: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    neutral: "bg-muted text-muted-foreground border-border/50",
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 border",
        map[variant]
      )}
    >
      {children}
    </span>
  );
}
