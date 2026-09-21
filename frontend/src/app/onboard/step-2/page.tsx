"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, CircleNotch, Link as LinkIcon } from "@phosphor-icons/react";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";

// ── Tool definitions ──────────────────────────────────────────────────────────

type ConnectionState = "idle" | "connecting" | "connected" | "error";

interface Tool {
  id: string;
  name: string;
  category: string;
}

const TOOLS: Tool[] = [
  { id: "chatgpt",     name: "ChatGPT",     category: "Reasoning" },
  { id: "claude",      name: "Claude",      category: "Architecture" },
  { id: "github",      name: "GitHub",      category: "Repository" },
  { id: "notion",      name: "Notion",      category: "Knowledge" },
  { id: "antigravity", name: "Antigravity", category: "IDE" },
  { id: "cursor",      name: "Cursor",      category: "Generation" },
];

// ── Step 2 ────────────────────────────────────────────────────────────────────

export default function OnboardStep2() {
  const router = useRouter();
  const [toolStates, setToolStates] = useState<Record<string, ConnectionState>>(
    TOOLS.reduce((acc, t) => ({ ...acc, [t.id]: "idle" }), {})
  );
  const [projectName, setProjectName] = useState("Your project");
  const [isProceeding, setIsProceeding] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("metaphor_onboard_step1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.name) setProjectName(parsed.name.trim());
      }
    } catch {}

    try {
      const raw = sessionStorage.getItem("metaphor_onboard_tools");
      if (raw) setToolStates(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    sessionStorage.setItem("metaphor_onboard_tools", JSON.stringify(toolStates));
  }, [toolStates]);

  const connectedCount = Object.values(toolStates).filter((s) => s === "connected").length;
  const canContinue = connectedCount >= 1;

  const handleConnect = async (id: string) => {
    const current = toolStates[id];
    if (current === "connected") {
      setToolStates((prev) => ({ ...prev, [id]: "idle" }));
      return;
    }

    setToolStates((prev) => ({ ...prev, [id]: "connecting" }));
    await new Promise((r) => setTimeout(r, 800));
    setToolStates((prev) => ({ ...prev, [id]: "connected" }));
  };

  const handleContinue = async () => {
    setIsProceeding(true);
    await new Promise((r) => setTimeout(r, 200));
    router.push("/signup");
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center">
      {/* ── Header ── */}
      <header className="fixed top-8 w-full max-w-4xl px-6 flex items-center justify-between z-50 pointer-events-none">
        <div className="flex items-center justify-between w-full h-[52px] px-8 rounded-full glass-clear backdrop-blur-xl border border-[rgba(10,10,10,0.06)] shadow-[0_14px_40px_rgba(0,0,0,0.04)] pointer-events-auto">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Metaphor home">
            <MetaphorLogo className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity" />
            <span
              className="text-[14px] font-medium tracking-wide text-[var(--color-ink)]"
            >
              Metaphor
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-8 h-1 rounded-full bg-[rgba(10,10,10,0.10)]" />
              <div className="w-8 h-1 rounded-full bg-[var(--color-ink)]" />
            </div>
            <span
              className="text-[11px] text-[#AEB7BC] font-mono tracking-widest uppercase"
            >
              02 / 02
            </span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 px-6 mt-40 mb-24 w-full max-w-3xl flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-12 w-full"
        >
          {/* Heading */}
          <div className="flex flex-col gap-6 items-center">
            <h1 className="font-display text-[clamp(44px,5vw,56px)] leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)]" style={{ fontWeight: 400 }}>
              Bring your tools into{" "}
              <span style={{ fontStyle: "italic" }}>
                {projectName}
              </span>
            </h1>
            <p className="text-[16px] text-[#3B4043] leading-relaxed max-w-md">
              Connect at least one tool to start. Metaphor will build the shared context layer between them.
            </p>
          </div>

          {/* Tool grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-2xl mx-auto">
            {TOOLS.map((tool, i) => {
              const isConnected = toolStates[tool.id] === "connected";
              const isConnecting = toolStates[tool.id] === "connecting";
              
              return (
                <motion.button
                  key={tool.id}
                  onClick={() => handleConnect(tool.id)}
                  disabled={isConnecting}
                  className="relative flex flex-col items-center justify-center p-6 gap-3 rounded-[20px] transition-all"
                  style={{
                    background: "transparent",
                    border: isConnected ? "1px solid var(--color-ink)" : "1px solid rgba(10,10,10,0.08)",
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="text-[15px] font-medium text-[var(--color-ink)]">{tool.name}</div>
                  <div className="text-[11px] text-[#AEB7BC] font-mono tracking-widest uppercase">{tool.category}</div>
                  
                  {isConnecting ? (
                    <CircleNotch size={16} className="animate-spin text-[#AEB7BC] mt-2" />
                  ) : isConnected ? (
                    <Check size={16} weight="bold" className="text-[var(--color-ink)] mt-2" />
                  ) : (
                    <LinkIcon size={16} className="text-[rgba(10,10,10,0.2)] mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between w-full max-w-2xl mx-auto mt-12 pt-8 border-t border-[rgba(10,10,10,0.06)]">
            <Link
              href="/onboard/step-1"
              className="flex items-center gap-2 text-[13px] text-[#3B4043] hover:text-[var(--color-ink)] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </Link>

            <motion.button
              onClick={handleContinue}
              disabled={!canContinue || isProceeding}
              className="text-[14px] font-medium text-white bg-[#111315] hover:bg-[#2A2E33] transition-colors h-[44px] px-8 rounded-full flex items-center justify-center gap-3 disabled:opacity-30 disabled:hover:bg-[#111315]"
              whileTap={canContinue ? { scale: 0.98 } : {}}
            >
              {isProceeding ? (
                <span>Setting up workspace...</span>
              ) : (
                <>
                  <span>{canContinue ? "Launch workspace" : "Connect one tool"}</span>
                  {canContinue && <ArrowRight size={14} weight="bold" />}
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
