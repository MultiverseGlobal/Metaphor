"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Terminal,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";

// ── Types ─────────────────────────────────────────────────────────────────────

type StreamStatus = "ok" | "running" | "error";

interface StreamRow {
  id: string;
  agent: string;
  tool: string;
  result: string;
  status: StreamStatus;
  ms: number;
}

// ── Mock activity stream data ─────────────────────────────────────────────────

const INITIAL_STREAM: StreamRow[] = [
  { id: "r5", agent: "Antigravity IDE",  tool: "generate_auth_scaffold",  result: "Auth route scaffold created",          status: "ok",      ms: 1420 },
  { id: "r4", agent: "Claude (Cursor)",  tool: "read_context_graph",       result: "Returned 34 decision nodes",          status: "ok",      ms: 88   },
  { id: "r3", agent: "ChatGPT-4o",       tool: "request_tool_action",      result: "Delegated to Metaphor Proxy",         status: "ok",      ms: 12   },
  { id: "r2", agent: "Orion Companion",  tool: "write_handoff_record",     result: "ADR-042 persisted to context mesh",   status: "ok",      ms: 310  },
  { id: "r1", agent: "Metaphor Engine",  tool: "match_capability",         result: "Routing...",                          status: "running", ms: 0    },
];

const LIVE_ROWS: StreamRow[] = [
  { id: "l1", agent: "Antigravity IDE",  tool: "generate_component",       result: "FloatingNav.tsx written",             status: "ok",      ms: 2100 },
  { id: "l2", agent: "Claude (Cursor)",  tool: "list_mcp_tools",           result: "27 tools registered",                 status: "ok",      ms: 44   },
  { id: "l3", agent: "ChatGPT-4o",       tool: "read_context_graph",       result: "Orion sprint context loaded",         status: "ok",      ms: 156  },
  { id: "l4", agent: "Orion Companion",  tool: "request_tool_action",      result: "Capability matched in 9ms",           status: "ok",      ms: 9    },
  { id: "l5", agent: "Metaphor Engine",  tool: "write_handoff_record",     result: "Handoff #1049 logged",                status: "ok",      ms: 204  },
];

// ── Status icon helper ────────────────────────────────────────────────────────

function StreamStatusIcon({ status }: { status: StreamStatus }) {
  if (status === "ok")      return <CheckCircle2  className="w-3 h-3 shrink-0" style={{ color: "#4CAF7D" }} />;
  if (status === "error")   return <AlertCircle   className="w-3 h-3 shrink-0 text-red-400" />;
  return <Loader2 className="w-3 h-3 shrink-0 animate-spin" style={{ color: "#4CAF7D" }} />;
}

// ── Live Activity Stream ──────────────────────────────────────────────────────

function ActivityStream() {
  const [rows, setRows] = useState<StreamRow[]>(INITIAL_STREAM);
  const liveIndex = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      const next = LIVE_ROWS[liveIndex.current % LIVE_ROWS.length];
      liveIndex.current++;
      setRows(prev => {
        const updated = [{ ...next, id: `live-${Date.now()}` }, ...prev].slice(0, 7);
        return updated;
      });
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden"
      style={{
        background: "#0D0D0D",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="relative flex h-2 w-2"
          >
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: "#4CAF7D" }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: "#4CAF7D" }}
            />
          </span>
          <span
            className="text-[11px] font-mono uppercase tracking-widest"
            style={{ color: "rgba(240,240,238,0.45)" }}
          >
            Live · Agent Activity Stream
          </span>
        </div>
        <span
          className="text-[10px] font-mono"
          style={{ color: "rgba(240,240,238,0.25)" }}
        >
          MCP Protocol v2.0
        </span>
      </div>

      {/* Stream rows */}
      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
        <AnimatePresence initial={false}>
          {rows.map((row) => (
            <motion.div
              key={row.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 px-5 py-3 group"
            >
              <StreamStatusIcon status={row.status} />

              {/* Agent */}
              <span
                className="w-36 shrink-0 text-[11px] font-mono truncate"
                style={{ color: "rgba(240,240,238,0.40)" }}
              >
                {row.agent}
              </span>

              {/* Arrow */}
              <ArrowRight
                className="w-3 h-3 shrink-0"
                style={{ color: "rgba(255,255,255,0.18)" }}
              />

              {/* Tool name */}
              <span
                className="w-44 shrink-0 text-[11px] font-mono font-semibold truncate"
                style={{ color: "rgba(240,240,238,0.80)" }}
              >
                {row.tool}
              </span>

              {/* Result */}
              <span
                className="flex-1 text-[11px] font-sans truncate"
                style={{ color: "rgba(240,240,238,0.38)" }}
              >
                {row.result}
              </span>

              {/* Latency */}
              <span
                className="shrink-0 text-[10px] font-mono ml-auto"
                style={{ color: "rgba(240,240,238,0.22)" }}
              >
                {row.status === "running" ? "—" : row.ms > 999 ? `${(row.ms / 1000).toFixed(1)}s` : `${row.ms}ms`}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Numbered Feature Card ─────────────────────────────────────────────────────

interface FeatureCardProps {
  num: string;
  title: string;
  description: string;
  icon: React.ElementType;
  delay?: number;
}

function FeatureCard({ num, title, description, icon: Icon, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
      className="relative overflow-hidden rounded-2xl p-7 group cursor-default"
      style={{
        background: "#0D0D0D",
        border: "1px solid rgba(255,255,255,0.055)",
      }}
    >
      {/* Ghost numeral */}
      <span
        className="absolute right-4 top-0 select-none pointer-events-none font-display font-bold leading-none"
        style={{
          fontSize: "clamp(80px, 10vw, 120px)",
          color: "rgba(255,255,255,0.038)",
          fontFamily: "'Cormorant Garamond', serif",
          lineHeight: 1,
        }}
        aria-hidden="true"
      >
        {num}
      </span>

      {/* Content */}
      <div className="relative z-10">
        <div
          className="text-xs font-mono mb-5"
          style={{ color: "rgba(240,240,238,0.30)" }}
        >
          {num}
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
          style={{
            background: "rgba(76,175,125,0.10)",
            border: "1px solid rgba(76,175,125,0.20)",
          }}
        >
          <Icon className="w-4 h-4" style={{ color: "#4CAF7D" }} />
        </div>
        <h3
          className="text-xl font-semibold mb-3"
          style={{
            fontFamily: "'Satoshi', sans-serif",
            color: "#F0F0EE",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "rgba(240,240,238,0.42)", fontFamily: "'Satoshi', sans-serif" }}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────

export default function LandingPage() {
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyCli = () => {
    navigator.clipboard.writeText("npx @metaphor/mcp-server start");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden flora-dot-canvas"
      style={{ color: "#F0F0EE" }}
    >
      {/* ── Navigation ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(0,0,0,0.78)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.04)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <MetaphorLogo size={18} />
            <span
              className="text-sm font-semibold tracking-tight"
              style={{
                fontFamily: "'Satoshi', sans-serif",
                color: "#F0F0EE",
                letterSpacing: "-0.02em",
              }}
            >
              Metaphor
            </span>
          </div>

          {/* Nav links — text only, no icons */}
          <nav className="hidden md:flex items-center gap-8">
            {["Node Studio", "Architecture", "MCP Proxy"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/ /g, "-")}`}
                className="text-[13px] transition-colors duration-150"
                style={{
                  fontFamily: "'Satoshi', sans-serif",
                  color: "rgba(240,240,238,0.45)",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#F0F0EE")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,240,238,0.45)")}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-[13px] transition-colors duration-150 hidden sm:block"
              style={{
                fontFamily: "'Satoshi', sans-serif",
                color: "rgba(240,240,238,0.45)",
              }}
            >
              Sign In
            </Link>
            <Link
              href="/projects"
              className="btn-flora-primary text-[13px]"
              style={{ minHeight: "36px", padding: "0 18px", borderRadius: "10px" }}
            >
              Launch Studio
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 md:px-10 pt-40 pb-24 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 mb-8 px-3.5 py-1.5 rounded-full"
            style={{
              background: "rgba(76,175,125,0.10)",
              border: "1px solid rgba(76,175,125,0.22)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#4CAF7D" }}
            />
            <span
              className="text-[11px] font-mono"
              style={{ color: "#4CAF7D" }}
            >
              MCP Protocol v2.0 · Now Generally Available
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="mb-6 px-4"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(48px, 7vw, 92px)",
              fontWeight: 500,
              lineHeight: 1.07,
              letterSpacing: "-0.015em",
              color: "#F0F0EE",
            }}
          >
            Where AI agents and tools share
            <br />
            <em
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                color: "#F0F0EE",
              }}
            >
              one continuous mind.
            </em>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{
              fontFamily: "'Satoshi', sans-serif",
              color: "rgba(240,240,238,0.48)",
            }}
          >
            Connect ChatGPT, Claude, and Orion to external tools, databases, and codebases.
            Deterministic handoffs, verifiable context, zero prompt drift.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/projects"
              className="btn-flora-primary"
            >
              Enter Node Studio
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleCopyCli}
              className="btn-flora-mono"
              aria-label="Copy CLI command to clipboard"
            >
              <Terminal className="w-4 h-4" style={{ color: "#4CAF7D" }} />
              npx @metaphor/mcp-server
              {copied
                ? <Check className="w-3.5 h-3.5 ml-1" style={{ color: "#4CAF7D" }} />
                : <Copy className="w-3.5 h-3.5 ml-1" style={{ color: "rgba(240,240,238,0.30)" }} />
              }
            </button>
          </motion.div>
        </section>

        {/* ── Activity Stream Demo ── */}
        <section
          id="node-studio"
          className="max-w-7xl mx-auto px-6 md:px-10 pb-28"
        >
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
          >
            <ActivityStream />
          </motion.div>

          {/* Footnote */}
          <p
            className="text-center text-[11px] font-mono mt-5"
            style={{ color: "rgba(240,240,238,0.22)" }}
          >
            Live data from{" "}
            <code
              className="font-mono"
              style={{ color: "rgba(240,240,238,0.35)" }}
            >
              /api/v1/mcp/audit-logs
            </code>
            {" "}· Rows update every ~3s
          </p>
        </section>

        {/* ── Numbered Feature Sections ── */}
        <section
          id="architecture"
          className="max-w-7xl mx-auto px-6 md:px-10 pb-32"
        >
          {/* Section eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span
              className="text-[11px] font-mono uppercase tracking-widest"
              style={{ color: "rgba(240,240,238,0.30)" }}
            >
              Core Architecture
            </span>
            <h2
              className="mt-3"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(32px, 4vw, 52px)",
                fontWeight: 400,
                letterSpacing: "-0.015em",
                color: "#F0F0EE",
                lineHeight: 1.1,
              }}
            >
              Engineered for absolute{" "}
              <em style={{ fontStyle: "italic", fontWeight: 300 }}>
                context continuity.
              </em>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FeatureCard
              num="01"
              title="Deterministic Baton Passing"
              description="Tasks don't get lost in infinite chat loops. Metaphor enforces a strict Task → Handoff → Execution lifecycle backed by PostgreSQL. Every baton is verifiable."
              icon={Layers}
              delay={0}
            />
            <FeatureCard
              num="02"
              title="Universal MCP Proxy"
              description="Act as a proxy for external MCP tools. Your host agent calls request_tool_action and Metaphor handles stdio/SSE communication with zero configuration."
              icon={Zap}
              delay={0.08}
            />
            <FeatureCard
              num="03"
              title="Sandboxed Capability Scopes"
              description="Each participant declares exact capabilities. Level-1 and Level-2 matching ensures the right agent or tool gets the baton every time — never a hallucination."
              icon={ShieldCheck}
              delay={0.16}
            />
          </div>
        </section>

        {/* ── MCP Proxy CTA Banner ── */}
        <section
          id="mcp-proxy"
          className="max-w-7xl mx-auto px-6 md:px-10 pb-32"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-2xl px-10 py-14 text-center"
            style={{
              background: "#0D0D0D",
              border: "1px solid rgba(255,255,255,0.055)",
            }}
          >
            {/* Ghost numeral background */}
            <span
              className="absolute right-8 top-0 select-none pointer-events-none font-display font-bold leading-none"
              style={{
                fontSize: "clamp(120px, 18vw, 220px)",
                color: "rgba(255,255,255,0.025)",
                fontFamily: "'Cormorant Garamond', serif",
                lineHeight: 1,
              }}
              aria-hidden="true"
            >
              M
            </span>

            <div className="relative z-10 max-w-2xl mx-auto">
              <span
                className="text-[11px] font-mono uppercase tracking-widest mb-4 block"
                style={{ color: "rgba(240,240,238,0.30)" }}
              >
                Ready to connect
              </span>
              <h2
                className="mb-4"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(28px, 3.5vw, 44px)",
                  fontWeight: 400,
                  letterSpacing: "-0.015em",
                  color: "#F0F0EE",
                }}
              >
                Your agents are already halfway there.
              </h2>
              <p
                className="text-base mb-8"
                style={{
                  fontFamily: "'Satoshi', sans-serif",
                  color: "rgba(240,240,238,0.42)",
                  lineHeight: 1.7,
                }}
              >
                Add Metaphor as a remote MCP server. ChatGPT, Claude, Cursor, and Orion connect in under two minutes.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/projects" className="btn-flora-primary">
                  Start Building
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/login" className="btn-flora-ghost" style={{ color: "#F0F0EE" }}>
                  View Documentation
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer
        className="text-center py-10"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <p
          className="text-[11px] font-mono"
          style={{ color: "rgba(240,240,238,0.22)" }}
        >
          METAPHOR · Cognitive Context Substrate · Pseudonyms Ecosystem
        </p>
      </footer>
    </div>
  );
}
