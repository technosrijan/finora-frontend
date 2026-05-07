import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HealthGauge } from "./HealthGauge";
import { CHART_COLORS } from "./charts/DynamicCharts";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Layers,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAIComparison } from "@/lib/api";
import type { ReportRecord, ReportInsights, AIComparisonData } from "@/lib/types";
import { Loader2, Zap, CheckCircle2, XCircle } from "lucide-react";
import {
  TacticalCard,
  SectionHeader,
  TacticalBadge,
} from "./TacticalUI";

interface ComparisonViewProps {
  reports: ReportRecord[];
  setId: string;
}

export function ComparisonView({ reports, setId }: ComparisonViewProps) {
  const [aiData, setAiData] = useState<AIComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!setId) return;
    setLoading(true);
    getAIComparison({ data: { setId } })
      .then((data) => setAiData(data))
      .catch((err) => setError(err.message || "Failed to load AI comparison"))
      .finally(() => setLoading(false));
  }, [setId]);
  const readyReports = reports.filter((r) => r.status === "ready" && r.insights);

  if (readyReports.length < 2) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground text-sm">
        Need at least 2 ready reports for comparison.
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Health Score Comparison */}
      <section className="space-y-5">
        <SectionHeader icon={Activity} color="primary" title="Financial Health Comparison" />
        <div className="flex flex-wrap justify-center gap-10">
          {readyReports.map((r, i) => (
            <div key={r.id} className="flex flex-col items-center gap-3">
              <HealthGauge
                score={r.insights!.financial_health_score ?? 5}
                label={r.insights!.company_name ?? r.filename}
                size={160}
              />
              <div className="mt-1 max-w-[220px] text-center leading-tight">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full mr-1.5 align-middle"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="text-xs text-muted-foreground font-medium align-middle">
                  {r.insights!.reporting_period ?? "N/A"} · {r.insights!.sector ?? "General"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sentiment Comparison Bar */}
      <SentimentBar reports={readyReports} />

      {/* AI Comparison Section */}
      <section className="space-y-6">
        <SectionHeader icon={Zap} color="accent" title="AI Comparative Analysis" />

        {loading ? (
          <TacticalCard className="flex min-h-[200px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm font-medium">Generating deep AI comparison...</span>
            </div>
          </TacticalCard>
        ) : error ? (
          <TacticalCard className="p-6 border-rose-500/20 bg-rose-500/[0.03]">
            <p className="text-sm font-medium text-rose-500 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> {error}
            </p>
          </TacticalCard>
        ) : aiData ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Executive Summary & Leader */}
            <div className="grid md:grid-cols-3 gap-6">
              <TacticalCard className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2 text-primary">
                    <Layers className="h-4 w-4" /> Strategic Synthesis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base font-medium leading-relaxed text-foreground/90">
                    {aiData.executive_summary}
                  </p>
                </CardContent>
              </TacticalCard>

              <TacticalCard>
                <CardHeader className="pb-3 text-center">
                  <CardTitle className="text-[11px] font-semibold text-muted-foreground tracking-wide">
                    Market Leader
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-3">
                  <div className="h-14 w-14 bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                    <TrendingUp className="h-7 w-7" />
                  </div>
                  <span className="text-xl font-bold text-foreground text-center tracking-tight">
                    {aiData.market_leader}
                  </span>
                </CardContent>
              </TacticalCard>
            </div>

            {/* Comparative Metrics Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wide">
                Key Advantages
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {aiData.comparative_metrics.map((m, i) => (
                  <TacticalCard key={i}>
                    <CardContent className="p-5 flex gap-4 items-start">
                      <div className="mt-1 h-8 w-8 bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-base flex items-center gap-2">
                          {m.metric_name}
                          <TacticalBadge variant="primary">Winner: {m.winner}</TacticalBadge>
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {m.rationale}
                        </p>
                      </div>
                    </CardContent>
                  </TacticalCard>
                ))}
              </div>
            </div>

            {/* Company Profiles */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wide">
                SWOT Profiles
              </h3>
              <div className="grid lg:grid-cols-2 gap-6">
                {aiData.company_profiles.map((p, i) => (
                  <Card
                    key={i}
                    className="overflow-hidden border-border/40 bg-card/50"
                  >
                    <div
                      className="h-[3px] w-full"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <CardHeader className="bg-muted/20 pb-4">
                      <CardTitle
                        className="text-lg font-bold tracking-tight"
                        style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}
                      >
                        {p.company_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-2 divide-x divide-border">
                        <div className="p-5 space-y-3 bg-emerald-500/[0.03]">
                          <h5 className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide flex items-center gap-1.5">
                            <CheckCircle2 className="h-3 w-3" /> Strengths
                          </h5>
                          <ul className="space-y-2">
                            {p.key_strengths.map((s, j) => (
                              <li key={j} className="text-sm text-foreground/90 flex items-start gap-2">
                                <span className="text-emerald-500 shrink-0 mt-0.5 text-xs">●</span>
                                <span className="leading-tight">{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-5 space-y-3 bg-rose-500/[0.03]">
                          <h5 className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 tracking-wide flex items-center gap-1.5">
                            <XCircle className="h-3 w-3" /> Risks & Weaknesses
                          </h5>
                          <ul className="space-y-2">
                            {p.key_weaknesses.map((w, j) => (
                              <li key={j} className="text-sm text-foreground/90 flex items-start gap-2">
                                <span className="text-rose-500 shrink-0 mt-0.5 text-xs">●</span>
                                <span className="leading-tight">{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Radar Chart */}
      <RadarComparison reports={readyReports} />

      {/* Risk Comparison */}
      <RiskComparison reports={readyReports} />
    </div>
  );
}

/* ── Sentiment Bar ── */
function SentimentBar({ reports }: { reports: ReportRecord[] }) {
  return (
    <section className="space-y-5">
      <SectionHeader icon={Scale} color="amber" title="Market Sentiment" />
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${reports.length}, 1fr)` }}>
        {reports.map((r, i) => {
          const sentiment = r.insights!.sentiment_score ?? 0;
          const pct = ((sentiment + 1) / 2) * 100;
          const isBullish = sentiment > 0.15;
          const isBearish = sentiment < -0.15;

          return (
            <TacticalCard key={r.id}>
              <CardContent className="pt-5 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm font-semibold truncate"
                    style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}
                  >
                    {r.insights!.company_name ?? r.filename}
                  </span>
                  <TacticalBadge
                    variant={isBullish ? "bullish" : isBearish ? "bearish" : "neutral"}
                  >
                    {isBullish ? "Bullish" : isBearish ? "Bearish" : "Neutral"}
                  </TacticalBadge>
                </div>
                <div className="relative h-3 bg-secondary overflow-hidden border border-border/30 rounded-sm">
                  <div
                    className={cn(
                      "absolute top-0 left-0 h-full transition-all duration-1000 rounded-sm",
                      isBullish
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                        : isBearish
                          ? "bg-gradient-to-r from-rose-600 to-rose-400"
                          : "bg-gradient-to-r from-amber-600 to-amber-400"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-2xl font-bold tabular-nums">
                  {sentiment > 0 ? "+" : ""}
                  {sentiment.toFixed(2)}
                </span>
              </CardContent>
            </TacticalCard>
          );
        })}
      </div>
    </section>
  );
}

/* ── Radar Comparison ── */
function RadarComparison({ reports }: { reports: ReportRecord[] }) {
  const radarData = useMemo(() => {
    const dimensions = [
      { key: "health", label: "Health" },
      { key: "metrics", label: "KPI Count" },
      { key: "sentiment", label: "Sentiment" },
      { key: "charts", label: "Data Richness" },
      { key: "ratios", label: "Ratio Count" },
      { key: "strategies", label: "Strategic Vision" },
    ];

    return dimensions.map((dim) => {
      const point: Record<string, string | number> = { dimension: dim.label };
      for (let i = 0; i < reports.length; i++) {
        const r = reports[i];
        const ins = r.insights!;
        const company = ins.company_name ?? r.filename;
        let val = 0;
        switch (dim.key) {
          case "health":
            val = (ins.financial_health_score ?? 5) * 10;
            break;
          case "metrics":
            val = Math.min((ins.key_metrics?.length ?? 0) * 5, 100);
            break;
          case "sentiment":
            val = ((ins.sentiment_score ?? 0) + 1) * 50;
            break;
          case "charts":
            val = Math.min((ins.generated_charts?.length ?? 0) * 16, 100);
            break;
          case "ratios":
            val = Math.min((ins.key_ratios?.length ?? 0) * 10, 100);
            break;
          case "strategies":
            val = Math.min((ins.strategic_initiatives?.length ?? 0) * 12, 100);
            break;
        }
        point[company] = Math.round(val);
      }
      return point;
    });
  }, [reports]);

  const companies = reports.map((r) => r.insights!.company_name ?? r.filename);

  return (
    <section className="space-y-5">
      <SectionHeader icon={Activity} color="primary" title="Report Quality Radar" />
      <TacticalCard>
        <CardContent className="pt-6 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              {companies.map((company, i) => (
                <Radar
                  key={company}
                  name={company}
                  dataKey={company}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              ))}
              <Legend
                wrapperStyle={{ fontSize: 12, fontWeight: 500 }}
                iconType="circle"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </TacticalCard>
    </section>
  );
}

/* ── Risk Comparison ── */
function RiskComparison({ reports }: { reports: ReportRecord[] }) {
  const hasRisks = reports.some((r) => (r.insights!.risk_analysis?.length ?? 0) > 0);
  if (!hasRisks) return null;

  return (
    <section className="space-y-5">
      <SectionHeader icon={AlertTriangle} color="rose" title="Risk Landscape" />
      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${reports.length}, 1fr)` }}>
        {reports.map((r, i) => (
          <TacticalCard
            key={r.id}
            className="overflow-hidden"
          >
            <div
              className="h-[3px] w-full"
              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <CardHeader className="pb-3">
              <CardTitle
                className="text-base font-bold tracking-tight"
                style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}
              >
                {r.insights!.company_name ?? r.filename}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(r.insights!.risk_analysis ?? []).slice(0, 5).map((risk, ri) => (
                <div key={ri} className="flex gap-2 items-start text-sm">
                  <span className="text-rose-500 mt-1 shrink-0 text-xs">●</span>
                  <span className="text-foreground/80 leading-relaxed">{risk}</span>
                </div>
              ))}
              {(r.insights!.risk_analysis?.length ?? 0) > 5 && (
                <span className="text-xs text-muted-foreground">
                  +{r.insights!.risk_analysis!.length - 5} more risks
                </span>
              )}
            </CardContent>
          </TacticalCard>
        ))}
      </div>
    </section>
  );
}
