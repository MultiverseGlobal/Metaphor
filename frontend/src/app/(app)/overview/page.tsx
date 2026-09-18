"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Database,
  Sparkles,
  Server,
  Activity,
  Terminal,
  Inbox,
  ArrowRight,
  Clock,
  Bot,
  Network,
  ShieldCheck,
  Search,
  Plug,
} from "lucide-react";
import { fetchFromMetaphor } from "@/app/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { CardSkeleton } from "@/components/ui/SkeletonLoader";
import { useMetaphorSSE } from "@/hooks/useMetaphorSSE";

interface ActiveClient {
  client_name: string;
  project_id: string | null;
  connected_at: string;
}

interface HandoffItem {
  id: string;
  source_ai: string;
  target_ai: string;
  payload: string;
  status: string;
  created_at: string;
}

export default function SynchronizationDashboard() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [queryInput, setQueryInput] = useState("");
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState({
    node_count: 0,
    edge_count: 0,
    active_sessions: 0,
    total_events: 0,
    pending_approvals: 0,
  });
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [activeClients, setActiveClients] = useState<ActiveClient[]>([]);
  const [handoffs, setHandoffs] = useState<HandoffItem[]>([]);
  const [recentNodes, setRecentNodes] = useState<{ title: string; type: string; created_at: string }[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const notifications = useMetaphorSSE();

  const supabase = createClient();

  const fetchLiveData = useCallback(async () => {
    try {
      const [clientsData, statsData] = await Promise.allSettled([
        fetchFromMetaphor("/mcp/active-clients"),
        fetchFromMetaphor("/graph/stats"),
      ]);
      if (clientsData.status === "fulfilled" && clientsData.value?.clients) {
        setActiveClients(clientsData.value.clients);
      }
      if (statsData.status === "fulfilled" && statsData.value) {
        setStats({ ...statsData.value, pending_approvals: 12 }); // Mocking pending approvals
      }
      const [handoffData, nodeData] = await Promise.allSettled([
        fetchFromMetaphor("/graph/handoffs?limit=5"),
        fetchFromMetaphor("/graph/nodes?limit=5&order=created_at.desc"),
      ]);
      if (handoffData.status === "fulfilled" && handoffData.value?.handoffs) {
        setHandoffs(handoffData.value.handoffs);
      }
      if (nodeData.status === "fulfilled" && nodeData.value?.nodes) {
        setRecentNodes(nodeData.value.nodes);
      }
      setLastRefresh(new Date());
    } catch (e) {
      console.error("Live data fetch error:", e);
    }
  }, []);

  useEffect(() => {
    async function checkAuthAndFetch() {
      const safetyTimer = setTimeout(() => {
        setAuthLoading(false);
      }, 1500);

      try {
        const isUnlocked =
          typeof document !== "undefined" &&
          (document.cookie.includes("metaphor_unlocked=true") ||
            localStorage.getItem("metaphor_unlocked") === "true");
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session && !isUnlocked) {
          clearTimeout(safetyTimer);
          router.push("/login?redirect=/dashboard");
          return;
        }
        setAuthLoading(false);
        clearTimeout(safetyTimer);

        try {
          const userData = await fetchFromMetaphor("/auth/me");
          if (userData) {
            setUser(userData);
          } else {
            const localName = typeof window !== "undefined" ? localStorage.getItem("metaphor_user_name") : null;
            setUser({ name: localName || "Sovereign User", email: "sovereign@local" });
          }
        } catch {
          const localName = typeof window !== "undefined" ? localStorage.getItem("metaphor_user_name") : null;
          setUser({ name: localName || "Sovereign User", email: "sovereign@local" });
        }
        await fetchLiveData();
      } catch (err) {
        console.error("Auth check failed:", err);
        setAuthLoading(false);
      }
    }
    checkAuthAndFetch();

    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, [router, fetchLiveData, supabase.auth]);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    router.push(`/dashboard/playground?q=${encodeURIComponent(queryInput.trim())}`);
  };

  const syncIntegration = async (provider: string) => {
    setSyncing((prev) => ({ ...prev, [provider]: true }));
    try {
      await fetchFromMetaphor(`/integrations/${provider}/sync`, undefined, "POST");
    } catch (e) {
      console.error(`Failed to sync ${provider}:`, e);
    } finally {
      setSyncing((prev) => ({ ...prev, [provider]: false }));
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 pt-32 space-y-8 animate-in fade-in duration-150">
        <div className="w-48 h-8 rounded-xl bg-surface-2 animate-pulse mb-8 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen animate-in fade-in duration-300 pb-24">
      
      {/* Subtle Dot Matrix Spatial Background */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,#000_70%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* SSE Real-Time Event Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="w-80 bg-surface-1/95 border border-border-subtle rounded-xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-right-4 fade-in duration-300"
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  notif.type === "handoff_received" ? "text-primary" : "text-success"
                }`}
              >
                {notif.type === "handoff_received" ? "Action Received" : "Resolved"}
              </span>
              <span className="text-[10px] text-muted">Just now</span>
            </div>
            <h4 className="text-sm font-semibold text-foreground">{notif.title}</h4>
            <p className="text-xs text-muted mt-1 leading-relaxed">{notif.description}</p>
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6">

        {/* ── Atlas-Style Spatial Hero Deck ────────────────────────────── */}
        <div className="flex flex-col items-center text-center pt-28 sm:pt-36 pb-12">
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-3 font-sans">
            System Overview
          </h1>
          <p className="text-muted text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Metaphor OS is actively monitoring your knowledge graph and serving context.
          </p>

          <div className="mt-8 flex items-center justify-center">
            <Link 
              href="/explorer"
              className="flex items-center gap-2 py-3 px-6 bg-foreground text-background text-sm font-medium rounded-xl hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-md"
            >
              <span>Launch Context Explorer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Real-Time Telemetry Signal Pill */}
          <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-1/80 border border-border-subtle/80 text-xs text-muted shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="font-semibold text-foreground">MCP Online:</span>
            <span>Ready for connections</span>
            <span className="opacity-40">·</span>
            <span>{stats.node_count} concepts</span>
          </div>
        </div>

        {/* ── Architecture Telemetry Metrics ───────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-surface-1/70 border border-border-subtle/80 backdrop-blur-md hover:border-border-strong transition-all shadow-xs group">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
              <Activity className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">Graph Nodes</p>
            <p className="text-xl font-semibold text-foreground tracking-tight">{stats.node_count}</p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-1/70 border border-border-subtle/80 backdrop-blur-md hover:border-border-strong transition-all shadow-xs group">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-3">
              <Network className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">Graph Edges</p>
            <p className="text-xl font-semibold text-foreground tracking-tight">{stats.edge_count}</p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-1/70 border border-border-subtle/80 backdrop-blur-md hover:border-border-strong transition-all shadow-xs group">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3">
              <Inbox className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">Pending Approvals</p>
            <p className="text-xl font-semibold text-foreground tracking-tight">{stats.pending_approvals}</p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-1/70 border border-border-subtle/80 backdrop-blur-md hover:border-border-strong transition-all shadow-xs group">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
              <Server className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1">Active AI Sessions</p>
            <p className="text-xl font-semibold text-foreground tracking-tight">{stats.active_sessions}</p>
          </div>
        </div>

        {/* ── Connected AI Clients & Intelligence Sources ──────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Connected AI Clients */}
          <div className="p-6 rounded-2xl bg-surface-1/70 border border-border-subtle/80 backdrop-blur-md shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">
                  Connected MCP Clients
                </h2>
              </div>
              <Link
                href="/api"
                className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors"
              >
                Manage Tokens →
              </Link>
            </div>

            {activeClients.length === 0 ? (
              <div className="flex-1 p-8 text-center rounded-xl bg-surface-2/30 border border-border-subtle/40 flex flex-col items-center justify-center">
                <Bot className="w-7 h-7 text-muted/50 mx-auto mb-2" />
                <p className="text-xs font-medium text-muted">No external AI clients connected.</p>
                <p className="text-[11px] text-muted/60 mt-1">
                  Connect Claude, Cursor, or ChatGPT via Remote MCP to query memory.
                </p>
              </div>
            ) : (
              <div className="space-y-2 flex-1">
                {activeClients.map((client, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface-2/40 border border-border-subtle/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-semibold text-foreground capitalize">
                        {client.client_name || "Unknown Client"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted">Active</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connected Ingestion Sources */}
          <div className="p-6 rounded-2xl bg-surface-1/70 border border-border-subtle/80 backdrop-blur-md shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Plug className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">
                  Data Connectors
                </h2>
              </div>
              <Link
                href="/integrations"
                className="text-[10px] font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors"
              >
                Configure →
              </Link>
            </div>

            <div className="space-y-2 flex-1">
              <IntegrationRow
                name="Notion Context Vault"
                status={`${stats.total_events} documents ingested`}
                freshness="Updated 2m ago"
                health="healthy"
                loading={syncing["notion"]}
                onSync={() => syncIntegration("notion")}
              />
              <IntegrationRow
                name="GitHub Workspace Repo"
                status="Connected & Watching"
                freshness="Updated 15m ago"
                health="warning"
                loading={syncing["github"]}
                onSync={() => syncIntegration("github")}
              />
              <IntegrationRow
                name="Gmail Intelligence"
                status="Ready to Connect"
                freshness="Never synced"
                health="error"
                loading={syncing["gmail"]}
                onSync={() => syncIntegration("gmail")}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function IntegrationRow({
  name,
  status,
  freshness,
  health = "healthy",
  loading = false,
  onSync,
}: {
  name: string;
  status: string;
  freshness: string;
  health?: "healthy" | "warning" | "error";
  loading?: boolean;
  onSync?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-surface-2/30 border border-border-subtle/50 hover:bg-surface-2/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${
          health === "healthy" ? "bg-emerald-500" :
          health === "warning" ? "bg-amber-500" : "bg-danger"
        }`} />
        <div>
          <p className="text-xs font-semibold text-foreground tracking-tight">{name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[11px] text-muted">{status}</p>
            <span className="text-muted/40">•</span>
            <p className="text-[10px] text-muted flex items-center gap-1"><Clock className="w-3 h-3"/>{freshness}</p>
          </div>
        </div>
      </div>
      {onSync && (
        <button
          onClick={onSync}
          disabled={loading}
          className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-lg bg-surface-1 border border-border-subtle hover:border-border-strong transition-all text-foreground cursor-pointer disabled:opacity-50"
        >
          {loading ? "Syncing..." : "Sync"}
        </button>
      )}
    </div>
  );
}
