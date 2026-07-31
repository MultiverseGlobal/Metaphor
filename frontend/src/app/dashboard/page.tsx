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
  Sparkles,
  Loader2, 
  Check, 
  X, 
  Plus, 
  Sun, 
  BookOpen, 
  Moon, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  FileText,
  Plug,
  CircleDot,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  LogOut,
  ChevronLeft,
  ShieldCheck,
  Activity,
  Layers
} from "lucide-react";
import { fetchFromMetaphor } from "../api";

export default function Dashboard() {
  const router = useRouter();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<"maps" | "timeline" | "notifications" | "reports" | "datasources" | "publicpage" | "settings">("maps");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
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

  // Theme Sync on Mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("metaphor_logged_in") === "true";
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      const storedTheme = (localStorage.getItem("atlas.theme") as any) || "dark";
      setTheme(storedTheme);

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

  const cycleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("atlas.theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex relative overflow-hidden font-sans transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside className={`border-r border-sidebar-border bg-sidebar-background flex flex-col relative z-20 shrink-0 transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}>
        
        {/* Header Branding */}
        <div className={`p-5 flex items-center border-b border-sidebar-border ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold tracking-tight text-sm shadow-md shadow-primary/20 shrink-0">
            M
          </div>
          {!sidebarCollapsed && (
            <div className="text-left">
              <h1 className="text-sm font-bold font-serif tracking-tight text-foreground">Metaphor</h1>
              <p className="text-[9px] text-muted-foreground font-mono tracking-widest uppercase">CONTEXT OS</p>
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
                className={`w-full flex items-center rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  sidebarCollapsed ? "justify-center p-3" : "px-3.5 py-2.5 gap-3"
                } ${
                  isActive 
                    ? "bg-surface-2 text-foreground border-l-2 border-primary shadow-sm font-semibold" 
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-2/50"
                }`}
              >
                <IconComp size={16} className={isActive ? "text-primary" : "text-muted-foreground"} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          
          {/* Collapse sidebar button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full text-left flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ChevronLeft size={16} className={`transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>

          {/* Cycle Theme button */}
          <button
            onClick={cycleTheme}
            className="w-full text-left flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {theme === "dark" ? <Moon size={15} className="text-primary shrink-0" /> : <Sun size={15} className="text-amber-500 shrink-0" />}
            {!sidebarCollapsed && <span className="capitalize font-mono text-[10px]">Theme: {theme}</span>}
          </button>

          {/* Profile Card */}
          <div className={`pt-2 border-t border-sidebar-border flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
            {!sidebarCollapsed && (
              <div className="text-left pl-2">
                <p className="text-xs font-bold text-foreground">Benjamin</p>
                <p className="text-[10px] text-muted-foreground font-mono">@benjamin</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-surface-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
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
        <header className="border-b border-border bg-card/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Connected Sources:</span>
            <div className="flex items-center gap-2">
              {[
                { name: "GitHub", active: true },
                { name: "Notion", active: true },
                { name: "Calendar", active: true },
                { name: "Stripe", active: true },
                { name: "Gmail", active: true }
              ].map((src) => (
                <div key={src.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-surface text-[10px] font-mono font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{src.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
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
              className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs flex items-center gap-1.5 font-semibold hover:bg-primary/90 shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
              <span>{isSyncing ? "Syncing..." : "Sync Workspace"}</span>
            </button>
          </div>
        </header>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={36} className="animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-mono">Loading Metaphor Context OS...</p>
            </div>
          </div>
        )}

        <div className="flex-1 p-6">
          
          {/* TAB 1: ONTOLOGY CONTROL VIEW */}
          {activeTab === "maps" && (
            <div className="space-y-6 text-left">
              
              {/* Headline Title & Awareness Summary */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-mono text-[10px] tracking-widest uppercase font-bold">
                    <CircleDot size={12} />
                    <span>Palantir Foundry Ontology Engine</span>
                  </div>
                  <h2 className="text-2xl font-serif font-semibold text-foreground leading-tight">Living Context Graph</h2>
                  <p className="text-xs text-muted-foreground">Continuous object-relational model linking raw exhaust from connected tools into clear operational entities.</p>
                </div>
              </div>

              {/* Grid: Left Ontology Explorer + Right Live Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Ontology & Objects Panel (2 Cols) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="metaphor-glass bg-card/60 border-border rounded-xl p-5 space-y-4">
                    
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">Active Entities (Ontology)</span>
                      <span className="text-[10px] font-mono text-muted-foreground">14 Entities Indexed</span>
                    </div>

                    {/* Entity Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: "o1", name: "Metaphor Core OS", type: "Project", status: "approved", metadata: { desc: "Context OS Backend Service" }, conn: ["GitHub", "Docker"] },
                        { id: "o2", name: "Atlas Strategy Portal", type: "Project", status: "approved", metadata: { desc: "Visual Strategy Interface" }, conn: ["Next.js", "XYFlow"] },
                        { id: "o3", name: "William Agent", type: "Project", status: "approved", metadata: { desc: "Daily Scheduling Agent" }, conn: ["Calendar", "API"] },
                        { id: "o4", name: "Benjamin", type: "Person", status: "approved", metadata: { role: "Founder / Engineer" }, conn: ["GitHub", "Gmail"] },
                        { id: "o5", name: "Deploy Postgres + pgvector inside Docker", type: "Decision", status: "approved", metadata: { reason: "Enable vector similarity" }, conn: ["Postgres"] },
                        { id: "o6", name: "Atlas & Metaphor Alignment Sync", type: "Meeting", status: "approved", metadata: { host: "Benjamin", date: "2026-07-21" }, conn: ["Calendar"] },
                        { id: "o7", name: "feat: add pgvector table", type: "Commit", status: "approved", metadata: { repo: "pseudonyms/metaphor", sha: "123456" }, conn: ["GitHub"] },
                        { id: "o8", name: "Increase Atlas pricing to $500", type: "Decision", status: "pending", metadata: { reason: "Reflect enterprise context layer" }, conn: ["Stripe"] }
                      ].map((entity) => (
                        <div 
                          key={entity.id}
                          className="metaphor-glass border-border hover:border-primary/40 bg-surface/60 rounded-xl p-3.5 space-y-2 cursor-pointer relative overflow-hidden transition-all hover:scale-[1.01]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                              {entity.type}
                            </span>
                            {entity.status === "pending" && (
                              <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                                Pending Approval
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-semibold text-foreground truncate">{entity.name}</h4>
                          <p className="text-[10px] text-muted-foreground truncate">{entity.metadata.desc || entity.metadata.reason || entity.metadata.repo}</p>
                          
                          <div className="flex items-center gap-1.5 pt-1 text-[9px] font-mono text-muted-foreground">
                            <span className="font-bold">Sources:</span>
                            {entity.conn.map(c => <span key={c} className="underline text-foreground/80">{c}</span>)}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

                {/* Right Column: Live Context Feed (Digital Exhaust Stream) */}
                <div className="space-y-4">
                  <div className="metaphor-glass bg-card/60 border-border rounded-xl p-5 space-y-4">
                    
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-foreground">
                        <Clock size={14} className="text-primary" />
                        <span>Live Context Feed</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                      </span>
                    </div>

                    <div className="space-y-3 relative pl-4 border-l border-border">
                      {[
                        { time: "09:10", source: "GitHub", title: "Commit pushed: feat: add pgvector table", desc: "Added Docker configuration with postgres vector embeddings." },
                        { time: "09:30", source: "Calendar", title: "Meeting ended: Atlas & Metaphor Sync", desc: "Discussed product boundaries between Atlas and Metaphor." },
                        { time: "10:05", source: "Stripe", title: "Invoice paid: $500 Founder Sprint", desc: "Received subscription payment for operating sprint." },
                        { time: "11:20", source: "Notion", title: "Page updated: Metaphor OS Architecture", desc: "Updated specification for entity resolution and Context API." }
                      ].map((evt, idx) => (
                        <div key={idx} className="relative space-y-1">
                          <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-primary bg-card" />
                          <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                            <span>{evt.time} · {evt.source}</span>
                          </div>
                          <h5 className="text-xs font-semibold text-foreground">{evt.title}</h5>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{evt.desc}</p>
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
            <div className="max-w-2xl mx-auto space-y-6 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-mono text-[10px] tracking-widest uppercase font-bold">
                  <Clock size={12} />
                  <span>Timeline</span>
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">Progression Log</h2>
                <p className="text-xs text-muted-foreground">Chronological ledger of structural mappings and strategic shifts.</p>
              </div>

              <div className="relative border-l border-border ml-4 pl-6 py-4 space-y-8">
                {[
                  { date: "2026-07-17 08:32", type: "Sync", title: "Ingested Notion Client Interview Notes", desc: "Added client validation context to value pricing model." },
                  { date: "2026-07-16 14:15", type: "Decision", title: "Deploy Postgres + pgvector inside Docker Container", desc: "Staged constraint for database vectors budget limit." },
                  { date: "2026-07-15 09:10", type: "Sync", title: "Git Commit: fix: decouple tokens validation", desc: "Resolved API tokens credentials bypass." }
                ].map((evt) => (
                  <div key={evt.title} className="relative space-y-1.5">
                    <div className="absolute left-[-31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-muted-foreground">{evt.date}</span>
                      <span className="metaphor-badge">{evt.type}</span>
                    </div>
                    <div className="metaphor-glass bg-card/60 border-border rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-foreground mb-1">{evt.title}</h4>
                      <p className="text-xs text-muted-foreground">{evt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS VIEW */}
          {activeTab === "notifications" && (
            <div className="max-w-2xl mx-auto space-y-6 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-mono text-[10px] tracking-widest uppercase font-bold">
                  <Inbox size={12} />
                  <span>Notifications</span>
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">Inbox Signals</h2>
                <p className="text-xs text-muted-foreground font-sans">Review alerts and staging confirmations generated by connected credentials.</p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Goal confidence established", content: "Atlas successfully formed a high confidence vector relationship for 'SaaS beta completion'.", time: "10 mins ago", type: "info" },
                  { title: "GitHub connection paused", content: "No new activity has been registered on the 'Pseudonyms' branch in the last 14 days.", time: "2 hours ago", type: "warning" },
                  { title: "Notion indexing complete", content: "Parsed 12 active document nodes mapping business rules and budget restrictions.", time: "1 day ago", type: "success" }
                ].map((note) => (
                  <div key={note.title} className="metaphor-glass bg-card/60 border-border rounded-xl flex items-start gap-4 p-5">
                    <div className="mt-0.5">
                      {note.type === "warning" ? (
                        <AlertTriangle className="text-destructive shrink-0" size={16} />
                      ) : (
                        <CheckCircle2 className="text-emerald-400 shrink-0" size={16} />
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-foreground">{note.title}</h4>
                        <span className="text-[10px] font-mono text-muted-foreground">{note.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{note.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REPORTS VIEW */}
          {activeTab === "reports" && (
            <div className="max-w-3xl mx-auto space-y-6 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-mono text-[10px] tracking-widest uppercase font-bold">
                  <FileText size={12} />
                  <span>Reports</span>
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">Strategy Audits</h2>
                <p className="text-xs text-muted-foreground">Analytical breakdowns of active maps, decision vectors, and block history.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="metaphor-glass bg-card/60 border-border rounded-xl p-6 space-y-4">
                  <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider block">Operational Velocity</span>
                  <div className="h-32 flex items-end justify-between gap-2 border-b border-border pb-2">
                    <div className="w-full bg-surface-2 h-[20%] rounded-sm" />
                    <div className="w-full bg-surface-2 h-[35%] rounded-sm" />
                    <div className="w-full bg-surface-2 h-[60%] rounded-sm" />
                    <div className="w-full bg-primary h-[90%] rounded-sm" />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">Weekly velocity</span>
                    <span className="font-mono text-primary font-bold">+45%</span>
                  </div>
                </div>

                <div className="metaphor-glass bg-card/60 border-border rounded-xl p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider block mb-2">Audit Summary</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your business constraints show 88% alignment. Outbound Sales operations show low constraint levels, while Product Development remains blocked due to Github commit pauses.
                    </p>
                  </div>
                  <button className="w-full text-xs font-semibold py-2 px-4 rounded-lg bg-surface-2 border border-border text-foreground hover:bg-surface-2/80 transition-all cursor-pointer">
                    Download Audit PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA SOURCES VIEW */}
          {activeTab === "datasources" && (
            <div className="max-w-2xl mx-auto space-y-6 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-mono text-[10px] tracking-widest uppercase font-bold">
                  <Plug size={12} />
                  <span>Data sources</span>
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">Active Connections</h2>
                <p className="text-xs text-muted-foreground">Manage external API integrations mapping activity logs to your strategic timelines.</p>
              </div>

              <div className="metaphor-glass bg-card/60 border border-border rounded-xl p-6 space-y-4">
                {[
                  { name: "GitHub Repositories", type: "code", active: !!githubToken },
                  { name: "Notion Workspaces", type: "documents", active: !!notionToken },
                  { name: "Slack Conversations", type: "chat", active: true },
                  { name: "Stripe Subscriptions", type: "billing", active: true }
                ].map((conn) => (
                  <div key={conn.name} className="flex justify-between items-center py-3 border-b border-border last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${conn.active ? "bg-emerald-500 animate-pulse" : "bg-muted"}`} />
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{conn.name}</h4>
                        <p className="text-[9px] font-mono text-muted-foreground uppercase">{conn.type}</p>
                      </div>
                    </div>

                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                      conn.active 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-semibold" 
                        : "bg-surface-2 border-border text-muted-foreground"
                    }`}>
                      {conn.active ? "Active" : "Offline"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PUBLIC PAGE VIEW */}
          {activeTab === "publicpage" && (
            <div className="max-w-2xl mx-auto space-y-6 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-mono text-[10px] tracking-widest uppercase font-bold">
                  <Globe size={12} />
                  <span>Public page</span>
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">Public Map Shares</h2>
                <p className="text-xs text-muted-foreground">Share interactive read-only versions of your roadmap progress with external advisors.</p>
              </div>

              <div className="metaphor-glass bg-card/60 border border-border rounded-xl p-8 text-center space-y-4">
                <Globe size={32} className="mx-auto text-primary" />
                <h4 className="font-semibold text-sm text-foreground">Public sharing is currently offline</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Enable public sharing to generate custom URLs showing your goal milestones progression to stakeholders.
                </p>
                <button className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer">
                  Enable Public Mappings
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS VIEW */}
          {activeTab === "settings" && (
            <div className="max-w-xl mx-auto space-y-6 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-mono text-[10px] tracking-widest uppercase font-bold">
                  <Settings size={12} />
                  <span>Settings</span>
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">API Credentials</h2>
                <p className="text-xs text-muted-foreground">Update secret integrations keys and context engine credentials.</p>
              </div>

              <div className="metaphor-glass bg-card/60 border border-border rounded-xl p-6 space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground font-mono uppercase block">Metaphor Engine Secret Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground font-mono uppercase block">Notion API Secret</label>
                  <input
                    type="password"
                    placeholder="secret_..."
                    value={notionToken}
                    onChange={(e) => setNotionToken(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground font-mono uppercase block">GitHub PAT</label>
                  <input
                    type="password"
                    placeholder="ghp_..."
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground font-mono uppercase block">ChatGPT Platform Key</label>
                  <input
                    type="password"
                    placeholder="sk-proj-..."
                    value={chatgptToken}
                    onChange={(e) => setChatgptToken(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground font-mono uppercase block">Claude Platform Key</label>
                  <input
                    type="password"
                    placeholder="sk-ant-..."
                    value={claudeToken}
                    onChange={(e) => setClaudeToken(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-surface border border-border text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    onClick={handleSignOut}
                    className="text-xs font-bold text-destructive font-mono uppercase hover:opacity-80 cursor-pointer"
                  >
                    Disconnect Session
                  </button>

                  <button
                    onClick={() => {
                      localStorage.setItem("metaphor_api_key", apiKey);
                      localStorage.setItem("notion_token", notionToken);
                      localStorage.setItem("github_token", githubToken);
                      localStorage.setItem("chatgpt_token", chatgptToken);
                      localStorage.setItem("claude_token", claudeToken);
                      alert("API config saved locally.");
                    }}
                    className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
                  >
                    Save Config
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
