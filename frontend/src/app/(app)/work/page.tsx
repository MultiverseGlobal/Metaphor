"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchFromMetaphor } from "@/app/api";
import {
  Activity, ArrowRight, FileText, Bot, Clock, ChevronDown, ChevronUp,
  Copy, Check, Layers, Sparkles, Shield, Cpu, RefreshCw
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingState } from "@/components/ui/LoadingState";

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
  execution_ms?: number;
};

const MOCK_HANDOFFS: Handoff[] = [
  {
    id: "h-1043",
    source_agent: "Antigravity IDE",
    target_agent: "Metaphor UI",
    task_goal: "Orchestrate spatial Context OS tokens & cinematic springs",
    status: "running",
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    artifacts: [
      { name: "AmbientField.tsx", type: "typescript", size: "4.2 KB" },
      { name: "globals.css", type: "stylesheet", size: "11.8 KB" },
      { name: "FirstEntrySequence.tsx", type: "typescript", size: "6.1 KB" },
    ],
    payload: "Rebuilt the global depth model using PDS-v5 standards. Framer Motion Level 3 springs injected across observatory and provenance inspector.",
    execution_ms: 720,
  },
  {
    id: "h-1042",
    source_agent: "Claude (Cursor)",
    target_agent: "Orion Companion",
    task_goal: "Summarise architectural decisions into ADR 42",
    status: "complete",
    created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    completed_at: new Date(Date.now() - 1000 * 60 * 88).toISOString(),
    artifacts: [
      { name: "ADR-042-context-mesh.md", type: "markdown", size: "14.2 KB" },
      { name: "nats_topology.json", type: "schema", size: "2.8 KB" },
    ],
    payload: "Formalized NATS JetStream migration and universal entity sync schema for sovereign nodes across the ecosystem.",
    execution_ms: 420000,
  },
  {
    id: "h-1041",
    source_agent: "Metaphor Engine",
    target_agent: "Atlas IO",
    task_goal: "Propagate live customer constraints into relationship graph",
    status: "complete",
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    completed_at: new Date(Date.now() - 1000 * 60 * 235).toISOString(),
    artifacts: [
      { name: "enterprise_constraints.bin", type: "binary", size: "128 KB" },
    ],
    payload: "Extracted 14 boundary conditions from latest design review transcript and verified against sovereign privacy model.",
    execution_ms: 312000,
  },
  {
    id: "h-1040",
    source_agent: "Clario Studio",
    target_agent: "Antigravity IDE",
    task_goal: "Deliver video canvas asset cache for /world node shaders",
    status: "failed",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 17.9).toISOString(),
    artifacts: [],
    payload: "Asset extraction timeout: Port 49843 failed to respond with WebGL pipeline handshake within 15000ms.",
    execution_ms: 15000,
  }
];

// ── Living Flow Diagram ───────────────────────────────────────────────────

// Flora-style editorial handoff flow — no SVG arrows, clean mono typography
function HandoffFlow({ handoff }: { handoff: Handoff }) {
  const isRunning = handoff.status === "running";

  return (
    <div className="flex items-center gap-3 py-5">
      {/* Source */}
      <div
        className="flex flex-col gap-0.5 px-4 py-3 rounded-xl min-w-0"
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border-subtle)",
        }}
      >
        <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>Source</span>
        <span className="text-sm font-semibold truncate" style={{ fontFamily: "'Satoshi', sans-serif", color: "var(--color-foreground)", letterSpacing: "-0.015em" }}>
          {handoff.source_agent}
        </span>
      </div>

      {/* Connector */}
      <div className="flex items-center gap-2 shrink-0">
        <div style={{ width: 32, height: 1, background: "var(--color-border-strong)" }} />
        <div
          className="px-2.5 py-1 rounded-full text-[9px] font-mono whitespace-nowrap"
          style={{
            background: isRunning ? "rgba(76,175,125,0.10)" : "var(--color-surface-2)",
            border: `1px solid ${isRunning ? "rgba(76,175,125,0.25)" : "var(--color-border-subtle)"}`,
            color: isRunning ? "#4CAF7D" : "var(--color-muted)",
          }}
        >
          {isRunning ? "live" : `${handoff.artifacts.length} artifact${handoff.artifacts.length !== 1 ? "s" : ""}`}
        </div>
        <div style={{ width: 32, height: 1, background: "var(--color-border-strong)" }} />
      </div>

      {/* Target */}
      <div
        className="flex flex-col gap-0.5 px-4 py-3 rounded-xl min-w-0"
        style={{
          background: isRunning ? "rgba(76,175,125,0.07)" : "var(--color-surface-2)",
          border: `1px solid ${isRunning ? "rgba(76,175,125,0.20)" : "var(--color-border-subtle)"}`,
        }}
      >
        <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>Target</span>
        <span className="text-sm font-semibold truncate" style={{ fontFamily: "'Satoshi', sans-serif", color: "var(--color-foreground)", letterSpacing: "-0.015em" }}>
          {handoff.target_agent}
        </span>
      </div>
    </div>
  );
}

// ── Expandable Dossier Item ───────────────────────────────────────────────

function HandoffTimelineItem({ handoff, isLatest }: { handoff: Handoff; isLatest: boolean }) {
  const [expanded, setExpanded] = useState(handoff.status === "running");
  const [copied, setCopied] = useState(false);

  const handleCopyPayload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!handoff.payload) return;
    navigator.clipboard.writeText(handoff.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRunning = handoff.status === "running";

  // Left-stripe colour by status (Flora signature)
  const stripeColor =
    isRunning ? "#4CAF7D" :
    handoff.status === "complete" ? "rgba(34,197,94,0.55)" :
    handoff.status === "failed" ? "rgba(244,63,94,0.65)" :
    "rgba(255,255,255,0.10)";

  return (
    <div className="relative group">
      {/* Handoff Card — left stripe replaces bead rail */}
      <motion.div
        layout
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl overflow-hidden transition-all duration-200"
        style={{
          background: "var(--color-surface-1)",
          border: "1px solid var(--color-border-subtle)",
          borderLeft: `3px solid ${stripeColor}`,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderTopColor = "var(--color-border-mid)";
          (e.currentTarget as HTMLDivElement).style.borderRightColor = "var(--color-border-mid)";
          (e.currentTarget as HTMLDivElement).style.borderBottomColor = "var(--color-border-mid)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderTopColor = "var(--color-border-subtle)";
          (e.currentTarget as HTMLDivElement).style.borderRightColor = "var(--color-border-subtle)";
          (e.currentTarget as HTMLDivElement).style.borderBottomColor = "var(--color-border-subtle)";
        }}
      >
        <div
          className="p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0 flex-col sm:flex-row">
            <div className="flex items-center gap-2.5 shrink-0">
              <StatusBadge type={handoff.status} dot />
              <span className="text-[10px] font-mono text-muted">
                {new Date(handoff.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
              <span className="text-sm font-semibold text-foreground truncate">{handoff.source_agent}</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted shrink-0" />
              <span className="text-sm font-semibold text-foreground truncate">{handoff.target_agent}</span>
              <span className="text-sm text-muted truncate border-l border-border-subtle pl-2.5 hidden md:block">
                {handoff.task_goal}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {handoff.artifacts.length > 0 && (
              <span className="text-[10px] font-mono text-muted bg-surface-2 px-2 py-0.5 rounded hidden sm:inline-block">
                {handoff.artifacts.length} file{handoff.artifacts.length !== 1 ? "s" : ""}
              </span>
            )}
            <button
              type="button"
              className="p-1.5 text-muted hover:text-foreground hover:bg-surface-2 rounded-lg transition-colors"
              aria-label={expanded ? "Collapse handoff details" : "Expand handoff details"}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="border-t border-border-subtle bg-surface-2/30"
            >
              <div className="p-5 sm:p-6 space-y-6">
                {/* Active Flow Visualization */}
                {isRunning && (
                  <div className="border-b border-border-subtle/80 pb-6">
                    <HandoffFlow handoff={handoff} />
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Objective & Payload Dossier */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[9px] font-mono uppercase tracking-widest text-muted mb-1.5">
                        Execution Goal
                      </h4>
                      <p className="text-sm text-foreground font-medium leading-relaxed">
                        {handoff.task_goal}
                      </p>
                    </div>

                    {handoff.payload && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-[9px] font-mono uppercase tracking-widest text-muted">
                            Transferred Payload
                          </h4>
                          <button
                            type="button"
                            onClick={handleCopyPayload}
                            className="text-[10px] font-mono text-muted hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                            <span>{copied ? "Copied" : "Copy Payload"}</span>
                          </button>
                        </div>
                        <div className="text-xs text-foreground/85 bg-surface-1 border border-border-subtle p-3.5 rounded-lg font-mono leading-relaxed break-words shadow-inner">
                          {handoff.payload}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Artifacts & Audit Signatures */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[9px] font-mono uppercase tracking-widest text-muted mb-1.5">
                        Artifact Dossier
                      </h4>
                      {handoff.artifacts.length > 0 ? (
                        <div className="space-y-2">
                          {handoff.artifacts.map((a, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-2.5 bg-surface-1 border border-border-subtle rounded-lg text-xs"
                            >
                              <FileText className="w-4 h-4 text-muted shrink-0" />
                              <span className="font-mono text-foreground flex-1 truncate">{a.name}</span>
                              {a.size && (
                                <span className="text-[10px] font-mono text-muted">{a.size}</span>
                              )}
                              <span className="text-[9px] uppercase font-mono tracking-wider text-muted bg-surface-2 px-1.5 py-0.5 rounded">
                                {a.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted italic p-3 bg-surface-1 border border-border-subtle rounded-lg">
                          No binary artifacts associated with this transition.
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border-subtle/60 flex items-center justify-between text-[10px] font-mono text-muted">
                      <span>ID: {handoff.id}</span>
                      {handoff.execution_ms && (
                        <span>Latency: {handoff.execution_ms > 1000 ? `${(handoff.execution_ms / 1000).toFixed(1)}s` : `${handoff.execution_ms}ms`}</span>
                      )}
                      {handoff.completed_at && (
                        <span>Completed: {new Date(handoff.completed_at).toLocaleTimeString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── Main Work & Operational Continuity Page ───────────────────────────────

export default function WorkEnvironment() {
  const [loading, setLoading] = useState(true);
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | HandoffStatus>("all");

  useEffect(() => {
    async function fetchWork() {
      try {
        const res = await fetchFromMetaphor("/graph/handoffs?limit=50");
        if (res?.handoffs?.length > 0) {
          setHandoffs(res.handoffs);
        } else {
          setHandoffs(MOCK_HANDOFFS);
        }
      } catch {
        setHandoffs(MOCK_HANDOFFS);
      } finally {
        setLoading(false);
      }
    }
    fetchWork();
  }, []);

  const runningCount = useMemo(() => handoffs.filter(h => h.status === "running").length, [handoffs]);
  const completedCount = useMemo(() => handoffs.filter(h => h.status === "complete").length, [handoffs]);

  const filteredHandoffs = useMemo(() => {
    if (statusFilter === "all") return handoffs;
    return handoffs.filter(h => h.status === statusFilter);
  }, [handoffs, statusFilter]);

  if (loading) {
    return <LoadingState context="handoffs" className="min-h-screen" />;
  }

  return (
    <div className="relative w-full min-h-screen pt-8 pb-32 px-6 md:px-12 lg:px-20 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Editorial Header — Flora style */}
        <header style={{ borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "32px" }}>
          {/* Eyebrow */}
          <div
            className="text-[10px] font-mono uppercase tracking-widest mb-5"
            style={{ color: "var(--color-muted)" }}
          >
            Operational Continuity · Ecosystem Timeline
          </div>

          {/* Serif heading + inline prose metrics */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1
                className="mb-3"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(36px, 5vw, 60px)",
                  fontWeight: 400,
                  letterSpacing: "-0.015em",
                  lineHeight: 1.08,
                  color: "var(--color-foreground)",
                }}
              >
                Work &amp;{" "}
                <em style={{ fontStyle: "italic", fontWeight: 300 }}>Handoffs.</em>
              </h1>
              <p
                className="text-sm leading-relaxed max-w-lg"
                style={{ color: "var(--color-muted)", fontFamily: "'Satoshi', sans-serif" }}
              >
                State transitions and artifact transmission across autonomous agents.
              </p>
            </div>

            {/* Inline prose metrics — no metric boxes */}
            <p
              className="text-sm font-mono shrink-0"
              style={{ color: "var(--color-muted)" }}
            >
              <span style={{ color: "#4CAF7D", fontWeight: 600 }}>{runningCount} active</span>
              {" · "}
              {completedCount} resolved
            </p>
          </div>

          {/* Numbered filter pills — Flora section prefix style */}
          <div
            className="flex items-center gap-2 mt-8 pt-5 overflow-x-auto pb-1"
            style={{ borderTop: "1px solid var(--color-border-subtle)" }}
          >
            {(["all", "running", "complete", "failed"] as const).map((filter, idx) => {
              const count = filter === "all" ? handoffs.length : handoffs.filter(h => h.status === filter).length;
              const isActive = statusFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap"
                  style={{
                    background: isActive ? "var(--color-foreground)" : "transparent",
                    color: isActive ? "var(--color-background)" : "var(--color-muted)",
                    border: isActive ? "none" : "1px solid var(--color-border-subtle)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                  aria-pressed={isActive}
                >
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: "italic",
                      fontSize: "11px",
                      opacity: isActive ? 0.6 : 0.35,
                    }}
                  >
                    0{idx + 1}
                  </span>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <span style={{ opacity: 0.5 }}>({count})</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Timeline Stream */}
        <section>
          <div className="flex items-center gap-2 border-b border-border-subtle pb-3 mb-6">
            <Activity className="w-4 h-4 text-muted" />
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted">
              Live State Progression
            </h2>
          </div>

          <motion.div
            className="space-y-6"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.07 } }
            }}
          >
            {filteredHandoffs.map((h, index) => (
              <motion.div
                key={h.id}
                variants={{
                  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
                  show: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
                  }
                }}
              >
                <HandoffTimelineItem handoff={h} isLatest={index === 0} />
              </motion.div>
            ))}

            {filteredHandoffs.length === 0 && (
              <div className="text-muted text-sm italic py-12 text-center border border-dashed border-border-subtle rounded-xl bg-surface-1/40">
                No handoffs match the selected filter.
              </div>
            )}
          </motion.div>
        </section>

      </div>
    </div>
  );
}
