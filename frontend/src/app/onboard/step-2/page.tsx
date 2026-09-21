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
  icon: React.ReactNode;
}

const TOOLS: Tool[] = [
  { 
    id: "chatgpt", 
    name: "ChatGPT", 
    category: "Reasoning",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.28 15.55A8.13 8.13 0 0023 11.83a8.13 8.13 0 00-4-7.07 8.08 8.08 0 00-8.83 1.25 8.13 8.13 0 00-6.1-2.9 8.13 8.13 0 00-7.85 9.77 8.13 8.13 0 004 7.07 8.08 8.08 0 008.83-1.25 8.13 8.13 0 006.1 2.9 8.13 8.13 0 007.13-6.05z" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3.5" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    id: "claude", 
    name: "Claude", 
    category: "Architecture",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 10a8 8 0 0116 0c0 4-4 6-8 10-4-4-8-6-8-10z" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 14a4 4 0 100-8 4 4 0 000 8z" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    id: "github", 
    name: "GitHub", 
    category: "Repository",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" fill="var(--color-ink)"/>
      </svg>
    )
  },
  { 
    id: "notion", 
    name: "Notion", 
    category: "Knowledge",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6h16v2H4V6zm2 4h12v10H6V10zm2 2v6h8v-6H8z" fill="var(--color-ink)"/>
        <path d="M3 4h18v16H3V4z" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    id: "antigravity", 
    name: "Antigravity", 
    category: "IDE",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    id: "cursor", 
    name: "Cursor", 
    category: "Generation",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4l5.5 16 3-7 7-3-15.5-6z" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
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
      <main className="flex-1 px-6 pt-16 mt-32 mb-24 w-full max-w-3xl flex flex-col items-center text-center">
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-3xl mx-auto">
            {TOOLS.map((tool, i) => {
              const isConnected = toolStates[tool.id] === "connected";
              const isConnecting = toolStates[tool.id] === "connecting";
              
              return (
                <motion.button
                  key={tool.id}
                  onClick={() => handleConnect(tool.id)}
                  disabled={isConnecting}
                  className="relative flex flex-col items-center justify-center p-8 gap-4 rounded-[20px] transition-all group"
                  style={{
                    background: isConnected ? "rgba(10,10,10,0.02)" : "transparent",
                    border: isConnected ? "1px solid var(--color-ink)" : "1px solid rgba(10,10,10,0.08)",
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    {tool.icon}
                  </div>
                  <div className="text-[15px] font-medium text-[var(--color-ink)]">{tool.name}</div>
                  <div className="text-[11px] text-[#AEB7BC] font-mono tracking-widest uppercase">{tool.category}</div>
                  
                  {isConnecting ? (
                    <CircleNotch size={16} className="animate-spin text-[var(--color-ink)] mt-2" />
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
