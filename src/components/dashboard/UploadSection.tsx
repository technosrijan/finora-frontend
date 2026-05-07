import { useCallback, useRef, useState, useEffect } from "react";
import { Upload, FileText, AlertCircle, Clock, X, Zap, BarChart3, Layers, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProgressIndicator } from "./ProgressIndicator";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { getReportProgress } from "@/lib/api";
import type { ReportStatus, ProgressState } from "@/lib/types";

const MAX_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 3;

interface UploadSectionProps {
  processingStatus: ReportStatus | null;
  processingCaption?: string | null;
  onUpload: (files: File[]) => Promise<void> | void;
  staged: File[];
  setStaged: React.Dispatch<React.SetStateAction<File[]>>;
  reportIds?: string[];
}

export function UploadSection({
  processingStatus,
  processingCaption,
  onUpload,
  staged = [],
  setStaged,
  reportIds = [],
}: UploadSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progressStates, setProgressStates] = useState<Record<string, ProgressState>>({});
  const pollRef = useRef<number | null>(null);

  const isBusy = processingStatus === "queued" || processingStatus === "processing";
  const disabled = isBusy || submitting;

  useEffect(() => {
    if (reportIds.length === 0) {
      if (pollRef.current !== null) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    const pollProgress = async () => {
      try {
        const updates: Record<string, ProgressState> = {};
        await Promise.all(
          reportIds.map(async (id) => {
            try {
              const progress = await getReportProgress(id);
              updates[id] = progress;
            } catch (e) {
              console.error(`Failed to poll progress for ${id}:`, e);
            }
          })
        );
        setProgressStates(updates);
      } catch (e) {
        console.error("Progress polling failed:", e);
      }
    };

    pollProgress();
    pollRef.current = window.setInterval(pollProgress, 1500);

    return () => {
      if (pollRef.current !== null) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [reportIds]);

  const stage = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    setError(null);
    const list = [...staged];
    for (const f of Array.from(incoming)) {
      if (f.type !== "application/pdf") {
        setError(`${f.name}: only PDF files are accepted.`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        setError(`${f.name}: must be under 25MB.`);
        continue;
      }
      if (list.length >= MAX_FILES) {
        setError(`Max ${MAX_FILES} PDFs.`);
        break;
      }
      if (list.some((s) => s.name === f.name && s.size === f.size)) continue;
      list.push(f);
    }
    setStaged(list);
  };

  const removeStaged = (idx: number) => {
    setStaged((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = useCallback(async () => {
    if (disabled || staged.length === 0) return;
    try {
      setSubmitting(true);
      await onUpload(staged);
      setStaged([]);
    } finally {
      setSubmitting(false);
    }
  }, [disabled, onUpload, staged]);

  return (
    <div className="relative z-0 mx-auto w-full max-w-2xl flex flex-col justify-center h-[calc(100vh-4rem)] px-4 overflow-hidden">
      {/* Center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="relative space-y-4">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <TypewriterText
              lines={["Upload Reports"]}
              speed={50}
              lineDelay={0}
              className="text-gradient-hero"
            />
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-700 delay-300 fill-mode-both">
            Upload up to 3 annual reports (PDF). AI extracts metrics, scores health, and builds your dashboard.
          </p>
        </header>

        {/* Processing Status */}
        {isBusy && (
          <div
            role="status"
            className="mx-auto max-w-lg w-full flex items-start gap-3 border border-primary/20 bg-primary/[0.04] p-4 shadow-sm animate-in zoom-in-95 duration-300 rounded-xl"
          >
            <div className="space-y-3 w-full">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-primary/15 text-primary rounded-lg">
                  <Clock className="h-4 w-4 animate-spin-slow" aria-hidden />
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <p className="text-sm font-semibold text-foreground">AI is analyzing your reports…</p>
                  <p className="text-xs text-muted-foreground">
                    {processingCaption ?? "Extracting tables, parsing metrics, and building your dashboard."}
                  </p>
                </div>
              </div>
              {reportIds.length > 0 && (
                <div className="space-y-2 pl-12">
                  {reportIds.map((reportId, idx) => (
                    <ProgressIndicator
                      key={reportId}
                      progress={progressStates[reportId] || {
                        status: "queued",
                        progress: 5,
                        current_step: "Parsing PDF…",
                        total_steps: 6,
                        completed_steps: 0,
                        error: null,
                      }}
                      reportIndex={idx + 1}
                      totalReports={reportIds.length}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Drop zone */}
        {!isBusy && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!disabled) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              stage(e.dataTransfer.files);
            }}
            onClick={() => !disabled && inputRef.current?.click()}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            aria-label="Upload PDFs"
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            className={cn(
              "group relative flex flex-col items-center justify-center gap-3 border-2 border-dashed bg-card/40 backdrop-blur-sm p-6 sm:p-8 text-center transition-all duration-300 ease-out rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 fill-mode-both",
              disabled ? "cursor-not-allowed opacity-50 border-border/50" : "cursor-pointer border-primary/20 hover:border-primary/50 hover:bg-card/60",
              dragOver && "border-primary bg-primary/[0.05] scale-[1.01]",
            )}
          >
            <div className={cn(
              "flex h-12 w-12 items-center justify-center transition-colors duration-300 rounded-xl",
              dragOver ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
            )}>
              {submitting ? <FileUp className="h-5 w-5 animate-bounce" /> : <Upload className="h-5 w-5" />}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">
                {submitting ? "Uploading files…" : dragOver ? "Drop files now" : "Click or drag PDFs here"}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                Up to {MAX_FILES} PDFs · 25MB max per file
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(e) => stage(e.target.files)}
            />
          </div>
        )}

        {/* Staged files */}
        {staged.length > 0 && !isBusy && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-semibold text-foreground">
                {staged.length} of {MAX_FILES} ready
              </p>
              {staged.length >= 2 && (
                <span className="inline-flex items-center gap-1.5 border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary rounded-full">
                  <span className="h-1.5 w-1.5 bg-primary animate-pulse rounded-full" />
                  Comparison mode
                </span>
              )}
            </div>
            <ul className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {staged.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-3 border border-border/40 bg-card/50 backdrop-blur-sm px-3 py-2 shadow-sm hover:shadow-md transition-all group rounded-lg"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-primary/10 text-primary rounded-md">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <span className="flex-1 truncate font-medium text-sm text-foreground/90">{f.name}</span>
                  <span className="shrink-0 text-[11px] font-semibold text-muted-foreground tabular-nums bg-muted/60 px-2 py-0.5 rounded-md">
                    {(f.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStaged(i);
                    }}
                    className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors rounded-md"
                    aria-label={`Remove ${f.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="pt-1 space-y-2">
              <Button
                onClick={() => void submit()}
                disabled={disabled}
                size="lg"
                className="w-full text-sm font-semibold h-10 border border-primary/20 shadow-sm transition-all hover:shadow-md rounded-lg"
              >
                {submitting
                  ? "Uploading…"
                  : `Generate dashboard for ${staged.length} report${staged.length > 1 ? "s" : ""}`}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Est. processing: ~{staged.length * 45}–{staged.length * 90}s
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive shadow-sm animate-in shake rounded-xl"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span className="font-medium text-xs">{error}</span>
          </div>
        )}

        {/* Feature Highlights */}
        {staged.length === 0 && !isBusy && (
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Zap, title: "Instant", desc: "100+ pages in <60s", color: "bg-primary/10 text-primary border-primary/20" },
              { icon: BarChart3, title: "Dashboards", desc: "Auto charts & scores", color: "bg-accent/10 text-accent border-accent/20" },
              { icon: Layers, title: "Compare", desc: "Up to 3 side-by-side", color: "bg-primary/10 text-primary border-primary/20" },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center space-y-2 p-3 border border-border/40 bg-card/40 backdrop-blur-sm rounded-xl transition-all duration-300 hover:border-border/60 hover:bg-card/50 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                style={{ animationDelay: `${600 + i * 100}ms` }}
              >
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border", color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-semibold text-xs text-foreground">{title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
