import { cn } from "@/lib/utils";

interface BackgroundGraphicsProps {
  variant?: "landing" | "auth" | "upload" | "dashboard" | "chat" | "minimal";
  className?: string;
}

/* ── Reusable orb with drift animation ── */
function Orb({
  size,
  color,
  blur,
  position,
  anim,
}: {
  size: [number, number];
  color: string;
  blur: number;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  anim: string;
}) {
  return (
    <div
      className={`absolute rounded-full ${anim}`}
      style={{
        width: size[0],
        height: size[1],
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        ...position,
      }}
    />
  );
}

/* ── Reusable light streaks ── */
function LightStreaks({ count }: { count: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute h-[1.5px] w-[140%]"
          style={{
            top: `${18 + i * (80 / count)}%`,
            left: "-20%",
            background:
              i % 2 === 0
                ? "linear-gradient(90deg, transparent 0%, rgba(45,212,191,0.07) 50%, transparent 100%)"
                : "linear-gradient(90deg, transparent 0%, rgba(96,165,250,0.05) 50%, transparent 100%)",
            animation: i === 0 ? "streak-slow 22s ease-in-out infinite" : "streak 16s ease-in-out infinite",
            animationDelay: `${i * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Soft grid ── */
function SoftGrid({ size = 140 }: { size?: number }) {
  return (
    <div
      className="grid-bg absolute inset-0 pointer-events-none"
      style={{ backgroundSize: `${size}px ${size}px` }}
    />
  );
}

/* ── Vignette ── */
function Vignette({ bottom = 40 }: { bottom?: number }) {
  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent pointer-events-none" />
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: bottom * 4, background: "linear-gradient(to top, var(--background), transparent)" }}
      />
    </>
  );
}

/* ═════════════════════════════════════════════
   VARIANT CONFIGS
   ═════════════════════════════════════════════ */

const VARIANTS = {
  landing: {
    orbs: [
      { size: [800, 700] as [number, number], color: "rgba(45,212,191,0.35)", blur: 60, pos: { top: "-15%", right: "-10%" }, anim: "animate-orb-1" },
      { size: [700, 600] as [number, number], color: "rgba(96,165,250,0.25)", blur: 70, pos: { bottom: "-20%", left: "-15%" }, anim: "animate-orb-2" },
      { size: [500, 500] as [number, number], color: "rgba(251,191,36,0.15)", blur: 80, pos: { top: "35%", left: "5%" }, anim: "animate-orb-3" },
      { size: [750, 650] as [number, number], color: "rgba(45,212,191,0.18)", blur: 90, pos: { bottom: "-10%", right: "5%" }, anim: "animate-orb-4" },
    ],
    streaks: 4,
  },
  auth: {
    orbs: [
      { size: [700, 600] as [number, number], color: "rgba(45,212,191,0.22)", blur: 70, pos: { top: "-10%", right: "-15%" }, anim: "animate-orb-2" },
      { size: [600, 500] as [number, number], color: "rgba(96,165,250,0.14)", blur: 80, pos: { bottom: "-15%", left: "-10%" }, anim: "animate-orb-1" },
    ],
    streaks: 2,
  },
  upload: {
    orbs: [
      { size: [650, 550] as [number, number], color: "rgba(45,212,191,0.20)", blur: 75, pos: { top: "-12%", right: "-8%" }, anim: "animate-orb-1" },
      { size: [550, 500] as [number, number], color: "rgba(96,165,250,0.12)", blur: 85, pos: { bottom: "-18%", left: "-12%" }, anim: "animate-orb-3" },
    ],
    streaks: 2,
  },
  dashboard: {
    orbs: [
      { size: [500, 500] as [number, number], color: "rgba(45,212,191,0.08)", blur: 120, pos: { top: "-10%", right: "-5%" }, anim: "" },
    ],
    stars: 0,
    streaks: 0,
  },
  chat: {
    orbs: [
      { size: [500, 500] as [number, number], color: "rgba(45,212,191,0.06)", blur: 120, pos: { top: "-10%", right: "-5%" }, anim: "" },
    ],
    stars: 0,
    streaks: 0,
  },
  minimal: {
    orbs: [
      { size: [500, 500] as [number, number], color: "rgba(45,212,191,0.05)", blur: 120, pos: { top: "-10%", right: "-5%" }, anim: "" },
    ],
    stars: 0,
    streaks: 0,
  },
};

/* ═════════════════════════════════════════════
   MAIN COMPONENT
   ═════════════════════════════════════════════ */

export function BackgroundGraphics({ variant = "minimal", className }: BackgroundGraphicsProps) {
  const config = VARIANTS[variant];

  return (
    <div className={cn("fixed inset-0 overflow-hidden", className)}>
      <SoftGrid size={config.streaks > 0 ? 140 : 100} />

      {/* Orbs */}
      {config.orbs.map((o, i) => (
        <Orb key={i} size={o.size} color={o.color} blur={o.blur} position={o.pos} anim={o.anim} />
      ))}

      {/* Streaks */}
      {config.streaks > 0 && <LightStreaks count={config.streaks} />}

      <Vignette bottom={config.streaks > 0 ? 40 : 10} />
    </div>
  );
}


