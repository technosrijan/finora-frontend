import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Menu, TrendingUp, LogOut, User as UserIcon } from "lucide-react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { DesktopSidebar, SidebarContents } from "@/components/dashboard/Sidebar";
import { UploadSection } from "@/components/dashboard/UploadSection";
import { Overview } from "@/components/dashboard/Overview";
import { ChatSection } from "@/components/dashboard/ChatSection";
import { HistoryMenu } from "@/components/dashboard/HistoryMenu";
import { AuthPage } from "@/components/dashboard/AuthPage";
import { LandingPage } from "@/components/landing/LandingPage";
import { BackgroundGraphics } from "@/components/ui/BackgroundGraphics";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  uploadReportSet,
  getReportSet,
  processReport,
  isAuthenticated,
  getStoredUser,
  getUserProfile,
  clearAuth,
  logout,
} from "@/lib/api";
import { toast } from "sonner";
import type { ReportSet, ReportStatus, SectionKey } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")(
  {
    head: () => ({
      meta: [
        { title: "Finora — Enterprise Financial Intelligence" },
        {
          name: "description",
          content:
            "Compare up to 3 corporate annual report PDFs side-by-side as a single visual investor dashboard.",
        },
        { property: "og:title", content: "Finora — Enterprise Financial Intelligence" },
        {
          property: "og:description",
          content:
            "Compare up to 3 corporate annual report PDFs side-by-side as a single visual investor dashboard.",
        },
      ],
    }),
    component: IndexPage,
  },
);

function IndexPage() {
  return (
    <ThemeProvider>
      <AuthGate />
    </ThemeProvider>
  );
}

/* Auth gate — validates the stored JWT against the server on first mount.
   Unauthenticated users see the cinematic landing page first. */
function AuthGate() {
  const [authed, setAuthed] = useState<boolean | null>(
    isAuthenticated() ? null : false,
  );
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (authed !== null) return;
    getUserProfile()
      .then(() => setAuthed(true))
      .catch(() => {
        clearAuth();
        setAuthed(false);
      });
  }, [authed]);

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!authed) {
    if (!showAuth) {
      return <LandingPage onEnter={() => setShowAuth(true)} />;
    }
    return <AuthPage onAuth={() => setAuthed(true)} />;
  }

  return <FinoraApp onLogout={() => setAuthed(false)} />;
}

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 900_000;
const STORAGE_KEY = "finora.reportSetId";

function aggregateStatus(set: ReportSet | null): ReportStatus | null {
  if (!set || set.reports.length === 0) return null;
  if (set.reports.every((r) => r.status === "ready")) return "ready";
  if (set.reports.some((r) => r.status === "processing" || r.status === "queued")) return "processing";
  if (set.reports.some((r) => r.status === "error")) return "error";
  return "queued";
}

/* Animated page transition wrapper */
function PageTransition({ children, section }: { children: React.ReactNode; section: SectionKey }) {
  return (
    <div
      key={section}
      className="animate-in fade-in slide-in-from-right-6 duration-500 fill-mode-both relative"
    >
      {children}
    </div>
  );
}

function FinoraApp({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState<SectionKey>("upload");
  const [reportSet, setReportSet] = useState<ReportSet | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [historyKey, setHistoryKey] = useState(0);
  const pollRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const user = getStoredUser();

  const navigate = useCallback((s: SectionKey) => {
    setSection(s);
    setMobileOpen(false);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback((id: string) => {
    stopPolling();
    setTimedOut(false);
    startedAtRef.current = Date.now();
    pollRef.current = window.setInterval(async () => {
      try {
        const next = await getReportSet({ data: { id } });
        setReportSet(next);
        const agg = aggregateStatus(next);
        if (agg === "ready" || agg === "error") {
          stopPolling();
          setHistoryKey((k) => k + 1);
          return;
        }
        if (Date.now() - startedAtRef.current > POLL_TIMEOUT_MS) {
          stopPolling();
          setTimedOut(true);
        }
      } catch (e) {
        console.error("poll error:", e);
      }
    }, POLL_INTERVAL_MS);
  }, [stopPolling]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedId = sessionStorage.getItem(STORAGE_KEY);
    if (!savedId) return;
    getReportSet({ data: { id: savedId } })
      .then((set) => {
        setReportSet(set);
        const agg = aggregateStatus(set);
        if (agg === "ready") {
          navigate("overview");
        } else if (agg === "processing" || agg === "queued") {
          navigate("overview");
          startPolling(savedId);
        }
      })
      .catch(() => {
        sessionStorage.removeItem(STORAGE_KEY);
      });
  }, [navigate, startPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const handleUpload = async (files: File[]) => {
    try {
      setTimedOut(false);
      const formData = new FormData();
      for (const f of files) formData.append("files", f);
      const created = await uploadReportSet({ data: formData });
      setReportSet(created);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY, created.id);
      }
      setHistoryKey((k) => k + 1);
      navigate("overview");
      startPolling(created.id);
      const queued = created.reports.filter((r) => r.status === "queued");
      void Promise.all(
        queued.map((r) =>
          processReport({ data: { id: r.id } }).catch((e) => {
            console.error("process start failed:", e);
          }),
        ),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed.";
      toast.error(msg);
    }
  };

  const handleRetry = () => {
    stopPolling();
    setReportSet(null);
    setTimedOut(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    navigate("upload");
  };

  const handleHistorySelect = async (id: string) => {
    stopPolling();
    try {
      const set = await getReportSet({ data: { id } });
      setReportSet(set);
      if (typeof window !== "undefined") sessionStorage.setItem(STORAGE_KEY, id);
      const agg = aggregateStatus(set);
      navigate("overview");
      if (agg === "processing" || agg === "queued") startPolling(id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't load report.";
      toast.error(msg);
    }
  };

  const handleHistoryDeleted = (id: string) => {
    if (reportSet?.id === id) {
      setReportSet(null);
      if (typeof window !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
      navigate("upload");
    }
  };

  const aggStatus = aggregateStatus(reportSet);
  const readyCount = reportSet?.reports.filter((r) => r.status === "ready").length ?? 0;
  const totalCount = reportSet?.reports.length ?? 0;
  const loadingCaption =
    aggStatus === "queued"
      ? "Upload complete. Starting analysis…"
      : aggStatus === "processing"
        ? `Analysing reports (${readyCount}/${totalCount} done)…`
        : null;

  const bgVariant = section === "upload" ? "upload" : section === "overview" ? "dashboard" : "chat";

  return (
    <div className="flex min-h-screen w-full text-foreground relative">
      <BackgroundGraphics variant={bgVariant} />

      {/* Content layer above background */}
      <div className="relative z-10 flex w-full">

      <DesktopSidebar active={section} onNavigate={navigate} processingStatus={aggStatus} />

      <div className="flex w-0 flex-1 flex-col relative">
        {/* Top bar */}
        <header className="relative flex items-center justify-between border-b border-border/40 px-3 py-2 md:px-6 md:py-3 bg-background/60 backdrop-blur-sm">

          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContents
                  active={section}
                  onNavigate={navigate}
                  processingStatus={aggStatus}
                />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center bg-primary/10 text-primary border border-primary/20">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="text-base font-bold tracking-tight">
                Finora
              </span>
            </div>
          </div>
          <div className="hidden md:block" />

          <div className="flex items-center gap-2">
            <HistoryMenu
              currentSetId={reportSet?.id ?? null}
              refreshKey={historyKey}
              onSelect={handleHistorySelect}
              onDeleted={handleHistoryDeleted}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-border/60 bg-card/40 backdrop-blur-sm">
                  <div className="flex h-5 w-5 items-center justify-center bg-primary/20 text-primary">
                    <UserIcon className="h-3 w-3" />
                  </div>
                  <span className="hidden sm:inline text-xs font-medium truncate max-w-[120px]">
                    {user?.display_name || user?.email || "Account"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-bold tracking-tight truncate">{user?.display_name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => { logout(); onLogout(); }}
                  className="text-destructive focus:text-destructive text-xs font-medium"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative">
          {section === "upload" && (
            <PageTransition section="upload">
              <UploadSection
                processingStatus={aggStatus}
                processingCaption={loadingCaption}
                onUpload={handleUpload}
                staged={stagedFiles}
                setStaged={setStagedFiles}
                reportIds={reportSet?.reports.map((r) => r.id) ?? []}
              />
            </PageTransition>
          )}
          {section === "overview" && (
            <PageTransition section="overview">
              <Overview
                reportSet={reportSet}
                loadingCaption={loadingCaption}
                timedOut={timedOut}
                onRetry={handleRetry}
              />
            </PageTransition>
          )}
          {section === "chat" && (
            <PageTransition section="chat">
              <ChatSection reportSet={reportSet} />
            </PageTransition>
          )}
        </main>
      </div>

      </div>{/* /content layer */}
    </div>
  );
}
