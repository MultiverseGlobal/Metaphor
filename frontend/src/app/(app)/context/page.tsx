"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, FileText, RotateCcw } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingState } from "@/components/ui/LoadingState";
import { fetchFromMetaphor } from "@/app/api";

type Insight = {
  id: string;
  text: string;
  type: "fact" | "decision" | "constraint" | "insight";
  sourceType: string;
  sourceName: string;
  reason: string;
};

type ContextResponse = {
  query: string;
  synthesis: string;
  insights: Insight[];
  evidence: string[];
};

const MOCK_RESPONSE: ContextResponse = {
  query: "",
  synthesis:
    "Based on recent activity across the workspace, the Notification architecture for Orion is the primary focus. A major architectural shift from RabbitMQ to NATS JetStream was approved to resolve persistent delivery issues. This must be completed prior to the upcoming Q4 freeze.",
  insights: [
    {
      id: "i1",
      text: "Orion is currently the primary product focus.",
      type: "fact",
      sourceType: "Project",
      sourceName: "Orion",
      reason: "High priority status across 4 active workspaces",
    },
    {
      id: "i2",
      text: "Notification architecture is shifting from RabbitMQ to NATS JetStream.",
      type: "decision",
      sourceType: "Decision Record",
      sourceName: "ADR-42",
      reason: "Approved by Engineering Lead to resolve INC-104",
    },
    {
      id: "i3",
      text: "Deployment must occur before Q4 freeze.",
      type: "constraint",
      sourceType: "Task",
      sourceName: "Q4 Roadmap",
      reason: "Hard deadline set in company timeline",
    },
  ],
  evidence: ["GitHub: PR #1042", "Notion: Arch Decision Record 42", "Slack: #eng-core", "Jira: INC-104"],
};

export default function ContextEnvironment() {
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState<"empty" | "retrieving" | "complete">("empty");
  const [result, setResult] = useState<ContextResponse | null>(null);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const handleAsk = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    setPrompt(q);
    setPhase("retrieving");

    try {
      const res = await fetchFromMetaphor("/context/query", { prompt: q }, "POST", false, true);
      setResult({
        query: q,
        synthesis: res.synthesis || MOCK_RESPONSE.synthesis,
        insights: res.insights || MOCK_RESPONSE.insights,
        evidence: res.evidence || MOCK_RESPONSE.evidence,
      });
      setPhase("complete");
    } catch {
      setTimeout(() => {
        setResult({ ...MOCK_RESPONSE, query: q });
        setPhase("complete");
      }, 1200);
    }
  };

  return (
    <div className="w-full min-h-screen bg-transparent pt-16 md:pt-24 pb-32 px-6 md:px-12 max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {phase === "empty" && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center w-full max-w-2xl mx-auto"
          >
            <div className="text-[11px] font-mono tracking-widest uppercase text-[#AEB7BC] mb-4">
              Context Engine &middot; Query
            </div>

            <h1
              className="font-display text-[clamp(40px,5vw,56px)] leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)] mb-8"
              style={{ fontWeight: 400 }}
            >
              Explore your context.
            </h1>

            {/* Bare Underline Search Field */}
            <div className="w-full max-w-xl relative flex items-center mb-10">
              <input
                type="text"
                autoFocus
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk(prompt)}
                placeholder="What should I know about this workspace?"
                className="w-full px-0 py-3 bg-transparent border-b text-[20px] text-center text-[var(--color-ink)] placeholder:text-[rgba(10,10,10,0.2)] outline-none transition-colors"
                style={{
                  fontFamily: "'Cormorant Garamond', var(--next-font-display), serif",
                  fontStyle: "italic",
                  borderBottomColor: prompt ? "var(--color-ink)" : "rgba(10,10,10,0.15)",
                }}
              />
              {prompt.trim() && (
                <button
                  onClick={() => handleAsk(prompt)}
                  className="absolute right-0 bottom-3 p-2 text-[var(--color-ink)] hover:opacity-75 transition-opacity cursor-pointer"
                  aria-label="Submit search"
                >
                  <ArrowRight size={20} />
                </button>
              )}
            </div>

            {/* Prompt Suggestions */}
            <div className="flex flex-wrap gap-2.5 justify-center">
              {[
                "What changed in Orion?",
                "Decisions regarding authentication",
                "Why did we migrate to NATS?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleAsk(suggestion)}
                  className="px-4 py-2 rounded-full border border-[rgba(10,10,10,0.08)] bg-white/70 hover:bg-white text-[12px] text-[#555E64] hover:text-[var(--color-ink)] transition-colors cursor-pointer shadow-sm"
                >
                  &ldquo;{suggestion}&rdquo;
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "retrieving" && (
          <motion.div
            key="retrieving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[50vh] flex flex-col items-center justify-center"
          >
            <LoadingState context="context" />
          </motion.div>
        )}

        {phase === "complete" && result && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-12"
          >
            {/* Query Header */}
            <div className="flex flex-col gap-3 pb-8 border-b border-[rgba(10,10,10,0.06)]">
              <button
                onClick={() => {
                  setPhase("empty");
                  setPrompt("");
                }}
                className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-[#AEB7BC] hover:text-[var(--color-ink)] transition-colors w-max"
              >
                <RotateCcw size={12} />
                <span>New query</span>
              </button>

              <h1
                className="font-display text-[clamp(28px,3.5vw,38px)] text-[var(--color-ink)] leading-tight"
                style={{ fontWeight: 400, fontStyle: "italic" }}
              >
                &ldquo;{result.query}&rdquo;
              </h1>
            </div>

            {/* Synthesis Section */}
            <section className="flex flex-col gap-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#AEB7BC]">
                Synthesized Answer
              </div>
              <p
                className="text-[20px] md:text-[22px] leading-relaxed text-[var(--color-ink)]"
                style={{
                  fontFamily: "'Cormorant Garamond', var(--next-font-display), serif",
                  fontWeight: 400,
                }}
              >
                {result.synthesis}
              </p>
            </section>

            {/* Insights Section */}
            <section className="flex flex-col gap-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#AEB7BC]">
                Foundational Facts &amp; Constraints
              </div>

              <div className="flex flex-col divide-y divide-[rgba(10,10,10,0.06)]">
                {result.insights.map((insight) => {
                  const isExpanded = expandedInsight === insight.id;

                  return (
                    <div key={insight.id} className="py-4 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <StatusBadge type={insight.type} />
                          <p className="text-[14px] text-[var(--color-ink)] font-medium">
                            {insight.text}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setExpandedInsight(isExpanded ? null : insight.id)
                          }
                          className="text-[11px] font-mono text-[#AEB7BC] hover:text-[var(--color-ink)] transition-colors shrink-0 underline underline-offset-2"
                        >
                          {isExpanded ? "Hide" : "Why?"}
                        </button>
                      </div>

                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="pl-6 pt-2 text-[13px] text-[#555E64] flex flex-col gap-1"
                        >
                          <div className="flex items-center gap-2 text-[11px] font-mono text-[#AEB7BC]">
                            <FileText size={12} />
                            <span>
                              {insight.sourceType} &middot; {insight.sourceName}
                            </span>
                          </div>
                          <p className="italic">&ldquo;{insight.reason}&rdquo;</p>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Evidence Section */}
            <section className="flex flex-col gap-3 pt-6 border-t border-[rgba(10,10,10,0.06)]">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#AEB7BC]">
                Grounding References
              </div>
              <div className="flex flex-wrap gap-2">
                {result.evidence.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-3 py-1 rounded-full bg-black/[0.03] border border-[rgba(10,10,10,0.06)] text-[#555E64]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
