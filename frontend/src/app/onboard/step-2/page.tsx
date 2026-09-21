"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, CircleNotch, Warning, Link as LinkIcon } from "@phosphor-icons/react";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";

// ── Tool definitions ──────────────────────────────────────────────────────────

type ConnectionState = "idle" | "connecting" | "connected" | "error";

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
  connectionType: "oauth" | "mcp" | "api";
  tagline: string;
}

const TOOLS: Tool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    category: "Reasoning",
    description: "GPT-4o for open-ended reasoning and structured planning",
    color: "#10A37F",
    connectionType: "oauth",
    tagline: "Reasoning · Planning",
  },
  {
    id: "claude",
    name: "Claude",
    category: "Architecture",
    description: "Anthropic's model for architectural decisions and careful writing",
    color: "#D97706",
    connectionType: "api",
    tagline: "Architecture · Writing",
  },
  {
    id: "github",
    name: "GitHub",
    category: "Codebase",
    description: "Your repositories, PRs, issues, and code context",
    color: "#0A0A0A",
    connectionType: "oauth",
    tagline: "Repository · PRs",
  },
  {
    id: "notion",
    name: "Notion",
    category: "Knowledge",
    description: "Docs, decisions, and structured knowledge from your workspace",
    color: "#6366F1",
    connectionType: "oauth",
    tagline: "Docs · Decisions",
  },
  {
    id: "antigravity",
    name: "Antigravity",
    category: "Development",
    description: "IDE-level context — files, refactors, and code execution",
    color: "#8B5CF6",
    connectionType: "mcp",
    tagline: "IDE · Execution",
  },
  {
    id: "cursor",
    name: "Cursor",
    category: "Implementation",
    description: "Cursor AI for code generation and implementation tasks",
    color: "#374151",
    connectionType: "mcp",
    tagline: "Generation · Implementation",
  },
];

// ── Tool Card ─────────────────────────────────────────────────────────────────

function ToolCard({
  tool,
  state,
  onConnect,
}: {
  tool: Tool;
  state: ConnectionState;
  onConnect: (id: string) => void;
}) {
  const isConnected = state === "connected";
  const isConnecting = state === "connecting";
  const isError = state === "error";
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAction = () => {
    if (tool.connectionType === "mcp") {
      setIsExpanded(!isExpanded);
    } else {
      onConnect(tool.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col gap-3 p-4 rounded-2xl border transition-all"
      style={{
        background: isConnected ? `${tool.color}06` : "#FFFFFF",
        border: isConnected
          ? `1px solid ${tool.color}30`
          : isError
          ? "1px solid rgba(220,38,38,0.25)"
          : "1px solid rgba(10,10,10,0.08)",
        boxShadow: isConnected ? `0 0 0 0 ${tool.color}00` : "0 1px 3px rgba(10,10,10,0.04)",
      }}
    >
      {/* Connected badge */}
      <AnimatePresence>
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: `${tool.color}15`, border: `1px solid ${tool.color}30` }}
          >
            <Check size={9} weight="bold" style={{ color: tool.color }} />
            <span className="text-[10px] font-semibold" style={{ color: tool.color, fontFamily: "Satoshi, sans-serif" }}>
              Connected
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[13px] font-bold shrink-0"
          style={{ background: tool.color }}
        >
          {tool.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-[14px] font-semibold text-[#0A0A0A] leading-tight"
            style={{ fontFamily: "Satoshi, sans-serif" }}
          >
            {tool.name}
          </div>
          <div className="label-mono text-[9px] mt-0.5">{tool.tagline}</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[12.5px] text-[#6B7280] leading-relaxed" style={{ fontFamily: "Satoshi, sans-serif" }}>
        {tool.description}
      </p>

      {/* CTA */}
      <div className="flex items-center gap-2">
        {!isConnected ? (
          <button
            onClick={handleAction}
            disabled={isConnecting}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[12px] font-semibold transition-all"
            style={{
              fontFamily: "Satoshi, sans-serif",
              background: isError ? "rgba(220,38,38,0.06)" : "rgba(10,10,10,0.04)",
              border: isError ? "1px solid rgba(220,38,38,0.2)" : "1px solid rgba(10,10,10,0.08)",
              color: isError ? "rgba(220,38,38,0.9)" : "#0A0A0A",
              cursor: isConnecting ? "not-allowed" : "pointer",
            }}
            id={`connect-${tool.id}`}
            aria-label={`Connect ${tool.name}`}
          >
            {isConnecting ? (
              <>
                <CircleNotch size={12} className="animate-spin" />
                <span>Connecting...</span>
              </>
            ) : isError ? (
              <>
                <Warning size={12} />
                <span>Try again</span>
              </>
            ) : (
              <>
                <LinkIcon size={12} />
                <span>
                  {tool.connectionType === "mcp"
                    ? "Set up MCP"
                    : tool.connectionType === "api"
                    ? "Add API key"
                    : "Connect"}
                </span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => onConnect(tool.id)}
            className="text-[11px] text-[rgba(10,10,10,0.35)] hover:text-[rgba(10,10,10,0.6)] transition-colors"
            style={{ fontFamily: "Satoshi, sans-serif" }}
          >
            Reconfigure
          </button>
        )}

        {tool.connectionType === "mcp" && !isConnected && (
          <a
            href="/docs/mcp"
            className="text-[11px] text-[#6B7280] hover:text-[#6366F1] transition-colors"
            style={{ fontFamily: "Satoshi, sans-serif" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Docs ↗
          </a>
        )}
      </div>

      {/* Inline Connection Panel for MCP */}
      <AnimatePresence>
        {isExpanded && !isConnected && tool.connectionType === "mcp" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-2 border-t border-[rgba(10,10,10,0.06)] flex flex-col gap-3">
              <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                Add this to your <span className="label-mono">mcp_config.json</span>:
              </p>
              <div className="p-3 bg-[#F9FAFB] border border-[rgba(10,10,10,0.08)] rounded-lg text-[11px] text-[#0A0A0A] overflow-x-auto" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                <pre>
{`{
  "mcpServers": {
    "${tool.id}": {
      "command": "npx",
      "args": ["-y", "@metaphor/${tool.id}"]
    }
  }
}`}
                </pre>
              </div>
              <button
                onClick={() => {
                  setIsExpanded(false);
                  onConnect(tool.id);
                }}
                className="btn-primary w-full text-[12px] py-1.5 min-h-[36px]"
              >
                Verify Connection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

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

    // Restore tool states if returning
    try {
      const raw = sessionStorage.getItem("metaphor_onboard_tools");
      if (raw) setToolStates(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist tool states
  useEffect(() => {
    sessionStorage.setItem("metaphor_onboard_tools", JSON.stringify(toolStates));
  }, [toolStates]);

  const connectedCount = Object.values(toolStates).filter((s) => s === "connected").length;
  const canContinue = connectedCount >= 1;

  const handleConnect = async (id: string) => {
    const current = toolStates[id];
    if (current === "connected") {
      // Reset to idle (reconfigure)
      setToolStates((prev) => ({ ...prev, [id]: "idle" }));
      return;
    }

    setToolStates((prev) => ({ ...prev, [id]: "connecting" }));

    const tool = TOOLS.find((t) => t.id === id);

    // Simulate connection flow
    await new Promise((r) => setTimeout(r, 1400 + Math.random() * 600));

    // Randomly succeed/error for demo (in production, hook real auth)
    const success = Math.random() > 0.15;
    setToolStates((prev) => ({ ...prev, [id]: success ? "connected" : "error" }));
  };

  const handleContinue = async () => {
    setIsProceeding(true);
    await new Promise((r) => setTimeout(r, 200));
    router.push("/signup");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-[rgba(10,10,10,0.06)]">
        <Link href="/" className="flex items-center gap-2" aria-label="Metaphor home">
          <MetaphorLogo className="w-5 h-5" />
          <span className="text-[14px] font-semibold tracking-tight text-[#0A0A0A]" style={{ fontFamily: "Satoshi, sans-serif" }}>
            Metaphor
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-8 h-1 rounded-full bg-[#6366F1]" />
            <div className="w-8 h-1 rounded-full bg-[#6366F1]" />
          </div>
          <span className="text-[11px] text-[#6B7280]" style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.06em" }}>
            02 / 02
          </span>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 px-6 py-10 md:py-14" id="onboard-step-2">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-3"
          >
            <div className="text-[11px] text-[#6366F1] tracking-widest uppercase" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              Step 2
            </div>
            <h1 className="font-display text-[clamp(32px,4.5vw,52px)] leading-[1.08] tracking-[-0.02em] text-[#0A0A0A]" style={{ fontWeight: 500 }}>
              Bring your tools into{" "}
              <span className="font-display" style={{ fontStyle: "italic", color: "#6366F1" }}>
                {projectName}
              </span>
            </h1>
            <p className="text-[15px] text-[#6B7280] leading-relaxed max-w-[520px]" style={{ fontFamily: "Satoshi, sans-serif" }}>
              Connect at least one tool to start. Metaphor will build the shared context layer between them.
            </p>
          </motion.div>

          {/* Connected count */}
          <AnimatePresence>
            {connectedCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.15)]"
              >
                <div className="w-4 h-4 rounded-full bg-[#6366F1] flex items-center justify-center">
                  <Check size={9} weight="bold" className="text-white" />
                </div>
                <span className="text-[13px] text-[#6366F1] font-semibold" style={{ fontFamily: "Satoshi, sans-serif" }}>
                  {connectedCount} {connectedCount === 1 ? "tool" : "tools"} connected
                </span>
                <span className="text-[12px] text-[rgba(10,10,10,0.40)]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                  · Metaphor is building the shared layer
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tool grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            {TOOLS.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <ToolCard
                  tool={tool}
                  state={toolStates[tool.id]}
                  onConnect={handleConnect}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[rgba(10,10,10,0.06)]">
            <Link
              href="/onboard/step-1"
              className="flex items-center gap-1.5 text-[13px] text-[rgba(10,10,10,0.40)] hover:text-[rgba(10,10,10,0.70)] transition-colors"
              style={{ fontFamily: "Satoshi, sans-serif" }}
              id="step2-back"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </Link>

            <motion.button
              onClick={handleContinue}
              disabled={!canContinue || isProceeding}
              className="btn-primary flex items-center gap-2 group"
              style={{
                opacity: canContinue ? 1 : 0.4,
                cursor: canContinue ? "pointer" : "not-allowed",
                minHeight: 44,
              }}
              whileTap={canContinue ? { scale: 0.98 } : {}}
              id="step2-continue"
            >
              {isProceeding ? (
                <span className="text-[14px]" style={{ fontFamily: "Satoshi, sans-serif" }}>Setting up workspace...</span>
              ) : (
                <>
                  <span className="text-[14px]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                    {canContinue ? "Launch workspace" : "Connect one tool to continue"}
                  </span>
                  {canContinue && (
                    <ArrowRight size={15} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
                  )}
                </>
              )}
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
}
