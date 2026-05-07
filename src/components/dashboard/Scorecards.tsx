import { Activity, TrendingUp, TrendingDown, Target, Zap, Anchor, BarChart3, PieChart, Briefcase, DollarSign, Percent, TrendingUpDown } from "lucide-react";
import type { DynamicMetric } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  metrics: DynamicMetric[];
}

const ICONS = [DollarSign, Activity, Target, Zap, Percent, BarChart3, PieChart, Briefcase, Anchor, TrendingUpDown];

export function Scorecards({ metrics = [] }: Props) {
  if (metrics.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-min">
      {metrics.map((metric, i) => {
        const Icon = ICONS[i % ICONS.length];
        const t = metric.trend.toLowerCase();
        const isPositive = t.includes("+") || t.includes("up") || t.includes("improv") || t.includes("increas") || t.includes("grow");
        const isNegative = t.includes("-") || t.includes("down") || t.includes("declin") || t.includes("decreas") || t.includes("drop");

        const isHero = i === 0 || i === 1;

        const gradient = isPositive
          ? "bg-gradient-to-br from-emerald-500/[0.10] via-emerald-500/[0.03] to-transparent hover:border-emerald-500/30 hover:shadow-emerald-500/[0.08]"
          : isNegative
            ? "bg-gradient-to-br from-rose-500/[0.10] via-rose-500/[0.03] to-transparent hover:border-rose-500/30 hover:shadow-rose-500/[0.08]"
            : "bg-gradient-to-br from-primary/[0.08] via-primary/[0.02] to-transparent hover:border-primary/30 hover:shadow-primary/[0.06]";

        const iconColor = isPositive
          ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10 group-hover:bg-emerald-500/20 group-hover:scale-110"
          : isNegative
            ? "text-rose-500 border-rose-500/20 bg-rose-500/10 group-hover:bg-rose-500/20 group-hover:scale-110"
            : "text-primary border-primary/20 bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110";

        const trendBadge = isPositive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          : isNegative
            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
            : "bg-muted text-muted-foreground border-border/50";

        return (
          <div
            key={i}
            className={cn(
              "group flex flex-col rounded-xl border bg-card/60 backdrop-blur-md p-5 shadow-sm transition-all duration-300 relative overflow-hidden",
              "hover:-translate-y-1 hover:shadow-lg",
              "animate-in fade-in slide-in-from-bottom-4",
              gradient,
              isHero ? "md:col-span-2 lg:col-span-2" : "col-span-1"
            )}
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
          >
            {/* Subtle shimmer on hover */}
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="flex items-start justify-between mb-3 relative">
              <span className={cn(
                "font-bold text-foreground/90",
                isHero ? "text-base" : "text-sm"
              )}>
                {metric.name}
              </span>
              <div className={cn(
                "flex items-center justify-center shrink-0 border transition-all duration-300",
                isHero ? "p-2" : "p-1.5",
                iconColor
              )}>
                <Icon className={cn("transition-transform duration-300", isHero ? "h-5 w-5" : "h-4 w-4")} />
              </div>
            </div>

            <div className="flex-grow flex flex-col justify-end relative">
              <div className="flex items-baseline gap-3">
                <span className={cn(
                  "font-bold tracking-tight text-foreground",
                  isHero ? "text-4xl" : "text-2xl"
                )}>
                  {metric.value}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className={cn(
                  "inline-flex items-center gap-1.5 font-medium px-2 py-0.5 text-xs border transition-colors duration-300",
                  trendBadge
                )}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : isNegative ? <TrendingDown className="h-3 w-3" /> : null}
                  {metric.trend}
                </span>
              </div>

              <div className={cn(
                "text-muted-foreground leading-relaxed border-t border-border/40",
                isHero ? "mt-4 pt-3 text-sm" : "mt-3 pt-2 text-xs line-clamp-2"
              )}>
                {metric.context}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
