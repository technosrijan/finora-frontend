import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  DollarSign,
  type LucideIcon,
  BarChart as BarChartIcon,
  ShieldAlert,
  Compass,
  FileText,
  ArrowRightLeft,
  PieChart as PieChartIcon,
  Activity,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReportSet, ReportRecord, ReportInsights } from "@/lib/types";
import { Scorecards } from "./Scorecards";
import { RenderDynamicChart, RevenueDonut, CHART_COLORS } from "./charts/DynamicCharts";
import { HealthGauge } from "./HealthGauge";
import { KeyRatiosStrip } from "./KeyRatiosStrip";
import { ComparisonView } from "./ComparisonView";
import { ProgressIndicator } from "./ProgressIndicator";
import { getReportProgress } from "@/lib/api";
import type { ProgressState } from "@/lib/types";
import { TacticalCard, SectionHeader, DashboardDecorations } from "./TacticalUI";

interface OverviewProps {
  reportSet: ReportSet | null;
  loadingCaption: string | null;
  timedOut: boolean;
  onRetry: () => void;
}

export function Overview({ reportSet, loadingCaption, timedOut, onRetry }: OverviewProps) {
  const ready = reportSet?.reports.filter((r) => r.status === "ready" && r.insights) ?? [];
  const erroredAll = !!reportSet && reportSet.reports.every((r) => r.status === "error");
  const [progressStates, setProgressStates] = useState<Record<string, ProgressState>>({});

  useEffect(() => {
    if (!reportSet || ready.length > 0) return;

    let alive = true;
    const pollProgress = async () => {
      const next: Record<string, ProgressState> = {};
      await Promise.all(
        reportSet.reports.map(async (r) => {
          try {
            next[r.id] = await getReportProgress(r.id);
          } catch {
            next[r.id] = {
              status: r.status,
              progress: r.status === "ready" ? 100 : 5,
              current_step: r.status === "ready" ? "Complete" : "Parsing PDF...",
              total_steps: 6,
              completed_steps: r.status === "ready" ? 6 : 0,
              error: r.error ?? null,
            };
          }
        }),
      );
      if (alive) setProgressStates(next);
    };

    pollProgress();
    const interval = window.setInterval(pollProgress, 1500);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [reportSet, ready.length]);

  if (timedOut) {
    return (
      <CenteredCard
        icon={AlertTriangle}
        tone="destructive"
        title="Processing is taking longer than expected"
        description="Please try uploading the reports again."
        action={<Button onClick={onRetry}>Try again</Button>}
      />
    );
  }

  if (!reportSet || reportSet.reports.length === 0) {
    return (
      <CenteredCard
        icon={DollarSign}
        title="Upload an annual report to get started"
        description="Finora extracts financials, risks, and investment signals into a single visual dashboard."
        action={<Button onClick={onRetry}>Upload report</Button>}
      />
    );
  }

  if (erroredAll) {
    return (
      <CenteredCard
        icon={AlertTriangle}
        tone="destructive"
        title="We couldn't process these reports"
        description={reportSet.reports[0].error ?? "An unknown error occurred."}
        action={<Button onClick={onRetry}>Try again</Button>}
      />
    );
  }

  if (ready.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col justify-center gap-5 px-6 py-8 text-center relative">
        <DashboardDecorations />
        <div className="space-y-3">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" aria-hidden />
          <p className="text-sm font-semibold tracking-wide">{loadingCaption ?? "Map-Reduce extraction in progress…"}</p>
          <p className="text-xs text-muted-foreground">
            Parsing PDF, embedding chunks, and running the analysis pipeline.
          </p>
        </div>

        <div className="space-y-4 text-left">
          {reportSet.reports.map((r, idx) => (
            <ProgressIndicator
              key={r.id}
              progress={progressStates[r.id] || {
                status: r.status,
                progress: r.status === "ready" ? 100 : 5,
                current_step: r.status === "ready" ? "Complete" : "Parsing PDF...",
                total_steps: 6,
                completed_steps: r.status === "ready" ? 6 : 0,
                error: r.error ?? null,
              }}
              reportIndex={idx + 1}
              totalReports={reportSet.reports.length}
            />
          ))}
        </div>
      </div>
    );
  }

  if (ready.length === 1) {
    return <SingleReportDashboard report={ready[0]} />;
  }

  return <MultiReportDashboard reports={ready} allReports={reportSet.reports} setId={reportSet.id} />;
}

/* ── Multi Report Dashboard with Tabs ── */
function MultiReportDashboard({ reports, allReports, setId }: { reports: ReportRecord[]; allReports: ReportRecord[]; setId: string }) {
  const [activeTab, setActiveTab] = useState<string>("compare");

  const tabs = useMemo(() => {
    const t: { key: string; label: string; icon: any }[] = [
      { key: "compare", label: "Compare All", icon: ArrowRightLeft },
    ];
    for (const r of reports) {
      t.push({
        key: r.id,
        label: r.insights?.company_name ?? r.filename.replace(".pdf", ""),
        icon: FileText,
      });
    }
    return t;
  }, [reports]);

  const activeReport = activeTab !== "compare" ? reports.find(r => r.id === activeTab) : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-10 lg:px-12 relative">
      <DashboardDecorations />

      {/* Tab Bar */}
      <div className="mb-8 flex items-center gap-0 overflow-x-auto pb-0 border-b border-border/40">
        {tabs.map((tab, i) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          const colorIdx = i - 1;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative flex items-center gap-2 px-5 py-3 text-[13px] font-medium transition-all duration-200 whitespace-nowrap border-b-2",
                isActive
                  ? "border-primary text-primary bg-primary/[0.03]"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {tab.key !== "compare" && (
                <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[colorIdx % CHART_COLORS.length] }} />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate max-w-[140px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "compare" ? (
        <ComparisonView reports={reports} setId={setId} />
      ) : activeReport ? (
        <SingleReportDashboard report={activeReport} colorIndex={reports.indexOf(activeReport)} />
      ) : null}
    </div>
  );
}

/* ── Single Report Dashboard ── */
function SingleReportDashboard({ report, colorIndex = 0 }: { report: ReportRecord; colorIndex?: number }) {
  const insights = report.insights!;
  const title = insights.company_name || report.filename;
  const period = insights.reporting_period || "Latest Period";
  const sector = insights.sector || "General";
  const healthScore = insights.financial_health_score ?? 5;
  const sentiment = insights.sentiment_score ?? 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-8 md:px-10 lg:px-12 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <DashboardDecorations />

      {/* Hero Header */}
      <header>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5 flex-1 min-w-0">
            <div className="h-16 w-16 bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
              <BuildingIcon className="h-8 w-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-4xl font-bold tracking-tight text-foreground truncate">{title}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-medium border border-border/40">{period}</span>
                <span className="bg-primary/10 text-primary px-2.5 py-0.5 text-[11px] font-semibold border border-primary/20">{sector}</span>
                <SentimentBadge score={sentiment} />
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <HealthGauge score={healthScore} size={130} />
          </div>
        </div>
      </header>

      {/* Key Metrics Scorecards */}
      {insights.key_metrics && insights.key_metrics.length > 0 && (
        <section className="space-y-5">
          <SectionHeader icon={DollarSign} color="primary" title="Key Metrics" />
          <Scorecards metrics={insights.key_metrics} />
        </section>
      )}

      {/* Key Financial Ratios */}
      {insights.key_ratios && insights.key_ratios.length > 0 && (
        <section className="space-y-5">
          <SectionHeader icon={Activity} color="accent" title="Financial Ratios" />
          <KeyRatiosStrip ratios={insights.key_ratios} />
        </section>
      )}

      {/* Charts + Revenue Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {insights.generated_charts && insights.generated_charts.length > 0 && (
          <div className={cn("space-y-5", insights.revenue_breakdown?.length ? "lg:col-span-2" : "lg:col-span-3")}>
            <SectionHeader icon={BarChartIcon} color="primary" title="Performance Charts" />
            <div className="grid gap-6 md:grid-cols-2">
              {insights.generated_charts.map((chart, i) => (
                <TacticalCard key={i}>
                  <CardHeader className="px-6 pt-6 pb-3">
                    <CardTitle className="text-sm font-bold tracking-tight">{chart.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80 px-5 pb-6">
                    <RenderDynamicChart chart={chart} />
                  </CardContent>
                </TacticalCard>
              ))}
            </div>
          </div>
        )}

        {insights.revenue_breakdown && insights.revenue_breakdown.length > 0 && (
          <div className="space-y-5 lg:col-span-1">
            <SectionHeader icon={PieChartIcon} color="accent" title="Revenue Mix" />
            <TacticalCard>
              <CardHeader className="px-6 pt-6 pb-2">
                <CardTitle className="text-sm font-bold tracking-tight">Segment Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-80 px-5 pb-6">
                <RevenueDonut segments={insights.revenue_breakdown} />
              </CardContent>
            </TacticalCard>
            <div className="space-y-2 px-1">
              {insights.revenue_breakdown.map((seg, i) => (
                <div key={i} className="flex items-center justify-between text-sm px-2 py-1.5 border-b border-border/20">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-foreground/80 truncate text-xs font-medium">{seg.segment}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold tabular-nums text-sm">{seg.value}%</span>
                    {seg.amount !== "N/A" && (
                      <span className="text-xs text-muted-foreground font-medium">{seg.amount}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Executive Summary */}
      {insights.executive_summary && (
        <TacticalCard>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Executive Summary
            </h3>
            <p className="text-base md:text-lg font-medium leading-relaxed text-foreground/90">
              {insights.executive_summary}
            </p>
          </CardContent>
        </TacticalCard>
      )}

      {/* Strategic & Risk two-column layout */}
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-start">
        {insights.strategic_initiatives && insights.strategic_initiatives.length > 0 && (
          <section className="space-y-5">
            <SectionHeader icon={Compass} color="indigo" title="Strategic Focus" />
            <div className="space-y-3">
              {insights.strategic_initiatives.map((strategy, i) => (
                <div
                  key={i}
                  className="group flex gap-4 items-start bg-gradient-to-br from-indigo-500/[0.06] via-indigo-500/[0.01] to-transparent p-5 border border-border/40 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-500/30 transition-all duration-300 animate-in fade-in slide-in-from-left-4"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                >
                  <div className="h-8 w-8 shrink-0 bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-sm border border-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all duration-300">
                    {i + 1}
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{strategy}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {insights.risk_analysis && insights.risk_analysis.length > 0 && (
          <section className="space-y-5">
            <SectionHeader icon={ShieldAlert} color="rose" title="Risk Analysis" />
            <div className="space-y-3">
              {insights.risk_analysis.map((risk, i) => (
                <div
                  key={i}
                  className="group flex gap-4 items-start bg-gradient-to-br from-rose-500/[0.06] via-rose-500/[0.01] to-transparent p-5 border border-rose-500/15 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-rose-500/30 transition-all duration-300 animate-in fade-in slide-in-from-right-4"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                >
                  <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-sm font-medium leading-relaxed text-foreground/90">{risk}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Token Usage Footer */}
      {(report.token_usage_input || report.token_usage_output) ? (
        <footer className="mt-10 border-t border-border/30 pt-5 flex items-center justify-center gap-6 text-[11px] text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 bg-blue-500/60 rounded-full" />
            Input: <strong className="text-foreground/70 tabular-nums">{(report.token_usage_input ?? 0).toLocaleString()}</strong> tokens
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 bg-emerald-500/60 rounded-full" />
            Output: <strong className="text-foreground/70 tabular-nums">{(report.token_usage_output ?? 0).toLocaleString()}</strong> tokens
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 bg-primary/60 rounded-full" />
            Total: <strong className="text-foreground/70 tabular-nums">{((report.token_usage_input ?? 0) + (report.token_usage_output ?? 0)).toLocaleString()}</strong> tokens
          </span>
        </footer>
      ) : null}
    </div>
  );
}

/* ── Helpers ── */

function SentimentBadge({ score }: { score: number }) {
  const isBullish = score > 0.15;
  const isBearish = score < -0.15;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 border",
      isBullish ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
        isBearish ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" :
          "bg-muted text-muted-foreground border-border/50"
    )}>
      <Sparkles className="h-3 w-3" />
      {isBullish ? "Bullish" : isBearish ? "Bearish" : "Neutral"}
    </span>
  );
}

function BuildingIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="0" ry="0" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function CenteredCard({
  icon: Icon,
  title,
  description,
  action,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  tone?: "destructive";
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 relative">
      <div className="absolute top-1/4 left-[10%] w-20 h-20 border border-primary/[0.04] rotate-45 animate-float-slow pointer-events-none" />
      <div className="absolute bottom-1/3 right-[8%] w-14 h-14 border border-accent/[0.03] -rotate-12 animate-float-delayed pointer-events-none" />
      <div className="max-w-md space-y-3 text-center">
        <div
          className={cn(
            "mx-auto flex h-16 w-16 items-center justify-center border-2",
            tone === "destructive" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-primary/10 text-primary border-primary/20",
          )}
        >
          <Icon className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        <div className="pt-2">{action}</div>
      </div>
    </div>
  );
}
