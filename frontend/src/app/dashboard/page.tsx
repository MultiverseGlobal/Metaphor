"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Compass, 
  Clock, 
  Inbox, 
  Settings, 
  Globe, 
  RefreshCw, 
  Loader2, 
  Moon, 
  Sun,
  FileText,
  Plug,
  CircleDot,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ChevronLeft,
  Activity,
  Network
} from "lucide-react";
import { fetchFromMetaphor } from "../api";

export default function Dashboard() {
  const router = useRouter();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<"maps" | "timeline" | "notifications" | "reports" | "datasources" | "publicpage" | "settings">("maps");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Loaded Context Data States
  const [snapshot, setSnapshot] = useState<any>(null);
  const [inboxData, setInboxData] = useState<any>({ pending_nodes: [], pending_edges: [], clarifications: [] });
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Credentials config
  const [apiKey, setApiKey] = useState("metaphor_dev_secret_key_123");
  const [notionToken, setNotionToken] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [chatgptToken, setChatgptToken] = useState("");
  const [claudeToken, setClaudeToken] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiKey(localStorage.getItem("metaphor_api_key") || "metaphor_dev_secret_key_123");
      setNotionToken(localStorage.getItem("notion_token") || "");
      setGithubToken(localStorage.getItem("github_token") || "");
      setChatgptToken(localStorage.getItem("chatgpt_token") || "");
      setClaudeToken(localStorage.getItem("claude_token") || "");

      loadAllData();
    }
  }, [router]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSnapshot(),
        loadInboxData()
      ]);
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadSnapshot = async () => {
    try {
      const snap = await fetchFromMetaphor("/context/snapshot", { consumer: "Console", intent: "overview" });
      setSnapshot(snap);
    } catch (err) {
      setSnapshot({
        mission: "Develop the Metaphor universal context operating system to align all connected AI agents and build a single source of truth.",
        active_projects: [
          { id: "p1", name: "Metaphor Core", type: "Project", metadata: { description: "Universal Context OS API and reflection engine" } },
          { id: "p2", name: "Atlas Portal", type: "Project", metadata: { description: "High fidelity interface visualization console" } }
        ],
        recent_decisions: [
          { id: "d1", name: "Deploy Postgres + pgvector inside Docker", type: "Decision", metadata: { reason: "Enable semantic vector embeddings retrieval" } },
          { id: "d2", name: "Use Developer API keys for V1 credentials verification", type: "Decision", metadata: { reason: "Bypasses initial OAuth complexity" } }
        ],
        constraints: [
          "Avoid direct OAuth setup for V1 integrations (use developer PAT keys first)",
          "All LLM updates must be structured through the JSON Reflection schemas"
        ],
        recommended_focus: "Focus on testing the new Context Inbox and staging pasted ChatGPT conversations into pending memories.",
        confidence: 0.88
      });
    }
  };

  const loadInboxData = async () => {
    try {
      const data = await fetchFromMetaphor("/inbox");
      setInboxData(data);
    } catch (err) {
      setInboxData({
        pending_nodes: [
          {
            id: "pn1",
            name: "Increase Atlas pricing to $500",
            type: "Decision",
            metadata: {
              type: "Pricing Change",
              previous_value: "$300",
              new_value: "$500",
              reason: "Reflect premium enterprise integration layers",
              confidence: 0.85
            }
          }
        ],
        pending_edges: [
          {
            id: "pe1",
            source_id: "pn1",
            source_name: "Increase Atlas pricing to $500",
            target_id: "p2",
            target_name: "Atlas Portal",
            dimension: "structural",
            relationship_type: "belongs_to",
            description: "Proposed connection: Decision belongs to Atlas."
          }
        ],
        clarifications: [
          {
            id: "c1",
            question_text: "I detected that Atlas and William may be related. Are they:",
            options_json: ["Separate companies", "Products in one ecosystem", "Peer systems", "Something else"]
          }
        ]
      });
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex relative overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className={`border-r border-border/50 bg-surface/30 backdrop-blur-xl flex flex-col relative z-20 shrink-0 transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}>
        
        {/* Header Branding */}
        <div className={`p-5 flex items-center border-b border-border/50 ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
          <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)] shrink-0">
            <Network className="w-4 h-4" />
          </div>
          {!sidebarCollapsed && (
            <div className="text-left overflow-hidden">
              <h1 className="text-sm font-bold tracking-tight text-foreground">Metaphor OS</h1>
              <p className="eyebrow mt-0.5">Workspace</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {[
            { id: "maps", label: "Ontology Control", icon: Compass },
            { id: "timeline", label: "Context Feed", icon: Clock },
            { id: "notifications", label: "Inbox Signals", icon: Inbox },
            { id: "reports", label: "Context Health", icon: FileText },
            { id: "datasources", label: "Connectors", icon: Plug },
            { id: "publicpage", label: "Public Shares", icon: Globe },
            { id: "settings", label: "API Credentials", icon: Settings }
          ].map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center p-2.5 gap-3 cursor-pointer ${sidebarCollapsed ? "justify-center" : ""} ${isActive ? "ghost-interactive active glow-active" : "ghost-interactive"}`}
              >
                <IconComp size={16} className={isActive ? "text-accent-cyan" : "text-muted-foreground"} />
                {!sidebarCollapsed && <span className="text-xs font-semibold tracking-wide">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-border/50 space-y-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full text-left flex items-center gap-3 p-2 ghost-interactive cursor-pointer"
          >
            <ChevronLeft size={16} className={`transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
            {!sidebarCollapsed && <span className="text-xs font-semibold">Collapse</span>}
          </button>

          {/* Profile Card */}
          <div className={`pt-2 border-t border-border/50 flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
            {!sidebarCollapsed && (
              <div className="text-left pl-2">
                <p className="text-xs font-bold text-foreground">SUDO</p>
                <p className="eyebrow">@admin</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="p-2 ghost-interactive text-muted-foreground hover:text-destructive cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative z-10 overflow-y-auto">
        
        {/* Mission Control Top Bar */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <span className="eyebrow">Connected Streams:</span>
            <div className="flex items-center gap-2">
              {["GitHub", "Notion", "Calendar", "Stripe"].map((src) => (
                <div key={src} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-surface/50 text-[10px] font-mono font-semibold text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  <span>{src}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>94% Context Health</span>
            </div>

            <button 
              onClick={async () => {
                setIsSyncing(true);
                try {
                  await fetchFromMetaphor("/sync", {}, "POST");
                  await loadAllData();
                } catch (e) {
                  console.error("Sync error:", e);
                } finally {
                  setIsSyncing(false);
                }
              }}
              disabled={isSyncing}
              className="px-4 py-2 rounded-md bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 text-xs flex items-center gap-2 font-semibold transition-all cursor-pointer"
            >
              <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
              <span>{isSyncing ? "Syncing..." : "Sync Workspace"}</span>
            </button>
          </div>
        </header>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-md flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={40} className="animate-spin text-primary" />
              <p className="eyebrow">Indexing Metaphor Context OS...</p>
            </div>
          </div>
        )}

        <div className="flex-1 p-8">
          
          {/* TAB 1: ONTOLOGY CONTROL VIEW */}
          {activeTab === "maps" && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary eyebrow">
                  <CircleDot size={12} />
                  <span>Foundry Ontology Engine</span>
                </div>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Living Context Graph</h2>
                <p className="text-sm text-muted-foreground font-light max-w-2xl">
                  Continuous object-relational model linking raw exhaust from connected tools into clear operational entities.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Ontology & Objects Panel (2 Cols) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="glass-panel p-6 space-y-6">
                    <div className="flex justify-between items-center border-b border-border/50 pb-4">
                      <span className="eyebrow">Active Entities (Ontology)</span>
                      <span className="data-badge">14 Entities Indexed</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: "o1", name: "Metaphor Core OS", type: "Project", status: "approved", metadata: { desc: "Context OS Backend Service" }, conn: ["GitHub", "Docker"] },
                        { id: "o2", name: "Atlas Strategy Portal", type: "Project", status: "approved", metadata: { desc: "Visual Strategy Interface" }, conn: ["Next.js"] },
                        { id: "o3", name: "William Agent", type: "Project", status: "approved", metadata: { desc: "Daily Scheduling Agent" }, conn: ["Calendar", "API"] },
                        { id: "o4", name: "Benjamin", type: "Person", status: "approved", metadata: { role: "Founder / Engineer" }, conn: ["GitHub", "Gmail"] },
                        { id: "o5", name: "Deploy Postgres + pgvector", type: "Decision", status: "approved", metadata: { reason: "Enable vector similarity" }, conn: ["Postgres"] },
                        { id: "o6", name: "Atlas & Metaphor Alignment Sync", type: "Meeting", status: "approved", metadata: { host: "Benjamin", date: "2026-07-21" }, conn: ["Calendar"] },
                        { id: "o7", name: "feat: add pgvector table", type: "Commit", status: "approved", metadata: { repo: "pseudonyms/metaphor" }, conn: ["GitHub"] },
                        { id: "o8", name: "Increase pricing to $500", type: "Decision", status: "pending", metadata: { reason: "Enterprise context layer" }, conn: ["Stripe"] }
                      ].map((entity) => (
                        <div 
                          key={entity.id}
                          className="p-4 rounded-xl border border-border/50 bg-surface/30 hover:bg-surface/60 hover:border-primary/40 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="data-badge blue">{entity.type}</span>
                            {entity.status === "pending" && (
                              <span className="data-badge !bg-amber-500/10 !text-amber-500 !border-amber-500/30">
                                Pending
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-foreground truncate mb-1 group-hover:text-primary transition-colors">{entity.name}</h4>
                          <p className="text-xs text-muted-foreground truncate mb-3 font-light">{entity.metadata.desc || entity.metadata.reason || entity.metadata.repo}</p>
                          <div className="flex flex-wrap gap-1">
                            {entity.conn.map(c => <span key={c} className="text-[9px] font-mono bg-background px-1.5 py-0.5 rounded border border-border text-muted-foreground">{c}</span>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Context Feed */}
                <div className="space-y-4">
                  <div className="glass-panel p-6 space-y-6">
                    <div className="flex justify-between items-center border-b border-border/50 pb-4">
                      <div className="flex items-center gap-2 eyebrow">
                        <Activity size={14} className="text-accent-cyan" />
                        <span>Live Stream</span>
                      </div>
                      <span className="data-badge flex items-center gap-1 !bg-emerald-500/10 !text-emerald-400 !border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                      </span>
                    </div>

                    <div className="space-y-6 relative pl-4 border-l border-border/50">
                      {[
                        { time: "09:10", source: "GitHub", title: "Commit pushed", desc: "Added Docker configuration with postgres vector embeddings.", glow: "primary" },
                        { time: "09:30", source: "Calendar", title: "Meeting ended", desc: "Discussed product boundaries between Atlas and Metaphor.", glow: "muted" },
                        { time: "10:05", source: "Stripe", title: "Invoice paid", desc: "Received subscription payment for operating sprint.", glow: "emerald" },
                        { time: "11:20", source: "Notion", title: "Page updated", desc: "Updated specification for entity resolution and Context API.", glow: "muted" }
                      ].map((evt, idx) => (
                        <div key={idx} className="relative group">
                          <div className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background ${evt.glow === 'primary' ? 'bg-primary' : evt.glow === 'emerald' ? 'bg-emerald-500' : 'bg-border'}`} />
                          <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground mb-1">
                            <span>{evt.time}</span>
                            <span className="text-foreground/50">{evt.source}</span>
                          </div>
                          <h5 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{evt.title}</h5>
                          <p className="text-xs text-muted-foreground leading-relaxed font-light">{evt.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE VIEW */}
          {activeTab === "timeline" && (
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary eyebrow">
                  <Clock size={12} />
                  <span>Timeline</span>
                </div>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Progression Log</h2>
                <p className="text-sm text-muted-foreground font-light max-w-2xl">
                  Chronological ledger of structural mappings and strategic shifts.
                </p>
              </div>

              <div className="relative border-l border-border/50 ml-4 pl-8 py-4 space-y-10">
                {[
                  { date: "2026-07-17 08:32", type: "Sync", title: "Ingested Notion Client Interview Notes", desc: "Added client validation context to value pricing model." },
                  { date: "2026-07-16 14:15", type: "Decision", title: "Deploy Postgres + pgvector inside Docker", desc: "Staged constraint for database vectors budget limit." },
                  { date: "2026-07-15 09:10", type: "Code", title: "Git Commit: fix: decouple tokens validation", desc: "Resolved API tokens credentials bypass." }
                ].map((evt) => (
                  <div key={evt.title} className="relative group">
                    <div className="absolute left-[-37px] top-1 h-3 w-3 rounded-full border-2 border-background bg-accent-cyan shadow-[0_0_10px_rgba(25,152,232,0.5)]" />
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-mono text-muted-foreground">{evt.date}</span>
                      <span className="data-badge">{evt.type}</span>
                    </div>
                    <div className="glass-panel p-5 group-hover:border-accent-cyan/30">
                      <h4 className="text-base font-semibold text-foreground mb-2 group-hover:text-accent-cyan transition-colors">{evt.title}</h4>
                      <p className="text-sm text-muted-foreground font-light leading-relaxed">{evt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OTHER TABS */}
          {["notifications", "reports", "datasources", "publicpage", "settings"].includes(activeTab) && (
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up text-center pt-20">
               <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto shadow-2xl">
                 <Network className="w-8 h-8 text-primary opacity-50" />
               </div>
               <h2 className="text-2xl font-bold">This module is syncing</h2>
               <p className="text-muted-foreground font-light">The Metaphor context engine is currently indexing dependencies for the {activeTab} view. Please check back shortly.</p>
               <button onClick={() => setActiveTab("maps")} className="mt-4 px-6 py-2 rounded-full border border-border hover:bg-surface transition-colors text-sm font-semibold text-foreground cursor-pointer">
                 Return to Ontology
               </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
