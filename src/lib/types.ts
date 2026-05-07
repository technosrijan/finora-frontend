// Shared types matching the Dynamic AI extraction JSON schema.

export type SectionKey = "upload" | "overview" | "chat";

export type ReportStatus = "queued" | "processing" | "ready" | "error";

export interface ProgressState {
  status: ReportStatus;
  progress: number;
  current_step: string;
  total_steps: number;
  completed_steps: number;
  error: string | null;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
}

export interface HistoryItem {
  id: string;
  created_at: string;
  filenames: string[];
  ready_count: number;
  total_count: number;
}

export interface DynamicMetric {
  name: string;
  value: string;
  trend: string;
  context: string;
}

export interface KeyRatio {
  name: string;
  value: string;
  assessment: "strong" | "moderate" | "weak" | "neutral";
  context: string;
}

export interface RevenueSegment {
  segment: string;
  value: number;
  amount: string;
}

interface DynamicChartDataPoint {
  label: string;
  value: number;
}

export interface DynamicChart {
  title: string;
  chart_type: "bar" | "line" | "pie" | "area";
  x_axis_label: string;
  y_axis_label: string;
  data_points: DynamicChartDataPoint[];
}

export interface ReportInsights {
  company_name?: string;
  reporting_period?: string;
  sector?: string;
  financial_health_score?: number;
  sentiment_score?: number;
  executive_summary: string;
  key_metrics: DynamicMetric[];
  key_ratios?: KeyRatio[];
  revenue_breakdown?: RevenueSegment[];
  generated_charts: DynamicChart[];
  risk_analysis: string[];
  strategic_initiatives: string[];
}

export interface ReportRecord {
  id: string;
  filename: string;
  status: ReportStatus;
  insights: ReportInsights | null;
  summary: string | null;
  error: string | null;
  created_at: string;
  /** LLM input tokens consumed during extraction */
  token_usage_input?: number;
  /** LLM output tokens consumed during extraction */
  token_usage_output?: number;
}

export interface ReportSet {
  id: string;
  reports: ReportRecord[];
  created_at: string;
}

// Comparison data from /api/reports/compare/{set_id}
interface ComparisonMetricValue {
  value: string;
  trend: string;
}

interface ComparisonMetric {
  name: string;
  values: Record<string, ComparisonMetricValue>;
}

interface ComparisonReportSummary {
  id: string;
  company_name: string;
  filename: string;
  period: string;
  sector: string;
  health_score: number;
  sentiment: number;
}

// AI Comparison data from /api/reports/compare_ai/{set_id}
interface ComparativeMetric {
  metric_name: string;
  winner: string;
  rationale: string;
}

interface CompanyStrength {
  company_name: string;
  key_strengths: string[];
  key_weaknesses: string[];
}

export interface AIComparisonData {
  executive_summary: string;
  market_leader: string;
  comparative_metrics: ComparativeMetric[];
  company_profiles: CompanyStrength[];
}
