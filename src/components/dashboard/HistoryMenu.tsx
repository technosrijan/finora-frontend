import { useEffect, useState } from "react";

import { History, Loader2, Trash2, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listHistory, deleteReportSet } from "@/lib/api";
import type { HistoryItem } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  currentSetId: string | null;
  refreshKey: number;
  onSelect: (id: string) => void;
  onDeleted: (id: string) => void;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

export function HistoryMenu({ currentSetId, refreshKey, onSelect, onDeleted }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fetchHistory = listHistory;
  const removeSet = deleteReportSet;

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchHistory();
      setItems(data);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't load history.");
    } finally {
      setLoading(false);
    }
  };

  // Load when opened, or when refreshKey changes (e.g. after a new upload).
  useEffect(() => {
    if (open) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, refreshKey]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    try {
      await removeSet({ data: { id } });
      setItems((prev) => prev?.filter((i) => i.id !== id) ?? null);
      onDeleted(id);
      toast.success("Removed from history.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed.";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">History</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Report analysis history</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading && (
          <div className="flex items-center justify-center px-3 py-6 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
          </div>
        )}

        {!loading && items && items.length === 0 && (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No analyses yet. Upload a report to get started.
          </div>
        )}

        {!loading &&
          items &&
          items.map((item) => {
            const isCurrent = item.id === currentSetId;
            const title = item.filenames[0] ?? "Untitled report";
            const extra = item.filenames.length > 1 ? ` +${item.filenames.length - 1}` : "";
            return (
              <DropdownMenuItem
                key={item.id}
                onSelect={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  onSelect(item.id);
                }}
                className={cn(
                  "flex items-start gap-2 py-2",
                  isCurrent && "bg-accent/50",
                )}
              >
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 truncate text-sm font-medium">
                    <span className="truncate">{title}</span>
                    {extra && <span className="text-muted-foreground">{extra}</span>}
                    {isCurrent && <Check className="h-3 w-3 text-primary" />}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {formatWhen(item.created_at)} · {item.ready_count}/{item.total_count} ready
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDelete(item.id, e)}
                  disabled={deletingId === item.id}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  aria-label="Delete from history"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </DropdownMenuItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
