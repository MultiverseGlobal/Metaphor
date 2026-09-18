"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchFromMetaphor } from "@/app/api";
import {
  Activity, ArrowRight, FileText, Bot, Clock, ChevronDown, ChevronUp
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
};

const MOCK_HANDOFFS: Handoff[] = [
  {
    id: "h-1042",
    source_agent: "Antigravity IDE",
    target_agent: "Claude (Cursor)",
    task_goal: "Fix TypeScript errors in frontend UI components",
    status: "running",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    artifacts: [
      { name: "Button.tsx", type: "code" },
      { name: "error_log.txt", type: "text" },
    ],
    payload: "Review these two files and apply the PDS-v5 token system to the Button component. The error log contains the current TSC output.",
  },
  {
    id: "h-1041",
    source_agent: "Claude (Cursor)",
    target_agent: "Orion",
    task_goal: "Summarise architectural decisions into ADR",
    status: "complete",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
    artifacts: [
      { name: "ADR-42.md", type: "document" },
    ],
    payload: "Generated ADR 42 regarding the NATS JetStream migration.",
  },
  {
    id: "h-1040",
    source_agent: "Metaphor UI",
    target_agent: "Antigravity IDE",
    task_goal: "Generate visual QA report for /world route",
    status: "failed",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 23.9).toISOString(),
    artifacts: [],
    payload: "Agent failed to launch browser instance. Port collision detected.",
  }
];

// ── Flow Diagram ───────────────────────────────────────────────────────────

function HandoffFlow({ handoff }: { handoff: Handoff }) {
  const isRunning = handoff.status === "running";
  
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto py-8">
      {/* Source */}
      <div className="flex flex-col items-center gap-3 relative z-10 w-32">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-colors ${
          isRunning ? "bg-surface-2 border-foreground text-foreground" : "bg-surface-1 border-border-subtle text-muted"
        }`}>
          <Bot className="w-6 h-6" />
        </div>
        <span className="text-xs font-semibold text-center">{handoff.source_agent}</span>
      </div>

      {/* Path */}
      <div className="flex-1 relative flex items-center justify-center mx-4">
        <svg className="absolute w-full h-8 top-1/2 -translate-y-1/2 overflow-visible">
          <line 
            x1="0" y1="50%" x2="100%" y2="50%" 
            stroke="var(--color-border-strong)" 
            strokeWidth="2" 
            strokeDasharray={isRunning ? "6 6" : "0"}
            style={{ animation: isRunning ? "handoffFlow 1.5s linear infinite" : "none" }}
          />
          {isRunning && (
            <motion.circle 
              cx="0" cy="50%" r="4" 
              fill="var(--color-foreground)"
              animate={{ cx: ["0%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          )}
        </svg>
        <div className="bg-surface-1 border border-border-subtle px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest text-muted z-10 shadow-sm whitespace-nowrap">
          {handoff.artifacts.length} Artifact{handoff.artifacts.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Target */}
      <div className="flex flex-col items-center gap-3 relative z-10 w-32">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-colors ${
          isRunning ? "bg-foreground border-foreground text-background" : "bg-surface-1 border-border-subtle text-muted"
        }`}>
          <Bot className="w-6 h-6" />
        </div>
        <span className="text-xs font-semibold text-center">{handoff.target_agent}</span>
      </div>
    </div>
  );
}

// ── Timeline Item ──────────────────────────────────────────────────────────

function HandoffTimelineItem({ handoff }: { handoff: Handoff }) {
  const [expanded, setExpanded] = useState(handoff.status === "running");

  return (
    <motion.div 
      layout
      className="pds-card overflow-hidden transition-colors hover:border-border-strong bg-surface-1/50 backdrop-blur-sm"
    >
      <div 
        className="p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0 flex-col sm:flex-row">
          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge type={handoff.status} dot />
            <span className="text-[10px] font-mono text-muted">{new Date(handoff.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm font-semibold truncate shrink-0 max-w-[120px]">{handoff.source_agent}</span>
            <ArrowRight className="w-3 h-3 text-muted shrink-0" />
            <span className="text-sm font-semibold truncate shrink-0 max-w-[120px]">{handoff.target_agent}</span>
            <span className="text-sm text-muted truncate ml-2 hidden md:block border-l border-border-subtle pl-3">{handoff.task_goal}</span>
          </div>
        </div>
        
        <button className="p-1 text-muted hover:text-foreground hover:bg-surface-2 rounded-md transition-colors shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border-subtle bg-surface-2/40"
          >
            <div className="p-6">
              
              {handoff.status === "running" && (
                <div className="mb-8 border-b border-border-subtle pb-8">
                  <HandoffFlow handoff={handoff} />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Objective</h4>
                  <p className="text-sm text-foreground font-medium mb-6">{handoff.task_goal}</p>
                  
                  {handoff.payload && (
                    <>
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Payload</h4>
                      <p className="text-sm text-muted bg-surface-1 border border-border-subtle p-3 rounded-lg leading-relaxed">
                        {handoff.payload}
                      </p>
                    </>
                  )}
                </div>

                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Transferred Artifacts</h4>
                  {handoff.artifacts.length > 0 ? (
                    <div className="space-y-2">
                      {handoff.artifacts.map((a, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-surface-1 border border-border-subtle rounded-lg">
                          <FileText className="w-4 h-4 text-muted" />
                          <span className="text-sm font-mono text-foreground flex-1 truncate">{a.name}</span>
                          <span className="text-[10px] uppercase font-mono tracking-wider text-muted bg-surface-2 px-1.5 py-0.5 rounded">{a.type}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted italic p-3 bg-surface-1 border border-border-subtle rounded-lg">No artifacts attached.</p>
                  )}
                  
                  <div className="mt-6 flex items-center justify-between text-[10px] font-mono text-muted">
                    <span>ID: {handoff.id}</span>
                    {handoff.completed_at && <span>Completed: {new Date(handoff.completed_at).toLocaleTimeString()}</span>}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function WorkEnvironment() {
  const [loading, setLoading] = useState(true);
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);

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

  if (loading) {
    return <LoadingState context="handoffs" className="min-h-screen" />;
  }

  const runningCount = handoffs.filter(h => h.status === "running").length;

  return (
    <div className="relative w-full min-h-screen pt-28 pb-32 px-6 md:px-12 lg:px-20 animate-in fade-in duration-500">
      
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="border-b border-border-subtle pb-8">
          <h1 className="text-4xl md:text-5xl font-display text-foreground tracking-tight mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Work & Handoffs
          </h1>
          <p className="text-lg text-muted max-w-2xl leading-relaxed flex items-center gap-2">
            The nervous system of the ecosystem. <span className="font-mono text-xs bg-surface-2 px-2 py-0.5 rounded text-foreground">{runningCount} active</span>
          </p>
        </header>

        <section>
          <div className="flex items-center gap-2 border-b border-border-subtle pb-2 mb-6">
            <Activity className="w-4 h-4 text-muted" />
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted">Timeline</h2>
          </div>

          <motion.div 
            className="space-y-4"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } }
            }}
          >
            {handoffs.map((h) => (
              <motion.div
                key={h.id}
                variants={{
                  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
                  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
                }}
              >
                <HandoffTimelineItem handoff={h} />
              </motion.div>
            ))}
            {handoffs.length === 0 && (
              <p className="text-muted text-sm italic py-8 text-center border border-dashed border-border-subtle rounded-xl bg-surface-1/50">
                No handoffs recorded in this partition.
              </p>
            )}
          </motion.div>
        </section>

      </div>
    </div>
  );
}
