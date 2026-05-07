import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import type { ProgressState } from "@/lib/types";

interface ProgressIndicatorProps {
  progress: ProgressState;
  reportIndex?: number;
  totalReports?: number;
}

export function ProgressIndicator({
  progress,
  reportIndex = 1,
  totalReports = 1,
}: ProgressIndicatorProps) {
  const isComplete = progress.status === "ready";
  const isError = progress.status === "error";
  const isProcessing = progress.status === "processing" || progress.status === "queued";

  return (
    <div className="w-full space-y-3 rounded-md border border-primary/20 bg-primary/[0.03] p-4 animate-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isError ? (
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          ) : isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          ) : (
            <Clock className="h-5 w-5 text-primary animate-spin-slow shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">
              {totalReports > 1 ? `Report ${reportIndex}/${totalReports}` : "Processing report"}
            </p>
            <p className="text-xs text-muted-foreground">
              {progress.current_step || "Initializing..."}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary">
            {progress.progress}%
          </p>
          {isProcessing && (
            <p className="text-xs text-muted-foreground">
              {progress.completed_steps}/{progress.total_steps} steps
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-background rounded-sm overflow-hidden border border-primary/10">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-sm transition-all duration-500 ease-out"
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      {/* Error State */}
      {isError && progress.error && (
        <div className="mt-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-sm">
          <p className="text-xs text-destructive font-medium">{progress.error}</p>
        </div>
      )}

      {/* Complete State */}
      {isComplete && (
        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          Processing complete and ready for analysis
        </div>
      )}
    </div>
  );
}
