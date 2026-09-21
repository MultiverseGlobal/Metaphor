"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, GitCommit, FileText, CheckCircle2, ChevronRight } from "lucide-react";

interface HandoffEvent {
  id: string;
  fromTool: string;
  toTool: string;
  timestamp: string;
  summary: string;
  contextSize: string;
  referenceId: string;
  status: "completed" | "syncing";
  details?: string;
}

const INITIAL_EVENTS: HandoffEvent[] = [
  {
    id: "h1",
    fromTool: "ChatGPT",
    toTool: "GitHub",
    timestamp: "10 mins ago",
    summary: "Generated and passed draft PR specification for Auth & Session rewrite.",
    contextSize: "12 context nodes",
    referenceId: "#PR-1042",
    status: "completed",
    details: "Merged 4 schema references and 2 conversation excerpts into single structured PR description.",
  },
  {
    id: "h2",
    fromTool: "Notion",
    toTool: "ChatGPT",
    timestamp: "2 hours ago",
    summary: "Ingested Product Requirements Document (PRD) for Notification Core.",
    contextSize: "48KB document",
    referenceId: "DOC-89",
    status: "completed",
    details: "Tokenized requirement specifications and synchronized user acceptance criteria into reasoning memory.",
  },
  {
    id: "h3",
    fromTool: "Cursor",
    toTool: "Antigravity",
    timestamp: "Yesterday",
    summary: "Exchanged IDE buffer states and diagnostics after breakpoint resolution.",
    contextSize: "6 active files",
    referenceId: "#TASK-77",
    status: "completed",
    details: "Preserved cursor line pointers and active type definitions across IDE transitions.",
  },
];

export default function HandoffsPage() {
  const [events] = useState<HandoffEvent[]>(INITIAL_EVENTS);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-16 md:py-24 min-h-screen">
      {/* Header */}
      <div className="pb-8 border-b border-[rgba(10,10,10,0.06)] mb-12">
        <div className="text-[11px] font-mono tracking-widest uppercase text-[#AEB7BC] mb-2">
          Workspace &middot; Coordination Ledger
        </div>
        <h1
          className="font-display text-[clamp(36px,4vw,48px)] leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)]"
          style={{ fontWeight: 400 }}
        >
          Handoffs.
        </h1>
        <p className="text-[15px] text-[#555E64] mt-2 max-w-xl">
          Continuous record of context passing, prompt delegations, and state transfers between systems.
        </p>
      </div>

      {/* Editorial Timeline Feed */}
      <div className="relative pl-6 sm:pl-8 before:absolute before:inset-y-0 before:left-3 sm:before:left-3.5 before:w-[1px] before:bg-[rgba(10,10,10,0.08)]">
        <div className="flex flex-col gap-10">
          {events.map((event) => {
            const isExpanded = expandedId === event.id;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
              >
                {/* Timeline node marker */}
                <div className="absolute -left-[27px] sm:-left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--color-ink)] ring-4 ring-white" />

                {/* Content */}
                <div className="flex flex-col gap-2">
                  {/* Top line: Source -> Target + Time */}
                  <div className="flex flex-wrap items-center gap-2.5 text-[13px]">
                    <span className="font-semibold text-[var(--color-ink)] tracking-tight">
                      {event.fromTool}
                    </span>
                    <ArrowRight size={13} className="text-[#AEB7BC]" />
                    <span className="font-semibold text-[var(--color-ink)] tracking-tight">
                      {event.toTool}
                    </span>
                    <span className="text-[#AEB7BC] text-[12px] font-mono ml-auto">
                      {event.timestamp}
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-[14px] text-[#3B4043] leading-relaxed">
                    {event.summary}
                  </p>

                  {/* Metadata Chips & Toggle */}
                  <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-[#AEB7BC]">
                    <span className="bg-black/[0.04] px-2 py-0.5 rounded text-[var(--color-ink)] font-medium">
                      {event.referenceId}
                    </span>
                    <span>&middot;</span>
                    <span>{event.contextSize}</span>
                    <span>&middot;</span>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : event.id)}
                      className="text-[#555E64] hover:text-[var(--color-ink)] transition-colors underline underline-offset-2 ml-auto"
                    >
                      {isExpanded ? "Collapse" : "View payload"}
                    </button>
                  </div>

                  {/* Expanded payload details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 p-4 rounded-xl bg-black/[0.02] border border-[rgba(10,10,10,0.06)] text-[13px] text-[#555E64]"
                    >
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#AEB7BC] mb-1">
                        Handoff Metadata
                      </div>
                      <p>{event.details}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
