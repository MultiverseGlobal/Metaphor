"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchFromMetaphor } from "../api";
import { 
  Network, 
  Compass, 
  Clock, 
  Inbox, 
  Settings, 
  Activity, 
  Database, 
  RefreshCw,
  LogOut,
  ChevronLeft
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<"maps" | "timeline" | "notifications" | "reports" | "datasources" | "settings">("maps");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState("spatial");
  
  // Loaded Context Data States
  const [snapshot, setSnapshot] = useState<any>(null);
  const [inboxData, setInboxData] = useState<any>({ pending_nodes: [], pending_edges: [], clarifications: [] });
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Credentials config
  const [apiKey, setApiKey] = useState("metaphor_dev_secret_key_123");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiKey(localStorage.getItem("metaphor_api_key") || "metaphor_dev_secret_key_123");
      const savedTheme = localStorage.getItem("metaphor_theme") || "spatial";
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      loadAllData();
    }
  }, [router]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("metaphor_theme", newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

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
    setTimeout(() => {
      setSnapshot({
        mission: "Develop the Metaphor universal context operating system to align all connected AI agents.",
        active_projects: [
          { id: "p1", name: "Metaphor Core", type: "Project" },
          { id: "p2", name: "Atlas Portal", type: "Project" }
        ],
        confidence: 0.88
      });
    }, 500);
  };

  const loadInboxData = async () => {
    setTimeout(() => {
      setInboxData({
        pending_nodes: [
          { id: "pn1", name: "Increase Atlas pricing to $500", type: "Decision" }
        ]
      });
    }, 500);
  };

  const handleSignOut = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex relative font-sans selection:bg-primary selection:text-primary-foreground overflow-hidden">
      
      {/* ── SIDEBAR (Modern layout, adapts to theme CSS) ── */}
      <aside className={`flex flex-col bg-surface/50 border-r border-border/50 relative z-20 transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}>
        
        {/* Header */}
        <div className={`p-5 flex items-center border-b border-border/50 ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
          <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center shrink-0">
            <Network className="w-4 h-4" />
          </div>
          {!sidebarCollapsed && (
            <div className="text-left overflow-hidden">
              <h1 className="text-sm font-bold tracking-tight">Metaphor OS</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mt-0.5">Workspace</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {[
            { id: "maps", label: "Ontology Control", icon: Compass },
            { id: "timeline", label: "Context Feed", icon: Clock },
            { id: "notifications", label: "Inbox Signals", icon: Inbox },
            { id: "reports", label: "Context Health", icon: Activity },
            { id: "datasources", label: "Connectors", icon: Database },
            { id: "settings", label: "Settings", icon: Settings }
          ].map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center p-3 gap-3 rounded-[calc(var(--radius)-4px)] transition-all ${sidebarCollapsed ? "justify-center" : ""} ${isActive ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-background"}`}
              >
                <IconComp size={16} className={isActive ? "" : "text-muted-foreground"} />
                {!sidebarCollapsed && <span className="text-sm tracking-wide">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 space-y-2 bg-surface/50">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full text-left flex items-center gap-3 p-2 rounded-[calc(var(--radius)-4px)] hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={16} className={`transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
            {!sidebarCollapsed && <span className="text-xs font-semibold">Collapse</span>}
          </button>
          
          <div className={`pt-2 border-t border-border/50 flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
            {!sidebarCollapsed && (
              <div className="text-left pl-2">
                <p className="text-xs font-bold text-foreground">SUDO</p>
                <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mt-0.5">Admin</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="p-2 text-muted-foreground hover:text-accent-red transition-colors"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto">
        
        {/* Top Header */}
        <header className="px-8 py-4 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Active Streams:</span>
            <div className="flex gap-2">
              {["GitHub", "Notion", "Stripe"].map((src) => (
                <div key={src} className="flex items-center gap-1.5 px-2.5 py-1 rounded-[calc(var(--radius)-4px)] border border-border/50 bg-surface/30 text-[10px] font-mono font-semibold text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_8px_var(--accent-blue)]" />
                  <span>{src}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
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
              className="btn-tactile text-xs py-1.5 px-4"
            >
              <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? "Syncing..." : "Sync Workspace"}
            </button>
          </div>
        </header>

        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <RefreshCw size={32} className="animate-spin text-primary mb-4" />
            <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Indexing OS...</span>
          </div>
        )}

        <div className="flex-1 p-8 md:p-12 max-w-7xl mx-auto w-full">
          
          {/* TAB 1: ONTOLOGY CONTROL */}
          {activeTab === "maps" && (
            <div className="animate-fade-in-up space-y-8">
              
              <div className="space-y-2">
                <h2 className="text-4xl font-bold font-serif tracking-tight">Ontology Control</h2>
                <p className="text-sm text-muted-foreground">The living context graph of your digital footprint.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Entities Cards */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-sm font-semibold uppercase tracking-wider">Active Entities</span>
                    <span className="tag filled">14 Indexed</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { type: "Project", name: "Metaphor Core OS", src: "GitHub", status: "VERIFIED" },
                      { type: "Project", name: "Atlas Strategy Portal", src: "Next.js", status: "VERIFIED" },
                      { type: "Person", name: "Benjamin", src: "Gmail", status: "VERIFIED" },
                      { type: "Decision", name: "Deploy Postgres + pgvector", src: "Postgres", status: "VERIFIED" },
                      { type: "Decision", name: "Increase pricing to $500", src: "Stripe", status: "PENDING" }
                    ].map((entity, i) => (
                      <div key={i} className="panel p-5 group cursor-pointer hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <span className="tag blue">{entity.type}</span>
                          {entity.status === "PENDING" ? (
                            <span className="tag red">Pending</span>
                          ) : null}
                        </div>
                        <h4 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{entity.name}</h4>
                        <div className="flex items-center gap-2 mt-4">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest bg-background px-2 py-1 rounded-[calc(var(--radius)-4px)] border border-border/50">Source: {entity.src}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Stream */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-sm font-semibold uppercase tracking-wider">Live Stream</span>
                    <span className="w-2 h-2 bg-accent-blue animate-pulse rounded-full" />
                  </div>

                  <div className="panel p-0 overflow-hidden divide-y divide-border/50">
                    {[
                      { time: "09:10", src: "GitHub", title: "Commit pushed", log: "Added Docker config." },
                      { time: "09:30", src: "Calendar", title: "Meeting ended", log: "Atlas Sync." },
                      { time: "10:05", src: "Stripe", title: "Invoice paid", log: "Operating sprint." },
                      { time: "11:20", src: "Notion", title: "Page updated", log: "Architecture spec." }
                    ].map((evt, i) => (
                      <div key={i} className="p-4 hover:bg-surface/50 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">{evt.time}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{evt.src}</span>
                        </div>
                        <h5 className="text-sm font-semibold mb-1">{evt.title}</h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">{evt.log}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: SETTINGS (Theme Engine) */}
          {activeTab === "settings" && (
            <div className="animate-fade-in-up space-y-8">
              <div className="space-y-2 border-b border-border/50 pb-6">
                <h2 className="text-4xl font-bold font-serif tracking-tight">Configuration</h2>
                <p className="text-sm text-muted-foreground">Manage your Metaphor OS environment and visual identity.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-6">Visual Identity (Theme Engine)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { id: "minimalist", name: "Minimalist", desc: "Dieter Rams / Brutalist physical tool." },
                    { id: "editorial", name: "Editorial", desc: "Kinfolk / High-end print publication." },
                    { id: "scifi", name: "Sci-Fi", desc: "Blade Runner / Terminal interface." },
                    { id: "spatial", name: "Spatial", desc: "VisionOS / High contrast glass." },
                    { id: "obsidian", name: "Obsidian", desc: "Deep navy, frosted glass, cyan accents." }
                  ].map((t) => (
                    <div 
                      key={t.id} 
                      onClick={() => handleThemeChange(t.id)}
                      className={`panel p-6 cursor-pointer transition-all hover:-translate-y-1 ${theme === t.id ? 'border-primary shadow-[0_0_20px_rgba(var(--primary),0.2)] ring-1 ring-primary' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-serif text-2xl font-bold">{t.name}</h4>
                        {theme === t.id && <span className="tag filled">Active</span>}
                      </div>
                      <p className="text-xs font-mono text-muted-foreground">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* OTHER TABS */}
          {["timeline", "notifications", "reports", "datasources"].includes(activeTab) && (
            <div className="animate-fade-in-up flex flex-col items-center justify-center pt-32 text-center max-w-lg mx-auto">
              <div className="panel p-10 flex flex-col items-center">
                 <Network className="w-12 h-12 text-primary opacity-50 mb-6" />
                 <h2 className="text-2xl font-bold font-serif mb-2">Module Syncing</h2>
                 <p className="text-muted-foreground mb-8">
                   The Metaphor engine is currently indexing dependencies for the {activeTab} view.
                 </p>
                 <button onClick={() => setActiveTab("maps")} className="btn-tactile primary">
                   Return to Ontology
                 </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
