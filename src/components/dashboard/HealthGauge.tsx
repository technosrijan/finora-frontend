import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Clean radial gauge showing a financial health score from 1–10.
 * Animated arc draw-in with count-up score and subtle glow.
 */
interface HealthGaugeProps {
  score: number; // 1-10
  size?: number;
  label?: string;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function HealthGauge({ score, size = 140, label = "Health Score" }: HealthGaugeProps) {
  const clampedScore = Math.max(1, Math.min(10, score));
  const [animatedScore, setAnimatedScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  const { color, text } = useMemo(() => {
    if (clampedScore >= 8) return { color: "var(--primary)", text: "Excellent" };
    if (clampedScore >= 6) return { color: "var(--chart-3)", text: "Good" };
    if (clampedScore >= 4) return { color: "var(--chart-4)", text: "Fair" };
    return { color: "var(--destructive)", text: "Weak" };
  }, [clampedScore]);

  /* Animate arc draw + score count-up on mount / score change */
  useEffect(() => {
    const duration = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(t);
      setProgress(eased);
      setAnimatedScore(eased * clampedScore);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [clampedScore]);

  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const maxArc = circumference * 0.75; // 270°
  const currentArc = progress * (clampedScore / 10) * maxArc;
  const offset = circumference * 0.125;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-2" style={{ width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id={`glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${maxArc} ${circumference - maxArc}`}
          strokeDashoffset={-offset}
          strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
          opacity={0.25}
        />

        {/* Value arc with subtle glow */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${currentArc} ${circumference - currentArc}`}
          strokeDashoffset={-offset}
          strokeLinecap="round"
          transform={`rotate(135 ${cx} ${cy})`}
          filter={`url(#glow-${size})`}
        />

        {/* Score number */}
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={size * 0.26}
          fontWeight={700}
          fontFamily="Inter, system-ui, sans-serif"
        >
          {animatedScore.toFixed(1)}
        </text>

        {/* Status label */}
        <text
          x={cx}
          y={cy + size * 0.17}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--muted-foreground)"
          fontSize={size * 0.08}
          fontWeight={500}
          fontFamily="Inter, system-ui, sans-serif"
          letterSpacing={0.5}
        >
          {text}
        </text>
      </svg>

      <span className="text-[11px] font-medium text-muted-foreground tracking-wide">
        {label}
      </span>
    </div>
  );
}
