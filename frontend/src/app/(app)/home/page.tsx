"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { fetchFromMetaphor } from "@/app/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingState } from "@/components/ui/LoadingState";
import { ArrowRight, Clock, Network, ChevronRight, Shield, Target, Database, Lightbulb } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type NodeType = "fact" | "decision" | "constraint" | "insight" | "evidence" | "project" | "task" | string;

interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  status?: string;
  updated_at?: string;
  content?: string;
  connections?: number;
}

interface Handoff {
  id: string;
  source_agent: string;
  target_agent: string;
  task_goal: string;
  status: "pending" | "running" | "complete" | "failed" | "cancelled";
  created_at: string;
}

// ── Mock fallback data ─────────────────────────────────────────────────────

const MOCK_CHANGES: GraphNode[] = [
  { id: "m1", name: "Push-based notification architecture adopted", type: "decision", updated_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "m2", name: "Q4 deployment deadline confirmed", type: "constraint", updated_at: new Date(Date.now() - 14400000).toISOString() },
  { id: "m3", name: "Orion is the primary active project", type: "insight", updated_at: new Date(Date.now() - 18000000).toISOString() },
  { id: "m4", name: "User story mapping completed", type: "task", updated_at: new Date(Date.now() - 21600000).toISOString() },
];

const MOCK_ACTIVE: GraphNode[] = [
  { id: "a1", name: "Orion", type: "project", status: "active", content: "Notification System Architecture" },
  { id: "a2", name: "Atlas", type: "project", status: "pending", content: "Acquisition Setup" },
];

const MOCK_HANDOFFS: Handoff[] = [
  { id: "h1", source_agent: "Antigravity IDE", target_agent: "Claude (Cursor)", task_goal: "Fix TypeScript errors in frontend", status: "running", created_at: new Date(Date.now() - 1200000).toISOString() },
  { id: "h2", source_agent: "Claude (Cursor)", target_agent: "Orion", task_goal: "Summarise architectural decisions", status: "complete", created_at: new Date(Date.now() - 3600000).toISOString() },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function normaliseType(t: string): NodeType {
  const lower = t?.toLowerCase() ?? "fact";
  if (["decision", "constraint", "insight", "evidence", "fact", "project", "task"].includes(lower)) return lower as NodeType;
  return "fact";
}

function typeIcon(t: NodeType) {
  switch (t) {
    case "decision":   return Shield;
    case "constraint": return Target;
    case "insight":    return Lightbulb;
    default:           return Database;
  }
}

// Type dot colour
function typeColor(t: NodeType): string {
  switch (t) {
    case "decision":   return "rgba(129,140,248,1)"; // indigo
    case "constraint": return "#f59e0b"; // amber
    case "insight":    return "#4CAF7D"; // mint
    default:           return "rgba(240,240,238,0.35)";
  }
}

// Status stripe colour for handoff items
function statusStripe(s: Handoff["status"]): string {
  switch (s) {
    case "running":  return "#4CAF7D";
    case "complete": return "rgba(34,197,94,0.6)";
    case "failed":   return "rgba(244,63,94,0.7)";
    default:         return "rgba(255,255,255,0.10)";
  }
}

// ── Stagger variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

// ── Page ───────────────────────────────────────────────────────────────────

export default function HomeEnvironment() {
  const router = useRouter();
  const [authLoading, setAuthLoading]   = useState(true);
  const [dataLoading, setDataLoading]   = useState(true);
  const [userName, setUserName]         = useState("there");
  const [changes, setChanges]           = useState<GraphNode[]>([]);
  const [activeWork, setActiveWork]     = useState<GraphNode[]>([]);
  const [handoffs, setHandoffs]         = useState<Handoff[]>([]);

  // Auth guard
  useEffect(() => {
    async function checkAuth() {
      try {
        const isUnlocked =
          typeof document !== "undefined" &&
          (document.cookie.includes("metaphor_unlocked=true") ||
            localStorage.getItem("metaphor_unlocked") === "true");

        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && !isUnlocked) { router.push("/login?redirect=/home"); return; }

        const stored = localStorage.getItem("metaphor_user_name");
        const googleName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name;
        const emailFirst = session?.user?.email?.split("@")[0]?.split(/[^a-zA-Z]/)[0];
        setUserName(stored || googleName || emailFirst || "there");
      } catch {
        // proceed
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // Data fetch
  useEffect(() => {
    if (authLoading) return;

    async function load() {
      try {
        const [nodesRes, handoffsRes] = await Promise.allSettled([
          fetchFromMetaphor("/graph/nodes?sort=updated_at&limit=20"),
          fetchFromMetaphor("/graph/handoffs?limit=10"),
        ]);

        const nodes: GraphNode[] = nodesRes.status === "fulfilled" && nodesRes.value?.nodes?.length
          ? nodesRes.value.nodes : MOCK_CHANGES;

        const meaningful = nodes
          .filter((n) => ["decision", "constraint", "insight", "evidence"].includes(normaliseType(n.type)))
          .slice(0, 5);
        setChanges(meaningful.length ? meaningful : MOCK_CHANGES);

        const active = nodes
          .filter((n) => normaliseType(n.type) === "project" || n.status === "active")
          .slice(0, 3);
        setActiveWork(active.length ? active : MOCK_ACTIVE);

        const hData: Handoff[] = handoffsRes.status === "fulfilled" && handoffsRes.value?.handoffs?.length
          ? handoffsRes.value.handoffs.slice(0, 3) : MOCK_HANDOFFS;
        setHandoffs(hData);
      } catch {
        setChanges(MOCK_CHANGES);
        setActiveWork(MOCK_ACTIVE);
        setHandoffs(MOCK_HANDOFFS);
      } finally {
        setDataLoading(false);
      }
    }
    load();
  }, [authLoading]);

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingState context="generic" />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen pb-32">

      {/* ── Editorial Hero ─────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 lg:px-20 pt-14 pb-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Date eyebrow */}
            <div
              className="text-[10px] font-mono uppercase tracking-[0.25em] mb-5"
              style={{ color: "rgba(240,240,238,0.28)" }}
            >
              {today}
            </div>

            {/* Serif greeting headline */}
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(38px, 5vw, 64px)",
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "-0.015em",
                color: "var(--color-foreground)",
                marginBottom: "16px",
              }}
            >
              {greeting},{" "}
              <em style={{ fontStyle: "italic", fontWeight: 300 }}>
                {userName}.
              </em>
            </h1>

            {/* Subtitle — editorial prose */}
            <p
              className="text-base max-w-lg leading-relaxed"
              style={{
                fontFamily: "'Satoshi', sans-serif",
                color: "var(--color-muted)",
              }}
            >
              {dataLoading
                ? "Resolving your context across the mesh…"
                : `Your context mesh has ${changes.length} active thread${changes.length !== 1 ? "s" : ""}. ${handoffs.filter(h => h.status === "running").length} agents running now.`}
            </p>

            {/* Live pulse badge */}
            {!dataLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.28, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 mt-6 px-3.5 py-1.5 rounded-full"
                style={{
                  background: "rgba(76,175,125,0.08)",
                  border: "1px solid rgba(76,175,125,0.18)",
                }}
              >
                <span
                  className="relative flex h-1.5 w-1.5"
                >
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: "#4CAF7D" }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ background: "#4CAF7D" }}
                  />
                </span>
                <span
                  className="text-[11px] font-mono"
                  style={{ color: "#4CAF7D" }}
                >
                  Context live · {changes.length} update{changes.length !== 1 ? "s" : ""}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20 space-y-16">

        {/* ── Activity Feed (Since You Were Away) ──────────────────────── */}
        <section>
          <div
            className="flex items-center justify-between pb-3 mb-6"
            style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
          >
            <span
              className="text-[10px] font-mono uppercase tracking-widest"
              style={{ color: "var(--color-muted)" }}
            >
              Since you were away
            </span>
            <Link
              href="/context"
              className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest transition-colors duration-150"
              style={{ color: "var(--color-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-foreground)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-muted)")}
            >
              Explore <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {dataLoading ? (
            <LoadingState context="context" />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-px"
            >
              {changes.map((change) => {
                const t = normaliseType(change.type);
                const Icon = typeIcon(t);
                const dotColor = typeColor(t);
                return (
                  <motion.div
                    key={change.id}
                    variants={itemVariants}
                    className="group flex items-center gap-4 py-3.5 cursor-pointer transition-all duration-150"
                    style={{
                      borderBottom: "1px solid var(--color-border-subtle)",
                    }}
                    onClick={() => router.push(`/focus/${change.id}`)}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.paddingLeft = "4px";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.paddingLeft = "0px";
                    }}
                  >
                    {/* Type dot */}
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: dotColor }}
                    />

                    {/* Content */}
                    <p
                      className="flex-1 text-sm leading-snug transition-colors duration-150 truncate"
                      style={{
                        fontFamily: "'Satoshi', sans-serif",
                        color: "var(--color-foreground)",
                      }}
                    >
                      {change.name}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="text-[10px] font-mono hidden sm:block"
                        style={{ color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}
                      >
                        {t}
                      </span>
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: "rgba(240,240,238,0.22)" }}
                      >
                        {change.updated_at ? timeAgo(change.updated_at) : "—"}
                      </span>
                      <ChevronRight
                        className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-all"
                        style={{ color: "var(--color-muted)" }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </section>

        {/* ── Two-column: Active Projects + Active Handoffs ───────────── */}
        <div className="grid md:grid-cols-2 gap-12">

          {/* Active Projects — Flora numbered card style */}
          <section>
            <div
              className="pb-3 mb-6"
              style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
            >
              <span
                className="text-[10px] font-mono uppercase tracking-widest"
                style={{ color: "var(--color-muted)" }}
              >
                Current state
              </span>
            </div>
            {dataLoading ? (
              <LoadingState context="generic" compact />
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {activeWork.map((work, idx) => (
                  <motion.div
                    key={work.id}
                    variants={itemVariants}
                    className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      background: "var(--color-surface-1)",
                      border: "1px solid var(--color-border-subtle)",
                      padding: "16px 18px",
                    }}
                    onClick={() => router.push(`/focus/${work.id}`)}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border-mid)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border-subtle)";
                    }}
                  >
                    {/* Ghost numeral */}
                    <span
                      className="absolute right-3 top-0 select-none pointer-events-none font-bold leading-none"
                      style={{
                        fontSize: "52px",
                        fontFamily: "'Cormorant Garamond', serif",
                        color: "rgba(255,255,255,0.04)",
                        lineHeight: 1,
                      }}
                      aria-hidden="true"
                    >
                      0{idx + 1}
                    </span>

                    <div className="relative z-10 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className="text-[9px] font-mono uppercase tracking-widest mb-1.5"
                          style={{ color: "var(--color-muted)" }}
                        >
                          {work.type}
                        </p>
                        <p
                          className="text-sm font-semibold"
                          style={{
                            fontFamily: "'Satoshi', sans-serif",
                            color: "var(--color-foreground)",
                            letterSpacing: "-0.015em",
                          }}
                        >
                          {work.name}
                        </p>
                        {work.content && (
                          <p
                            className="text-xs mt-1 truncate"
                            style={{ color: "var(--color-muted)" }}
                          >
                            {work.content}
                          </p>
                        )}
                      </div>
                      {work.status && (
                        <StatusBadge type={work.status === "active" ? "running" : "pending"} dot size="sm" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

          {/* Active Handoffs — editorial slim rows */}
          <section>
            <div
              className="flex items-center justify-between pb-3 mb-6"
              style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
            >
              <span
                className="text-[10px] font-mono uppercase tracking-widest"
                style={{ color: "var(--color-muted)" }}
              >
                Active handoffs
              </span>
              <Link
                href="/work"
                className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest transition-colors duration-150"
                style={{ color: "var(--color-muted)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--color-foreground)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--color-muted)")}
              >
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {dataLoading ? (
              <LoadingState context="handoffs" compact />
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-2"
              >
                {handoffs.map((h) => (
                  <motion.div
                    key={h.id}
                    variants={itemVariants}
                    className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      background: "var(--color-surface-1)",
                      border: "1px solid var(--color-border-subtle)",
                      borderLeft: `3px solid ${statusStripe(h.status)}`,
                      padding: "14px 16px",
                    }}
                    onClick={() => router.push("/work")}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.borderRightColor = "var(--color-border-mid)";
                      (e.currentTarget as HTMLDivElement).style.borderTopColor = "var(--color-border-mid)";
                      (e.currentTarget as HTMLDivElement).style.borderBottomColor = "var(--color-border-mid)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.borderRightColor = "var(--color-border-subtle)";
                      (e.currentTarget as HTMLDivElement).style.borderTopColor = "var(--color-border-subtle)";
                      (e.currentTarget as HTMLDivElement).style.borderBottomColor = "var(--color-border-subtle)";
                    }}
                  >
                    {/* Agent chain */}
                    <div className="flex items-center gap-1.5 mb-1.5 min-w-0">
                      <span
                        className="text-[11px] font-semibold truncate"
                        style={{ fontFamily: "'Satoshi', sans-serif", color: "var(--color-foreground)" }}
                      >
                        {h.source_agent}
                      </span>
                      <ArrowRight className="w-2.5 h-2.5 shrink-0" style={{ color: "var(--color-muted)" }} />
                      <span
                        className="text-[11px] truncate"
                        style={{ fontFamily: "'Satoshi', sans-serif", color: "var(--color-muted)" }}
                      >
                        {h.target_agent}
                      </span>
                      <StatusBadge type={h.status} dot size="sm" />
                    </div>
                    <p
                      className="text-[11px] truncate"
                      style={{ color: "var(--color-muted)", fontFamily: "'Satoshi', sans-serif" }}
                    >
                      {h.task_goal}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock className="w-2.5 h-2.5" style={{ color: "rgba(240,240,238,0.22)" }} />
                      <span className="text-[9px] font-mono" style={{ color: "rgba(240,240,238,0.22)" }}>
                        {timeAgo(h.created_at)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
        </div>

        {/* ── Explore World CTA ──────────────────────────────────────── */}
        <section className="pb-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-200 group"
            style={{
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border-subtle)",
              padding: "32px",
            }}
            onClick={() => router.push("/world")}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border-mid)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border-subtle)";
            }}
          >
            {/* Ghost "W" numeral */}
            <span
              className="absolute right-6 top-0 select-none pointer-events-none font-bold leading-none"
              style={{
                fontSize: "clamp(80px, 12vw, 140px)",
                fontFamily: "'Cormorant Garamond', serif",
                color: "rgba(255,255,255,0.03)",
                lineHeight: 1,
              }}
              aria-hidden="true"
            >
              W
            </span>

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div>
                <div
                  className="text-[9px] font-mono uppercase tracking-widest mb-2"
                  style={{ color: "var(--color-muted)" }}
                >
                  Explore
                </div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "clamp(24px, 3vw, 36px)",
                    fontWeight: 400,
                    letterSpacing: "-0.015em",
                    color: "var(--color-foreground)",
                    lineHeight: 1.1,
                  }}
                >
                  Enter your{" "}
                  <em style={{ fontStyle: "italic", fontWeight: 300 }}>World.</em>
                </h3>
                <p
                  className="text-sm mt-2"
                  style={{ color: "var(--color-muted)", fontFamily: "'Satoshi', sans-serif" }}
                >
                  Explore how everything is connected.
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                style={{
                  border: "1px solid var(--color-border-mid)",
                  background: "var(--color-surface-2)",
                }}
              >
                <Network className="w-4 h-4" style={{ color: "var(--color-muted)" }} />
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}
