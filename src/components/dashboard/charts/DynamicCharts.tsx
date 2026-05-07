import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DynamicChart, RevenueSegment } from "@/lib/types";

// Premium color palette
export const CHART_COLORS = [
  "hsl(217, 91%, 60%)", // Blue
  "hsl(160, 70%, 45%)", // Emerald
  "hsl(280, 65%, 60%)", // Purple
  "hsl(30, 95%, 60%)",  // Orange
  "hsl(330, 80%, 60%)", // Pink
  "hsl(200, 75%, 55%)", // Cyan
  "hsl(50, 90%, 50%)",  // Gold
];

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-sm border bg-card/95 backdrop-blur shadow-lg p-3 text-sm font-medium">
        {label && <p className="mb-2 text-muted-foreground">{label}</p>}
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }}></div>
            <span className="text-muted-foreground">{p.name}:</span>
            <span className="text-foreground font-bold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function RenderDynamicChart({ chart }: { chart: DynamicChart }) {
  if (!chart.data_points || chart.data_points.length === 0) return null;

  if (chart.chart_type === "bar") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chart.data_points} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={1}/>
              <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0.6}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
          <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.2 }} />
          <Bar dataKey="value" name={chart.y_axis_label || "Value"} fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={40} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chart.chart_type === "line") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chart.data_points} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
          <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="value" 
            name={chart.y_axis_label || "Value"} 
            stroke={CHART_COLORS[1]} 
            strokeWidth={3} 
            dot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }} 
            activeDot={{ r: 6, strokeWidth: 0 }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chart.chart_type === "area") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chart.data_points} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS[2]} stopOpacity={0.4}/>
              <stop offset="100%" stopColor={CHART_COLORS[2]} stopOpacity={0.02}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
          <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            name={chart.y_axis_label || "Value"}
            stroke={CHART_COLORS[2]}
            strokeWidth={2.5}
            fill="url(#areaGrad)"
            dot={{ r: 3, strokeWidth: 2, fill: "var(--background)" }}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (chart.chart_type === "pie") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={chart.data_points} 
            dataKey="value" 
            nameKey="label" 
            cx="50%" 
            cy="45%" 
            innerRadius={50}
            outerRadius={75} 
            paddingAngle={4}
            stroke="none"
            animationDuration={800}
          >
            {chart.data_points.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, fontWeight: 500, paddingTop: 8 }} iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Chart type not supported.</div>;
}

/* ── Revenue Breakdown Donut ── */
export function RevenueDonut({ segments }: { segments: RevenueSegment[] }) {
  if (!segments || segments.length === 0) return null;

  const data = segments.map(s => ({
    name: s.segment,
    value: s.value,
    amount: s.amount,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          innerRadius={50}
          outerRadius={78}
          paddingAngle={3}
          stroke="none"
          animationDuration={900}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }: any) => {
            if (active && payload?.[0]) {
              const d = payload[0].payload;
              return (
                <div className="rounded-sm border bg-card/95 backdrop-blur shadow-lg p-3 text-sm">
                  <p className="font-bold text-foreground">{d.name}</p>
                  <p className="text-muted-foreground">{d.value}% · {d.amount}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 8 }} iconType="circle" iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  );
}
