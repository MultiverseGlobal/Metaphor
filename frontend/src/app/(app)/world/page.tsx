"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Shield,
  Search,
  Sparkles,
  AlertCircle
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  role: string;
  status: "healthy" | "syncing" | "idle";
  latency: string;
  lastEvent: string;
  icon: React.ReactNode;
}

const DEFAULT_PARTICIPANTS: Participant[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    role: "Reasoning Engine",
    status: "healthy",
    latency: "22ms",
    lastEvent: "Active prompt session",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-ink)">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3428 7.897a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3428 7.897zm16.5986 3.8558L13.1038 8.3843l2.0153-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4022-.6814zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.4084 9.2312V6.8988a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6814l-.0048 6.7226zm1.107-1.4244l2.5843-1.4904 2.5843 1.4904v2.9808l-2.5843 1.4904-2.5843-1.4904z" />
      </svg>
    ),
  },
  {
    id: "claude",
    name: "Claude",
    role: "Architecture & Review",
    status: "healthy",
    latency: "28ms",
    lastEvent: "Context validation complete",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-ink)">
        <path d="M13.527 2.22c.328 0 .618.21.716.52l1.968 6.208 6.209 1.968c.31.098.52.388.52.716s-.21.618-.52.716l-6.209 1.968-1.968 6.209c-.098.31-.388.52-.716.52s-.618-.21-.716-.52l-1.968-6.209-6.209-1.968c-.31-.098-.52-.388-.52-.716s.21-.618.52-.716l6.209-1.968 1.968-6.208c.098-.31.388-.52.716-.52z" />
      </svg>
    ),
  },
  {
    id: "github",
    name: "GitHub",
    role: "Repository Mesh",
    status: "healthy",
    latency: "45ms",
    lastEvent: "Branch state synchronized",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-ink)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    ),
  },
  {
    id: "cursor",
    name: "Cursor",
    role: "Editor Buffer",
    status: "healthy",
    latency: "14ms",
    lastEvent: "Buffer cursor line 142",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-ink)">
        <path d="M12 1.5L2.5 7.02v10.16L12 22.7l9.5-5.52V7.02L12 1.5zm0 2.38l6.98 4.06L12 12.01 5.02 7.94 12 3.88zm-7.5 5.5l6.5 3.77v7.54l-6.5-3.77V9.38zm8.5 11.31v-7.54l6.5-3.77v7.54l-6.5 3.77z" />
      </svg>
    ),
  },
];

export default function ConnectedWorldPage() {
  const [projectName, setProjectName] = useState("Global Context");
  const [participants, setParticipants] = useState<Participant[]>(DEFAULT_PARTICIPANTS);
  const [approvedHandoff, setApprovedHandoff] = useState(false);
  const [quickQuery, setQuickQuery] = useState("");

  useEffect(() => {
    try {
      const step1 = sessionStorage.getItem("metaphor_onboard_step1");
      if (step1) {
        const parsed = JSON.parse(step1);
        if (parsed.name) setProjectName(parsed.name.trim());
      }
    } catch {}
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-20 min-h-screen">
      {/* ── World Command Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[rgba(10,10,10,0.06)] mb-12">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-[#AEB7BC] mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Coordination Layer Active</span>
            <span>&middot;</span>
            <span className="text-[var(--color-ink)]">Scope: {projectName}</span>
          </div>
          <h1
            className="font-display text-[clamp(40px,5vw,54px)] leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)]"
            style={{ fontWeight: 400 }}
          >
            Your Connected World.
          </h1>
          <p className="text-[15px] text-[#555E64] mt-2 max-w-2xl">
            Live coordination mesh across your intelligence tools. Context, handoffs, and execution state synchronize automatically.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/context"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[rgba(10,10,10,0.12)] bg-white/80 hover:bg-white hover:border-[var(--color-ink)] transition-all text-[13px] font-medium text-[var(--color-ink)] shadow-sm"
          >
            <Search size={14} />
            <span>Explore Context</span>
          </Link>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-ink)] text-white hover:bg-black transition-colors text-[13px] font-medium shadow-sm"
          >
            <Plus size={14} />
            <span>Add Participant</span>
          </Link>
        </div>
      </div>

      {/* ── What Changed While You Were Away (Activity Digest) ── */}
      <div className="p-6 rounded-2xl border border-[rgba(10,10,10,0.08)] bg-white/70 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.02)] mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#6366F1] shrink-0 mt-0.5">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#AEB7BC] mb-0.5">
                Activity Digest
              </div>
              <h3 className="text-[16px] font-medium text-[var(--color-ink)]">
                While you were away: 3 cross-tool context passes completed
              </h3>
              <p className="text-[13px] text-[#555E64] mt-1 leading-relaxed">
                ChatGPT ingested 14 files from GitHub for the session, and Notion synchronized updated product constraints into working memory.
              </p>
            </div>
          </div>
          <Link
            href="/handoffs"
            className="text-[12px] font-mono tracking-wider uppercase text-[var(--color-ink)] hover:underline whitespace-nowrap"
          >
            View all handoffs &rarr;
          </Link>
        </div>
      </div>

      {/* ── Connected Participants Matrix ── */}
      <section className="mb-14">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,10,0.06)] mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-[12px] font-mono uppercase tracking-wider text-[#555E64]">
              Connected Participants ({participants.length})
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Mesh Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {participants.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl border border-[rgba(10,10,10,0.06)] bg-white/60 hover:bg-white hover:border-[rgba(10,10,10,0.14)] transition-all flex flex-col justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-black/[0.03] border border-[rgba(10,10,10,0.06)] flex items-center justify-center">
                  {p.icon}
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{p.latency}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[15px] font-medium text-[var(--color-ink)] tracking-tight">
                  {p.name}
                </h4>
                <p className="text-[12px] text-[#AEB7BC] font-mono">{p.role}</p>
              </div>

              <div className="pt-3 border-t border-[rgba(10,10,10,0.05)] text-[11px] text-[#555E64] flex items-center justify-between font-mono">
                <span className="truncate">{p.lastEvent}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Waiting Approvals & Active Handoff ── */}
      <section className="mb-14">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,10,0.06)] mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-[12px] font-mono uppercase tracking-wider text-[#555E64]">
              Pending Context Action &middot; Coordinated Approval
            </h2>
          </div>
          <span className="text-[11px] font-mono text-amber-600">1 Action Required</span>
        </div>

        <div className="p-6 rounded-2xl border border-[rgba(10,10,10,0.08)] bg-white/80 backdrop-blur-md shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[12px] font-mono text-[#AEB7BC]">
                <span className="px-2 py-0.5 rounded bg-black/[0.04] text-[var(--color-ink)] font-medium">
                  #HO-1042
                </span>
                <span>&middot;</span>
                <span className="text-[var(--color-ink)] font-medium">ChatGPT &rarr; GitHub</span>
                <span>&middot;</span>
                <span>Waiting for human approval</span>
              </div>
              <h3 className="text-[17px] font-medium text-[var(--color-ink)]">
                Promote draft PR description &amp; architectural rationale into GitHub repository
              </h3>
              <p className="text-[13px] text-[#555E64]">
                Context bundle contains 12 referenced files, ADR-42, and conversation summary.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/context"
                className="px-4 py-2 rounded-full border border-[rgba(10,10,10,0.12)] text-[13px] text-[#555E64] hover:text-[var(--color-ink)] transition-colors"
              >
                Inspect Scope
              </Link>
              {approvedHandoff ? (
                <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-700 text-[13px] font-medium border border-emerald-200">
                  <CheckCircle2 size={15} /> Approved &amp; Dispatched
                </span>
              ) : (
                <button
                  onClick={() => setApprovedHandoff(true)}
                  className="px-5 py-2.5 rounded-full bg-[var(--color-ink)] text-white hover:bg-black transition-colors text-[13px] font-medium cursor-pointer"
                >
                  Approve &amp; Handoff
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Recent Context Movement (Live Stream) ── */}
      <section>
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,10,0.06)] mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-[12px] font-mono uppercase tracking-wider text-[#555E64]">
              Recent Movement Stream
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#AEB7BC]">
            Stream live &middot; Real-time sync
          </span>
        </div>

        <div className="flex flex-col divide-y divide-[rgba(10,10,10,0.06)]">
          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <div>
                <span className="text-[14px] font-medium text-[var(--color-ink)]">
                  Notion &rarr; ChatGPT: Ingested PRD requirements
                </span>
                <span className="text-[12px] text-[#AEB7BC] font-mono block">
                  Updated active reasoning scope with Q4 freeze timeline
                </span>
              </div>
            </div>
            <span className="text-[12px] font-mono text-[#AEB7BC] shrink-0">12m ago</span>
          </div>

          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div>
                <span className="text-[14px] font-medium text-[var(--color-ink)]">
                  Cursor &rarr; Antigravity: Exchanged active breakpoint diagnostics
                </span>
                <span className="text-[12px] text-[#AEB7BC] font-mono block">
                  Preserved line cursor positions and AST bindings across IDE boundary
                </span>
              </div>
            </div>
            <span className="text-[12px] font-mono text-[#AEB7BC] shrink-0">45m ago</span>
          </div>

          <div className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div>
                <span className="text-[14px] font-medium text-[var(--color-ink)]">
                  GitHub &rarr; Context Mesh: Synced commit d081f93
                </span>
                <span className="text-[12px] text-[#AEB7BC] font-mono block">
                  11 modified files indexed for cross-tool context availability
                </span>
              </div>
            </div>
            <span className="text-[12px] font-mono text-[#AEB7BC] shrink-0">1h ago</span>
          </div>
        </div>
      </section>
    </div>
  );
}
