"use client";

import React, { useEffect, useState } from "react";
import { fetchFromMetaphor } from "@/app/api";
import {
  Activity,
  Target,
  Zap,
  Clock,
  RotateCcw,
  XCircle,
  Search,
  ChevronRight,
  Bot,
  ArrowRight,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

type HandoffStatus = "pending" | "running" | "complete" | "failed" | "cancelled";

type HandoffArtifact = {
  name: string;
  type: string;
  size?: string;
};

type Handoff = {
  id: string;
  source_agent: string;
  target_agent: string;
  task_goal: string;
  status: HandoffStatus;
  artifacts: HandoffArtifact[];
  created_at: string;
  completed_at?: string;
  payload?: string;
};

const STATUS_CONFIG: Record<HandoffStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending:   { label: "Pending",   color: "text-warning",     bg: "bg-surface-1 border-border-subtle", dot: "bg-warning" },
  running:   { label: "Running",   color: "text-foreground",  bg: "bg-surface-2 border-foreground",    dot: "bg-foreground animate-pulse" },
  complete:  { label: "Complete",  color: "text-success",     bg: "bg-surface-1 border-border-subtle", dot: "bg-success" },
  failed:    { label: "Failed",    color: "text-danger",      bg: "bg-surface-1 border-border-subtle", dot: "bg-danger" },
  cancelled: { label: "Cancelled", color: "text-muted",       bg: "bg-surface-1 border-border-subtle", dot: "bg-muted" },
};

// Mock data for when backend returns nothing
const MOCK_HANDOFFS: Handoff[] = [
  {
    id: "h-001",
    source_agent: "Claude (Cursor)",
    target_agent: "ChatGPT (ChatGPT.com)",
    task_goal: "Summarize architectural decisions from Metaphor OS codebase",
    status: "complete",
    artifacts: [{ name: "arch_summary.md", type: "document" }, { name: "decisions.json", type: "data" }],
    created_at: new Date(Date.now() - 3600000).toISOString(),
    completed_at: new Date(Date.now() - 3200000).toISOString(),
  },
  {
    id: "h-002",
    source_agent: "Antigravity IDE",
    target_agent: "Claude (Cursor)",
    task_goal: "Review and fix TypeScript errors in frontend pages",
    status: "running",
    artifacts: [],
    created_at: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: "h-003",
    source_agent: "Cursor IDE",
    target_agent: "Metaphor OS",
    task_goal: "Ingest updated codebase context for graph indexing",
    status: "pending",
    artifacts: [],
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
];

export default function PipelinePage() {
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<HandoffStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function loadHandoffs() {
      try {
        const data = await fetchFromMetaphor("/graph/handoffs?limit=50");
        if (data?.handoffs && data.handoffs.length > 0) {
          setHandoffs(data.handoffs);
        } else {
          setHandoffs(MOCK_HANDOFFS);
        }
      } catch {
        setHandoffs(MOCK_HANDOFFS);
      } finally {
        setLoading(false);
      }
    }
    loadHandoffs();
  }, []);

  const handleAction = async (id: string, action: "resume" | "cancel" | "retry") => {
    setActionLoading(id + action);
    try {
      await fetchFromMetaphor(`/graph/handoffs/${id}/${action}`, undefined, "POST");
      setHandoffs(prev =>
        prev.map(h =>
          h.id === id
            ? { ...h, status: action === "cancel" ? "cancelled" : action === "retry" ? "pending" : "running" }
            : h
        )
      );
    } catch (e) {
      console.error(`Failed to ${action} handoff:`, e);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = handoffs.filter(h => {
    const matchSearch =
      h.task_goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.source_agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.target_agent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || h.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = handoffs.reduce<Record<string, number>>((acc, h) => {
    acc[h.status] = (acc[h.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 animate-in fade-in duration-200">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-2 flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          Agent Handoffs
        </h1>
        <p className="text-sm text-muted max-w-2xl">
          Durable record of context packages passed between AI agents. Each handoff carries a task goal and artifact trail.
        </p>
      </div>

      {/* Telemetry Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "running", "pending", "complete", "failed", "cancelled"] as const).map(s => {
          const count = s === "all" ? handoffs.length : (statusCounts[s] || 0);
          const cfg = s !== "all" ? STATUS_CONFIG[s] : null;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                statusFilter === s
                  ? "bg-foreground text-background border-foreground"
                  : "bg-surface-1 text-muted border-border-subtle hover:text-foreground"
              }`}
            >
              {cfg && <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
              <span className="capitalize">{s}</span>
              <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by agent name or task goal..."
          className="w-full bg-surface-1 border border-border-subtle rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-surface-1 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-16 text-center">
          <Activity className="w-8 h-8 text-muted/40 mx-auto mb-3" />
          <p className="text-sm text-muted">No handoffs match your filters.</p>
        </Card>
      ) : (
        <div className="relative space-y-3">
          {/* Vertical timeline line */}
          <div className="absolute left-7 top-8 bottom-8 w-px bg-border-subtle hidden sm:block" />

          {filtered.map(h => {
            const cfg = STATUS_CONFIG[h.status];
            const isExpanded = expandedId === h.id;

            return (
              <div key={h.id} className="relative pl-0 sm:pl-14">
                {/* Timeline Dot */}
                <div className={`absolute left-5 top-6 w-3 h-3 rounded-full border-2 border-background ${cfg.dot} hidden sm:block`} />

                <Card className={`p-5 transition-all duration-200 hover:border-border-strong ${isExpanded ? "border-border-strong" : ""}`}>
                  <div
                    className="flex items-start justify-between gap-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : h.id)}
                  >
                    <div className="flex-1 min-w-0">
                      {/* Agent Route */}
                      <div className="flex items-center gap-2 text-xs text-muted mb-2 flex-wrap">
                        <Bot className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground">{h.source_agent}</span>
                        <ArrowRight className="w-3 h-3 shrink-0" />
                        <span className="font-medium text-foreground">{h.target_agent}</span>
                        <span className="opacity-40">·</span>
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{new Date(h.created_at).toLocaleString()}</span>
                      </div>

                      {/* Goal */}
                      <p className="text-sm font-medium text-foreground truncate">{h.task_goal}</p>

                      {/* Artifacts badge */}
                      {h.artifacts.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <FileText className="w-3 h-3 text-muted" />
                          <span className="text-[11px] text-muted">{h.artifacts.length} artifact{h.artifacts.length > 1 ? "s" : ""}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-muted transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-border-subtle animate-in fade-in duration-200 space-y-4">
                      
                      {/* Payload preview */}
                      {h.payload && (
                        <div>
                          <div className="text-[9px] font-mono uppercase tracking-widest text-muted mb-2">Context Payload</div>
                          <pre className="text-xs text-muted bg-background border border-border-subtle rounded-xl p-4 overflow-x-auto max-h-40">
                            {h.payload}
                          </pre>
                        </div>
                      )}

                      {/* Artifacts */}
                      {h.artifacts.length > 0 && (
                        <div>
                          <div className="text-[9px] font-mono uppercase tracking-widest text-muted mb-2">Artifacts</div>
                          <div className="flex flex-wrap gap-2">
                            {h.artifacts.map((a, i) => (
                              <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-2 border border-border-subtle rounded-lg text-xs">
                                <FileText className="w-3 h-3 text-muted" />
                                <span className="font-mono text-foreground">{a.name}</span>
                                {a.size && <span className="text-muted opacity-60">{a.size}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        {(h.status === "failed" || h.status === "cancelled") && (
                          <button
                            onClick={() => handleAction(h.id, "retry")}
                            disabled={actionLoading === h.id + "retry"}
                            className="pds-btn-primary w-auto min-h-[32px] px-3 py-1.5 rounded-lg"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Retry
                          </button>
                        )}
                        {h.status === "pending" && (
                          <button
                            onClick={() => handleAction(h.id, "resume")}
                            disabled={actionLoading === h.id + "resume"}
                            className="pds-btn-primary w-auto min-h-[32px] px-3 py-1.5 rounded-lg"
                          >
                            <Zap className="w-3.5 h-3.5" /> Resume
                          </button>
                        )}
                        {(h.status === "pending" || h.status === "running") && (
                          <button
                            onClick={() => handleAction(h.id, "cancel")}
                            disabled={actionLoading === h.id + "cancel"}
                            className="pds-btn-ghost w-auto min-h-[32px] px-3 py-1.5 text-danger border-danger/30 hover:border-danger hover:bg-danger/10 rounded-lg"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancel
                          </button>
                        )}
                        {h.status === "complete" && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed {h.completed_at ? new Date(h.completed_at).toLocaleTimeString() : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
