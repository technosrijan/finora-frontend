import { useState } from "react";
import {
  TrendingUp,
  Upload,
  LayoutDashboard,
  MessagesSquare,
  Clock,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SectionKey, ReportStatus } from "@/lib/types";

interface SidebarProps {
  active: SectionKey;
  onNavigate: (s: SectionKey) => void;
  processingStatus: ReportStatus | null;
}

interface SidebarContentsProps extends SidebarProps {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const NAV: { key: SectionKey; label: string; icon: typeof Upload }[] = [
  { key: "upload", label: "Upload Report", icon: Upload },
  { key: "overview", label: "Dashboard", icon: LayoutDashboard },
  { key: "chat", label: "AI Chat", icon: MessagesSquare },
];

/* Tactical nav item with animated diagonal border */
function NavItem({
  item,
  isActive,
  isProcessing,
  collapsed,
  onClick,
}: {
  item: (typeof NAV)[number];
  isActive: boolean;
  isProcessing: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex w-full items-center overflow-hidden transition-all duration-300",
        "border-l-2",
        collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3",
        isActive
          ? "border-primary bg-primary/5 text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-primary" />
      )}

      {/* Icon with glow on active */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-center transition-all duration-300",
          collapsed ? "h-6 w-6" : "h-5 w-5",
          isActive && "drop-shadow-[0_0_6px_var(--primary)]"
        )}
      >
        <Icon className="h-full w-full" aria-hidden />
      </div>

      {!collapsed && (
        <>
          <span className="flex-1 text-left text-[13px] font-medium">
            {item.label}
          </span>

          {isProcessing && item.key === "upload" && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-primary animate-pulse">
              <Clock className="h-3 w-3" />
              Live
            </span>
          )}
        </>
      )}

      {/* Hover background */}
      <div
        className={cn(
          "absolute inset-0 bg-primary/[0.03] transition-opacity duration-200",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      />
    </button>
  );
}

export function SidebarContents({
  active,
  onNavigate,
  processingStatus,
  collapsed = false,
  onToggleCollapsed,
}: SidebarContentsProps) {
  const isProcessing = processingStatus === "queued" || processingStatus === "processing";

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className="flex h-full flex-col text-sidebar-foreground relative backdrop-blur-xl bg-gradient-to-b from-[rgba(18,22,28,0.82)] via-[rgba(14,18,24,0.88)] to-[rgba(18,22,28,0.82)] light:from-[rgba(250,250,252,0.88)] light:via-[rgba(245,245,248,0.92)] light:to-[rgba(250,250,252,0.88)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] light:shadow-[inset_0_1px_0_rgba(0,0,0,0.03)]"
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center gap-3 py-5",
            collapsed ? "justify-center px-2" : "px-5"
          )}
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center bg-primary/10 text-primary border border-primary/20">
            <TrendingUp className="h-5 w-5" aria-hidden />
          </div>
          {!collapsed && (
            <div className="relative text-lg leading-none tracking-tight">
              <span className="font-bold">Finora</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px mx-4 mb-2 bg-border/60" />

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 py-2" aria-label="Primary">
          {NAV.map(({ key, label, icon: Icon }) => (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <div>
                  <NavItem
                    item={{ key, label, icon: Icon }}
                    isActive={active === key}
                    isProcessing={isProcessing && key === "upload"}
                    collapsed={collapsed}
                    onClick={() => onNavigate(key)}
                  />
                </div>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
            </Tooltip>
          ))}
        </nav>

        {/* Bottom section */}
        <div className={cn("space-y-1 pb-4 pt-2", collapsed ? "px-2" : "px-3")}>
          {/* Diagonal accent divider */}
          <div className="relative h-px mx-1 mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-border via-primary/30 to-border" />
          </div>

          {onToggleCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCollapsed}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className={cn(
                    "w-full gap-2 text-xs font-medium",
                    collapsed ? "justify-center px-0" : "justify-start",
                  )}
                >
                  {collapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                  {!collapsed && <span>Collapse</span>}
                </Button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Expand</TooltipContent>}
            </Tooltip>
          )}

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="ghost" size="sm" className="w-full justify-center px-0">
                  <a href="mailto:hello@finora.co" target="_blank" rel="noreferrer" aria-label="Help">
                    <HelpCircle className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Help</TooltipContent>
            </Tooltip>
          ) : (
            <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs font-medium">
              <a href="mailto:hello@finora.co" target="_blank" rel="noreferrer">
                <HelpCircle className="h-4 w-4" />
                <span>Support</span>
              </a>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </TooltipProvider>
  );
}

export function DesktopSidebar(props: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 self-start transition-[width] duration-300 md:block",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
      aria-label="Sidebar"
    >
      <div className="relative h-full">
        {/* Subtle right border accent */}
        <div
          className="absolute -right-[1px] top-0 bottom-0 w-px z-10 hidden md:block"
          style={{
            background: "linear-gradient(180deg, transparent 0%, var(--border) 20%, var(--border) 80%, transparent 100%)",
          }}
        />

        <SidebarContents
          {...props}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
        />
      </div>
    </aside>
  );
}
