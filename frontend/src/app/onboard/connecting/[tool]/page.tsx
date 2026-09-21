"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Copy, CaretRight } from "@phosphor-icons/react";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";

// ── MCP Setup ─────────────────────────────────────────────────────────────────

const MCP_CONFIGS: Record<string, { name: string; color: string; steps: string[]; config: string }> = {
  antigravity: {
    name: "Antigravity",
    color: "#8B5CF6",
    steps: [
      "Open Antigravity IDE settings",
      "Navigate to MCP → Add server",
      "Paste the config below and save",
      "Restart Antigravity to activate",
    ],
    config: JSON.stringify(
      {
        mcpServers: {
          metaphor: {
            command: "npx",
            args: ["-y", "@metaphor/mcp-server"],
            env: {
              METAPHOR_API_KEY: "your_key_here",
            },
          },
        },
      },
      null,
      2
    ),
  },
  cursor: {
    name: "Cursor",
    color: "#374151",
    steps: [
      "Open Cursor settings (⌘,)",
      'Navigate to "MCP" in the sidebar',
      "Click Add and paste the config below",
      "Reload Cursor to activate the server",
    ],
    config: JSON.stringify(
      {
        mcpServers: {
          metaphor: {
            command: "npx",
            args: ["-y", "@metaphor/mcp-server"],
            env: {
              METAPHOR_API_KEY: "your_key_here",
            },
          },
        },
      },
      null,
      2
    ),
  },
};

export default function MCPSetupPage() {
  const router = useRouter();
  const params = useParams();
  const toolId = typeof params.tool === "string" ? params.tool : (params.tool as string[])?.[0] ?? "";
  const config = MCP_CONFIGS[toolId];
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!config) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-[14px] text-[#6B7280]">Unknown tool. <Link href="/onboard/step-2" className="text-[#6366F1]">Go back</Link></p>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(config.config).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDone = () => {
    // Mark as connected in sessionStorage
    try {
      const raw = sessionStorage.getItem("metaphor_onboard_tools");
      const states = raw ? JSON.parse(raw) : {};
      states[toolId] = "connected";
      sessionStorage.setItem("metaphor_onboard_tools", JSON.stringify(states));
    } catch {}
    router.push("/onboard/step-2");
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
        <Link
          href="/onboard/step-2"
          className="flex items-center gap-1.5 text-[13px] text-[rgba(10,10,10,0.40)] hover:text-[rgba(10,10,10,0.70)] transition-colors"
          style={{ fontFamily: "Satoshi, sans-serif" }}
        >
          <ArrowLeft size={13} />
          <span>Back to tool selection</span>
        </Link>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[560px] flex flex-col gap-8"
        >
          {/* Title */}
          <div className="flex flex-col gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-[16px] font-bold"
              style={{ background: config.color }}
            >
              {config.name[0]}
            </div>
            <h1
              className="font-display text-[clamp(28px,4vw,44px)] leading-[1.1] tracking-[-0.02em] text-[#0A0A0A]"
              style={{ fontWeight: 500 }}
            >
              Connect {config.name}
            </h1>
            <p className="text-[14px] text-[#6B7280] leading-relaxed" style={{ fontFamily: "Satoshi, sans-serif" }}>
              Add Metaphor as an MCP server in {config.name}. Takes about 2 minutes.
            </p>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-3">
            {config.steps.map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-3.5"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${config.color}15`, border: `1px solid ${config.color}30` }}
                >
                  <span className="text-[10px] font-bold" style={{ color: config.color, fontFamily: "JetBrains Mono, monospace" }}>
                    {i + 1}
                  </span>
                </div>
                <p className="text-[14px] text-[#374151] leading-relaxed" style={{ fontFamily: "Satoshi, sans-serif" }}>
                  {step}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Config block */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="label-mono">mcp config.json</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  fontFamily: "Satoshi, sans-serif",
                  background: copied ? "rgba(22,163,74,0.08)" : "rgba(10,10,10,0.04)",
                  color: copied ? "#16A34A" : "rgba(10,10,10,0.60)",
                  border: copied ? "1px solid rgba(22,163,74,0.2)" : "1px solid rgba(10,10,10,0.08)",
                }}
                aria-label="Copy MCP config"
              >
                {copied ? <Check size={11} weight="bold" /> : <Copy size={11} />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            <div
              className="p-4 rounded-2xl overflow-auto"
              style={{
                background: "#F8F9FA",
                border: "1px solid rgba(10,10,10,0.08)",
                maxHeight: 240,
              }}
            >
              <pre
                className="text-[12px] text-[#374151] whitespace-pre-wrap"
                style={{ fontFamily: "JetBrains Mono, monospace", lineHeight: 1.6 }}
              >
                {config.config}
              </pre>
            </div>
          </div>

          {/* Confirmation */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setConfirmed(!confirmed)}
              className="flex items-center gap-3 group cursor-pointer"
              aria-checked={confirmed}
              role="checkbox"
            >
              <div
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0"
                style={{
                  borderColor: confirmed ? "#6366F1" : "rgba(10,10,10,0.20)",
                  background: confirmed ? "#6366F1" : "transparent",
                }}
              >
                {confirmed && <Check size={11} weight="bold" className="text-white" />}
              </div>
              <span
                className="text-[13px] text-[#374151]"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                I've added the MCP config and restarted {config.name}
              </span>
            </button>

            <button
              onClick={handleDone}
              disabled={!confirmed}
              className="btn-primary w-full flex items-center justify-center gap-2 group"
              style={{ opacity: confirmed ? 1 : 0.4, minHeight: 48 }}
              id={`mcp-done-${toolId}`}
            >
              <span style={{ fontFamily: "Satoshi, sans-serif" }}>Done — {config.name} is connected</span>
              <CaretRight size={14} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            <p className="text-center text-[12px] text-[rgba(10,10,10,0.35)]" style={{ fontFamily: "Satoshi, sans-serif" }}>
              Metaphor will verify the connection automatically once the server is running.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
