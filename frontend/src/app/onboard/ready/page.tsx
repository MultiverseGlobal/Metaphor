"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";

// ── Workspace activation — "coming to life" sequence ─────────────────────────

interface WorkspaceState {
  projectName: string;
  connectedTools: string[];
}

const TOOL_COLORS: Record<string, string> = {
  chatgpt: "#10A37F",
  claude: "#D97706",
  github: "#0A0A0A",
  notion: "#6366F1",
  antigravity: "#8B5CF6",
  cursor: "#374151",
};

const TOOL_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  github: "GitHub",
  notion: "Notion",
  antigravity: "Antigravity",
  cursor: "Cursor",
};

const SEQUENCE_STEPS = [
  { id: "init",    label: "Initialising workspace",         delay: 0,    duration: 900 },
  { id: "index",   label: "Indexing tool capabilities",    delay: 900,  duration: 1100 },
  { id: "context", label: "Building the shared context layer", delay: 2000, duration: 1200 },
  { id: "ready",   label: "Activating Metaphor signal",    delay: 3200, duration: 800 },
];

type SequenceStep = "none" | "init" | "index" | "context" | "ready" | "done";

export default function OnboardReady() {
  const router = useRouter();
  const [ws, setWs] = useState<WorkspaceState>({ projectName: "Your workspace", connectedTools: [] });
  const [currentStep, setCurrentStep] = useState<SequenceStep>("none");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  // Load workspace state
  useEffect(() => {
    try {
      const step1Raw = sessionStorage.getItem("metaphor_onboard_step1");
      const toolsRaw = sessionStorage.getItem("metaphor_onboard_tools");

      const name = step1Raw ? JSON.parse(step1Raw)?.name?.trim() || "Your workspace" : "Your workspace";
      const toolStates = toolsRaw ? JSON.parse(toolsRaw) : {};
      const connected = Object.entries(toolStates)
        .filter(([, v]) => v === "connected")
        .map(([k]) => k);

      setWs({ projectName: name, connectedTools: connected });
    } catch {}
  }, []);

  // Run sequence
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      for (const step of SEQUENCE_STEPS) {
        await new Promise((r) => setTimeout(r, step.delay === 0 ? 600 : step.delay - (SEQUENCE_STEPS[SEQUENCE_STEPS.indexOf(step) - 1]?.delay ?? 0) - (SEQUENCE_STEPS[SEQUENCE_STEPS.indexOf(step) - 1]?.duration ?? 0)));
        if (cancelled) return;
        setCurrentStep(step.id as SequenceStep);
        await new Promise((r) => setTimeout(r, step.duration));
        if (cancelled) return;
        setCompletedSteps((prev) => [...prev, step.id]);
      }
      if (!cancelled) {
        setCurrentStep("done");
        setIsDone(true);
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const handleEnterWorkspace = async () => {
    setIsEntering(true);
    // Clear onboarding session state
    sessionStorage.removeItem("metaphor_onboard_step1");
    sessionStorage.removeItem("metaphor_onboard_tools");
    await new Promise((r) => setTimeout(r, 300));
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-[rgba(10,10,10,0.06)]">
        <Link href="/" className="flex items-center gap-2">
          <MetaphorLogo className="w-5 h-5" />
          <span className="text-[14px] font-semibold tracking-tight text-[#0A0A0A]" style={{ fontFamily: "Satoshi, sans-serif" }}>
            Metaphor
          </span>
        </Link>
        {/* Completion indicator */}
        <AnimatePresence>
          {isDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(22,163,74,0.06)] border border-[rgba(22,163,74,0.20)]"
            >
              <div className="w-4 h-4 rounded-full bg-[#16A34A] flex items-center justify-center">
                <svg width="8" height="6" fill="none" viewBox="0 0 8 6">
                  <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[12px] font-semibold text-[#16A34A]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                Workspace ready
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[560px] flex flex-col items-center gap-10">

          {/* Central network visual */}
          <div className="relative w-60 h-60 flex items-center justify-center">
            {/* Outer ring — tool nodes */}
            {ws.connectedTools.slice(0, 6).map((toolId, i) => {
              const total = Math.min(ws.connectedTools.length, 6);
              const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
              const r = 96;
              const x = Math.cos(angle) * r;
              const y = Math.sin(angle) * r;
              const color = TOOL_COLORS[toolId] || "#6366F1";

              return (
                <motion.div
                  key={toolId}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: [0.175, 0.885, 0.32, 1.05] }}
                  className="absolute flex flex-col items-center gap-1"
                  style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: "translate(-50%, -50%)" }}
                >
                  {/* Connection line */}
                  <svg
                    className="absolute pointer-events-none"
                    style={{
                      left: "50%", top: "50%",
                      width: Math.abs(x) * 2 + 20,
                      height: Math.abs(y) * 2 + 20,
                      transform: "translate(-50%, -50%)",
                      overflow: "visible",
                    }}
                    aria-hidden="true"
                  >
                    <motion.line
                      x1="50%" y1="50%"
                      x2={`calc(50% + ${-x}px)`}
                      y2={`calc(50% + ${-y}px)`}
                      stroke={color}
                      strokeWidth="1"
                      strokeOpacity="0.3"
                      strokeDasharray="4 3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                    />
                  </svg>

                  <motion.div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                    style={{ background: color }}
                    animate={isDone ? {
                      boxShadow: [`0 0 0 0 ${color}00`, `0 0 0 6px ${color}20`, `0 0 0 0 ${color}00`],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  >
                    {TOOL_LABELS[toolId]?.[0] ?? "T"}
                  </motion.div>
                  <span className="text-[9px] text-[#6B7280] whitespace-nowrap" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    {TOOL_LABELS[toolId] ?? toolId}
                  </span>
                </motion.div>
              );
            })}

            {/* Central Metaphor node */}
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center z-10"
              style={{
                background: "white",
                border: "2px solid rgba(99,102,241,0.30)",
                boxShadow: isDone ? "0 0 40px rgba(99,102,241,0.18), 0 0 0 1px rgba(99,102,241,0.12)" : "0 0 16px rgba(99,102,241,0.10)",
              }}
              animate={isDone ? {
                boxShadow: [
                  "0 0 20px rgba(99,102,241,0.12)",
                  "0 0 40px rgba(99,102,241,0.22)",
                  "0 0 20px rgba(99,102,241,0.12)",
                ],
              } : {}}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <MetaphorLogo className="w-7 h-7" />
            </motion.div>
          </div>

          {/* Copy */}
          <div className="text-center flex flex-col gap-3">
            <AnimatePresence mode="wait">
              {isDone ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2"
                >
                  <h1
                    className="font-display text-[clamp(30px,4vw,48px)] leading-[1.1] tracking-[-0.02em] text-[#0A0A0A]"
                    style={{ fontWeight: 500 }}
                  >
                    <span className="font-display" style={{ fontStyle: "italic", color: "#6366F1" }}>
                      {ws.projectName}
                    </span>{" "}
                    is ready.
                  </h1>
                  <p className="text-[15px] text-[#6B7280] leading-relaxed max-w-[380px] mx-auto" style={{ fontFamily: "Satoshi, sans-serif" }}>
                    Metaphor will remember what you build next — and move context between your tools so you don't have to.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-2"
                >
                  <h1
                    className="font-display text-[clamp(24px,3.5vw,40px)] leading-[1.1] tracking-[-0.02em] text-[#6B7280]"
                    style={{ fontWeight: 400, fontStyle: "italic" }}
                  >
                    Building your workspace...
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sequence steps */}
          <div className="w-full flex flex-col gap-2">
            {SEQUENCE_STEPS.map((step) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{
                    opacity: isCompleted ? 0.5 : isCurrent ? 1 : 0.25,
                    x: 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{
                    background: isCurrent ? "rgba(99,102,241,0.04)" : "transparent",
                    border: isCurrent ? "1px solid rgba(99,102,241,0.10)" : "1px solid transparent",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: isCompleted
                        ? "rgba(22,163,74,0.10)"
                        : isCurrent
                        ? "rgba(99,102,241,0.10)"
                        : "rgba(10,10,10,0.06)",
                    }}
                  >
                    {isCompleted ? (
                      <svg width="8" height="6" fill="none" viewBox="0 0 8 6">
                        <path d="M1 3l2 2 4-4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : isCurrent ? (
                      <div className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgba(10,10,10,0.20)]" />
                    )}
                  </div>
                  <span
                    className="text-[13px]"
                    style={{
                      fontFamily: "Satoshi, sans-serif",
                      color: isCompleted ? "#6B7280" : isCurrent ? "#0A0A0A" : "rgba(10,10,10,0.35)",
                      fontWeight: isCurrent ? 500 : 400,
                    }}
                  >
                    {step.label}
                  </span>
                  {isCurrent && (
                    <div className="ml-auto flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 h-1 rounded-full bg-[#6366F1]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Enter CTA */}
          <AnimatePresence>
            {isDone && (
              <motion.button
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.05] }}
                onClick={handleEnterWorkspace}
                disabled={isEntering}
                className="btn-primary flex items-center gap-2 group w-full justify-center"
                style={{ minHeight: 52 }}
                id="enter-workspace"
              >
                {isEntering ? (
                  <span style={{ fontFamily: "Satoshi, sans-serif" }}>Entering workspace...</span>
                ) : (
                  <>
                    <span style={{ fontFamily: "Satoshi, sans-serif" }}>Enter workspace</span>
                    <ArrowRight size={15} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
