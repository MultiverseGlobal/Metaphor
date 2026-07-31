"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchFromMetaphor } from "../api";

export default function Dashboard() {
  const router = useRouter();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<"maps" | "timeline" | "notifications" | "reports" | "datasources" | "settings">("maps");
  
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
    // Simulated fetch
    setTimeout(() => {
      setSnapshot({
        mission: "Develop the Metaphor universal context operating system to align all connected AI agents and build a single source of truth.",
        active_projects: [
          { id: "p1", name: "Metaphor Core", type: "Project" },
          { id: "p2", name: "Atlas Portal", type: "Project" }
        ],
        confidence: 0.88
      });
    }, 500);
  };

  const loadInboxData = async () => {
    // Simulated fetch
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
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-accent-blue selection:text-white">
      
      {/* ── TOP NAV HEADER ── */}
      <header className="grid-section flex items-center justify-between px-6 py-3 bg-card sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="font-serif text-3xl font-bold tracking-tighter leading-none">M</div>
          <span className="mono text-xs uppercase tracking-widest hidden sm:block font-bold">M—OS // Session Active</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="mono text-xs hidden md:flex items-center gap-4 border-r-2 border-border pr-6">
            <span className="opacity-50">SYSTEM STATUS:</span>
            <span>[ NOMINAL ]</span>
            <span className="opacity-50">UPTIME:</span>
            <span>[ 99.9% ]</span>
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
            className="btn-tactile text-[10px]"
          >
            {isSyncing ? "[ SYNCING... ]" : "[ SYNC ]"}
          </button>
        </div>
      </header>

      {/* ── MAIN LAYOUT (Sidebar + Content) ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ── SIDEBAR ── */}
        <aside className="w-64 border-r-2 border-border bg-background flex flex-col justify-between shrink-0 overflow-y-auto">
          
          <nav className="flex flex-col">
            <div className="p-4 border-b-2 border-border bg-card">
              <h2 className="mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Directory</h2>
            </div>
            
            {[
              { id: "maps", label: "Ontology Control" },
              { id: "timeline", label: "Progression Log" },
              { id: "notifications", label: "Inbox Signals" },
              { id: "reports", label: "System Audits" },
              { id: "datasources", label: "Data Mounts" },
              { id: "settings", label: "Configuration" }
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`text-left px-6 py-4 border-b-2 border-border mono text-sm font-bold uppercase tracking-wide transition-colors ${
                    isActive ? "bg-foreground text-background" : "hover:bg-surface text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto border-t-2 border-border">
            <div className="p-4 border-b-2 border-border">
              <p className="mono text-xs font-bold">USER: SUDO</p>
              <p className="mono text-[10px] text-muted-foreground mt-1">ROLE: SYSADMIN</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-6 py-4 hover:bg-accent-red hover:text-white transition-colors mono text-xs font-bold uppercase tracking-wider"
            >
              [ Terminate Session ]
            </button>
          </div>
        </aside>

        {/* ── CONTENT AREA ── */}
        <main className="flex-1 bg-surface overflow-y-auto relative p-6 md:p-12">
          
          {loading && (
            <div className="absolute inset-0 bg-background/90 z-50 flex items-center justify-center">
              <div className="panel p-8">
                <span className="mono text-sm font-bold uppercase blink cursor-blink" />
                <span className="mono text-sm font-bold uppercase ml-2">INDEXING KNOWLEDGE GRAPH...</span>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto">
            
            {/* TAB 1: ONTOLOGY CONTROL */}
            {activeTab === "maps" && (
              <div className="animate-fade-in-up">
                
                <header className="mb-12 border-b-4 border-foreground pb-6">
                  <h1 className="font-serif text-5xl font-bold mb-4">Ontology Control</h1>
                  <p className="mono text-sm text-muted-foreground uppercase tracking-wider">
                    Viewing absolute truth state of the Metaphor graph.
                  </p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  
                  {/* Left Column: Entities Table */}
                  <div className="xl:col-span-8 space-y-6">
                    <div className="flex justify-between items-end border-b-2 border-border pb-2">
                      <h2 className="mono text-lg font-bold uppercase">Active Entities</h2>
                      <span className="mono text-xs bg-foreground text-background px-2 py-1 font-bold">COUNT: 14</span>
                    </div>

                    <div className="panel overflow-hidden">
                      <table className="w-full text-left mono text-xs">
                        <thead className="bg-card border-b-2 border-border">
                          <tr>
                            <th className="p-4 font-bold uppercase tracking-widest border-r-2 border-border w-24">Type</th>
                            <th className="p-4 font-bold uppercase tracking-widest border-r-2 border-border">Entity Name</th>
                            <th className="p-4 font-bold uppercase tracking-widest border-r-2 border-border">Source</th>
                            <th className="p-4 font-bold uppercase tracking-widest w-28">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { type: "Project", name: "Metaphor Core OS", src: "GitHub", status: "VERIFIED" },
                            { type: "Project", name: "Atlas Strategy Portal", src: "Next.js", status: "VERIFIED" },
                            { type: "Person", name: "Benjamin", src: "Gmail", status: "VERIFIED" },
                            { type: "Decision", name: "Deploy Postgres + pgvector", src: "Postgres", status: "VERIFIED" },
                            { type: "Meeting", name: "Atlas Alignment Sync", src: "Calendar", status: "VERIFIED" },
                            { type: "Commit", name: "feat: add pgvector table", src: "GitHub", status: "VERIFIED" },
                            { type: "Decision", name: "Increase pricing to $500", src: "Stripe", status: "PENDING" }
                          ].map((entity, i) => (
                            <tr key={i} className="border-b-2 border-border last:border-b-0 hover:bg-background transition-colors cursor-pointer group">
                              <td className="p-4 border-r-2 border-border text-muted-foreground font-bold">{entity.type}</td>
                              <td className="p-4 border-r-2 border-border font-bold text-base group-hover:text-accent-blue">{entity.name}</td>
                              <td className="p-4 border-r-2 border-border">{entity.src}</td>
                              <td className="p-4">
                                {entity.status === "PENDING" ? (
                                  <span className="tag red">[ PENDING ]</span>
                                ) : (
                                  <span className="tag blue">[ OK ]</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Column: Live Stream */}
                  <div className="xl:col-span-4 space-y-6">
                    <div className="flex justify-between items-end border-b-2 border-border pb-2">
                      <h2 className="mono text-lg font-bold uppercase">Live Exhaust</h2>
                      <span className="w-3 h-3 bg-accent-red animate-pulse block border border-border" />
                    </div>

                    <div className="panel bg-background divide-y-2 divide-border">
                      {[
                        { time: "09:10", src: "GitHub", log: "Commit pushed: Added Docker config." },
                        { time: "09:30", src: "Calendar", log: "Meeting ended: Atlas Sync." },
                        { time: "10:05", src: "Stripe", log: "Invoice paid: operating sprint." },
                        { time: "11:20", src: "Notion", log: "Page updated: Architecture spec." }
                      ].map((evt, i) => (
                        <div key={i} className="p-4 space-y-2 hover:bg-surface transition-colors cursor-crosshair">
                          <div className="flex justify-between mono text-[10px] text-muted-foreground font-bold uppercase">
                            <span>{evt.time}</span>
                            <span>{evt.src}</span>
                          </div>
                          <p className="mono text-xs leading-relaxed font-semibold">{evt.log}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: TIMELINE */}
            {activeTab === "timeline" && (
              <div className="animate-fade-in-up">
                <header className="mb-12 border-b-4 border-foreground pb-6">
                  <h1 className="font-serif text-5xl font-bold mb-4">Progression Log</h1>
                  <p className="mono text-sm text-muted-foreground uppercase tracking-wider">
                    Chronological ledger of structural mappings and strategic shifts.
                  </p>
                </header>

                <div className="panel divide-y-2 divide-border max-w-4xl">
                  {[
                    { date: "2026-07-17", time: "08:32", id: "EVT-8921", log: "Ingested Notion Client Interview Notes. Appended to value pricing model." },
                    { date: "2026-07-16", time: "14:15", id: "EVT-8920", log: "Decision formulated: Deploy Postgres + pgvector inside Docker." },
                    { date: "2026-07-15", time: "09:10", id: "EVT-8919", log: "Git Commit parsed: fix: decouple tokens validation." }
                  ].map((evt, i) => (
                    <div key={i} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-background transition-colors cursor-crosshair">
                      <div className="shrink-0 flex md:flex-col gap-4 md:gap-1 items-start md:w-32 border-b-2 md:border-b-0 border-border pb-4 md:pb-0">
                        <span className="mono text-xs font-bold uppercase">{evt.date}</span>
                        <span className="mono text-[10px] text-muted-foreground">{evt.time}</span>
                        <span className="tag mt-1">{evt.id}</span>
                      </div>
                      <div className="flex-1">
                        <p className="mono text-sm font-semibold leading-relaxed">{evt.log}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OTHER TABS */}
            {["notifications", "reports", "datasources", "settings"].includes(activeTab) && (
              <div className="animate-fade-in-up flex flex-col items-center justify-center pt-32 text-center max-w-lg mx-auto">
                <div className="panel p-8 w-full border-t-8 border-t-foreground">
                   <h2 className="mono text-2xl font-bold uppercase mb-4 text-accent-red">System Notice</h2>
                   <p className="font-serif text-lg text-muted-foreground mb-8">
                     The Metaphor context engine is currently indexing dependencies for the "{activeTab}" directory. Operations restricted.
                   </p>
                   <button onClick={() => setActiveTab("maps")} className="btn-tactile w-full">
                     [ Return to Ontology ]
                   </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
