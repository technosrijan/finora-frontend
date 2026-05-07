import { useEffect, useMemo, useRef, useState } from "react";
import { MessagesSquare, Send, Loader2, FileText, AlertCircle, CheckCircle2, Trash2, Sparkles, Bot, User, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  getChatMessages,
  saveChatTurn,
  clearChatMessages,
  getChatStreamUrl,
  getAuthHeaders,
} from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ReportSet } from "@/lib/types";
import { CHART_COLORS } from "./charts/DynamicCharts";

const SUGGESTIONS = [
  "Summarise the key risks across these reports",
  "Compare year-on-year revenue growth",
  "Which company has the strongest balance sheet?",
  "What are the key financial ratios?",
  "Explain the revenue breakdown by segment",
  "What is the overall financial health assessment?",
];

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface ChatSectionProps {
  reportSet: ReportSet | null;
}

export function ChatSection({ reportSet }: ChatSectionProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const fetchHistory = getChatMessages;
  const persistTurn = saveChatTurn;
  const clearHistory = clearChatMessages;
  const lastLoadedHistoryFor = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const readyReports = useMemo(
    () => reportSet?.reports.filter((r) => r.status === "ready") ?? [],
    [reportSet],
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!reportSet?.id) {
      setMessages([]);
      lastLoadedHistoryFor.current = null;
      return;
    }
    if (lastLoadedHistoryFor.current === reportSet.id) return;
    lastLoadedHistoryFor.current = reportSet.id;
    setHistoryLoading(true);
    setMessages([]);
    fetchHistory({ data: { reportSetId: reportSet.id } })
      .then((r) => setMessages(r.messages.map((m: any) => ({ role: m.role, content: m.content }))))
      .catch((e) => {
        console.error("history load failed:", e);
      })
      .finally(() => setHistoryLoading(false));
  }, [reportSet?.id, fetchHistory]);

  const handleCopy = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || streaming) return;

    const userMsg: Msg = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(getChatStreamUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ reportSetId: reportSet?.id, messages: nextMessages }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Rate limited. Try again shortly.");
        else if (resp.status === 401) toast.error("Session expired. Please refresh.");
        else {
          const errBody = await resp.text();
          toast.error(`Chat failed: ${errBody.slice(0, 120)}`);
        }
        setMessages(nextMessages);
        setStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const p = JSON.parse(json);
            const content = p.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsert(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (reportSet?.id && assistantSoFar.trim()) {
        try {
          await persistTurn({
            data: {
              reportSetId: reportSet.id,
              userMessage: text,
              assistantMessage: assistantSoFar,
            },
          });
        } catch (e) {
          console.error("Couldn't save chat turn:", e);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Chat connection failed.");
    } finally {
      setStreaming(false);
    }
  };

  const handleClear = async () => {
    if (!reportSet?.id || streaming) return;
    if (!window.confirm("Clear all messages for this report?")) return;
    try {
      await clearHistory({ data: { reportSetId: reportSet.id } });
      setMessages([]);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't clear chat.");
    }
  };

  const hasReports = readyReports.length > 0;
  const hasAnyReports = (reportSet?.reports.length ?? 0) > 0;

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-3xl flex-col px-4 py-2 relative">
      {/* Compact Header */}
      <header className="flex items-center justify-between gap-3 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h1 className="text-lg font-bold tracking-tight">AI Chat</h1>
          <span className="hidden sm:inline text-xs text-muted-foreground">· Ask about your reports</span>
        </div>
        {messages.length > 0 && reportSet?.id && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void handleClear()}
            disabled={streaming}
            className="shrink-0 gap-1.5 text-muted-foreground hover:text-destructive h-8"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Clear</span>
          </Button>
        )}
      </header>

      {/* Compact status bar */}
      {hasAnyReports ? (
        <div className="mb-2 border border-emerald-500/20 bg-emerald-500/[0.03] px-2.5 py-1.5 rounded-md shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-500">
            <CheckCircle2 className="h-3 w-3" />
            <span className="truncate">
              {readyReports.length} of {reportSet!.reports.length} report{reportSet!.reports.length > 1 ? "s" : ""} loaded · RAG active
            </span>
          </div>
        </div>
      ) : (
        <div className="mb-2 border border-amber-500/20 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-500 rounded-md shrink-0">
          Upload a report first — chat uses those PDFs as context.
        </div>
      )}

      {/* Chat container */}
      <div className="flex flex-1 flex-col overflow-hidden border border-border/40 bg-card/40 backdrop-blur-sm shadow-sm rounded-xl relative min-h-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 min-h-0">
          {historyLoading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                <MessagesSquare className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  {hasReports
                    ? `Ready to answer questions about ${readyReports.length} report${readyReports.length > 1 ? "s" : ""}.`
                    : "Waiting for at least one ready report."}
                </p>
                <p className="text-[11px] text-muted-foreground">Finora can see all metrics, ratios, and charts from your dashboard.</p>
              </div>
              {hasReports && (
                <div className="flex flex-wrap justify-center gap-1.5 max-w-lg">
                  {SUGGESTIONS.slice(0, readyReports.length > 1 ? 6 : 4).map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="border border-border/60 bg-secondary/80 px-2.5 py-1 text-[11px] text-secondary-foreground hover:bg-secondary transition-colors rounded-md"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-2.5 group", m.role === "user" ? "justify-end" : "justify-start")}>
                  {m.role === "assistant" && (
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "relative max-w-[80%] px-3 py-2 text-sm rounded-lg",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary/80 text-secondary-foreground rounded-bl-sm",
                    )}
                  >
                    {m.role === "assistant" ? (
                      <>
                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-table:my-2 prose-invert light:prose-neutral">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content || "…"}</ReactMarkdown>
                        </div>
                        <button
                          onClick={() => handleCopy(m.content, i)}
                          className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm bg-card border shadow-sm p-1 hover:bg-muted"
                          title="Copy message"
                        >
                          {copiedIdx === i ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </>
                    ) : (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              {streaming && (
                <div className="flex gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                    <Bot className="h-3.5 w-3.5 text-primary animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border/40 p-2.5 bg-card/50 backdrop-blur shrink-0">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder={hasReports ? "Ask about metrics, ratios, risks…" : "Upload a report first to chat."}
              className="min-h-[40px] resize-none rounded-md text-sm"
              rows={1}
              disabled={streaming || !hasReports}
            />
            <Button
              size="icon"
              onClick={() => void send()}
              disabled={streaming || !input.trim() || !hasReports}
              aria-label="Send message"
              className="border border-primary/20 rounded-md h-10 w-10"
            >
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
