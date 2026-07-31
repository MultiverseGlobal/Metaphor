"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchFromMetaphor } from "../api";
import { Command, Network, MousePointer2 } from "lucide-react";

export default function SpatialHUDDashboard() {
  const router = useRouter();
  
  const [snapshot, setSnapshot] = useState<any>(null);
  const [inboxData, setInboxData] = useState<any>({ pending_nodes: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute('data-theme', 'obsidian');
      loadAllData();
    }
  }, [router]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        const snap = {
          mission: "Develop the Metaphor universal context operating system to align all connected AI agents.",
          active_projects: [
            { id: "p1", name: "Metaphor Core", type: "Project", confidence: 0.95 },
            { id: "p2", name: "Atlas Portal", type: "Project", confidence: 0.82 },
            { id: "p3", name: "Knowledge Ingestion", type: "System", confidence: 0.77 }
          ],
          confidence: 0.88
        };
        setSnapshot(snap);
        setInboxData({
          pending_nodes: [
            { id: "pn1", name: "Increase Atlas pricing to $500", type: "Decision" },
            { id: "pn2", name: "Deploy Postgres + pgvector", type: "Architecture" }
          ]
        });
        setSelectedNode({ name: "System Core", type: "Root", desc: snap.mission, confidence: snap.confidence });
        setLoading(false);
      }, 500);
    } catch (e) {
      console.error("Error loading dashboard data:", e);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-t-2 border-primary animate-spin mb-4 shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Booting Spatial OS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans selection:bg-primary selection:text-white">
      
      {/* ── Spatial Canvas Background ── */}
      {/* Ambient glow from Obsidian */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
      {/* Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:30px_30px] opacity-30 cursor-grab active:cursor-grabbing z-0" />

      {/* ── Main Graph Canvas (Interactive) ── */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative group animate-fade-in-up">
          {/* Central Root Node */}
          <div 
            onClick={() => setSelectedNode({ name: "System Core", type: "Root", desc: snapshot?.mission, confidence: snapshot?.confidence })}
            className={`w-36 h-36 rounded-full bg-surface/80 backdrop-blur-2xl border ${selectedNode?.name === "System Core" ? "border-primary shadow-[0_0_30px_rgba(6,182,212,0.3)] scale-105" : "border-border shadow-panel"} flex items-center justify-center relative transition-all cursor-pointer z-20`}
          >
            <span className="font-bold text-xl text-foreground text-center leading-tight">Metaphor<br/>Core</span>
          </div>
          
          {/* Orbital Nodes */}
          {snapshot?.active_projects?.map((p: any, i: number) => {
            const angle = (i * Math.PI * 2) / snapshot.active_projects.length - (Math.PI / 2);
            const radius = 180;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isSelected = selectedNode?.name === p.name;
            
            return (
              <div 
                key={p.id} 
                onClick={() => setSelectedNode({ name: p.name, type: p.type, desc: `Continuously indexed ${p.type.toLowerCase()} across all integrated data sources.`, confidence: p.confidence })}
                className={`absolute top-1/2 left-1/2 w-28 h-28 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all cursor-pointer hover:scale-110 z-10
                  ${isSelected ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(6,182,212,0.4)] z-30" : "bg-background/80 border-border/80 shadow-hard"}`}
                style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
              >
                <span className="text-sm font-semibold text-center px-3">{p.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Foreground HUD: Command Palette ── */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-2xl z-40 animate-fade-in-down">
        <div className="panel p-2 bg-surface/80 backdrop-blur-3xl border-border/60 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl">
          <div className="flex items-center gap-4 p-3">
            <Command className="w-6 h-6 text-primary shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query Metaphor OS..." 
              className="flex-1 bg-transparent border-none text-xl outline-none placeholder:text-muted-foreground font-semibold text-foreground"
            />
            <div className="px-3 py-1.5 bg-background rounded-lg text-xs font-mono border border-border/50 text-muted-foreground tracking-widest shadow-inner">
              ⌘K
            </div>
          </div>
          
          {/* Render search results if there is a query */}
          {searchQuery && (
            <div className="p-4 border-t border-border/50">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">Context Matches</p>
              <div className="space-y-2">
                 <div className="p-3 bg-background/50 rounded-lg border border-border/50 hover:bg-surface cursor-pointer transition-colors flex items-center gap-3">
                    <Network className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Searching for "{searchQuery}"...</span>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Foreground HUD: Inbox Signals (Bottom Left) ── */}
      <div className="absolute bottom-8 left-8 w-80 z-40 animate-fade-in-up">
        <div className="panel p-5 bg-surface/70 backdrop-blur-2xl rounded-2xl shadow-panel">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground mb-4">Inbox Signals</h3>
          <div className="space-y-3">
            {inboxData?.pending_nodes?.map((n: any) => (
              <div key={n.id} className="p-3 bg-background/60 rounded-xl border border-border/50 hover:border-accent-red/50 transition-colors cursor-pointer group">
                <p className="text-sm font-semibold mb-2 group-hover:text-accent-red transition-colors">{n.name}</p>
                <span className="text-[9px] font-mono uppercase tracking-widest bg-accent-red/10 text-accent-red px-2 py-1 rounded-md border border-accent-red/20">Action Required</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Foreground HUD: Inspector Panel (Right) ── */}
      <div className="absolute top-1/2 -translate-y-1/2 right-8 w-80 z-40 animate-fade-in-left">
        <div className="panel p-6 bg-surface/70 backdrop-blur-2xl rounded-2xl shadow-panel border-border/60">
          
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-serif font-bold text-foreground">{selectedNode?.name}</h3>
            <span className="tag blue px-2 py-1 bg-primary/10 border-primary/20">{selectedNode?.type}</span>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">{selectedNode?.desc}</p>
          
          <div className="space-y-4">
            <div className="p-4 bg-background/60 rounded-xl border border-border/50">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block mb-2">Confidence Score</span>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold font-mono text-primary leading-none">
                  {selectedNode?.confidence ? (selectedNode.confidence * 100).toFixed(0) : 0}%
                </span>
                <span className="text-xs text-muted-foreground mb-1">/ 100%</span>
              </div>
            </div>
            
            <button className="w-full py-3 bg-surface hover:bg-primary/10 border border-border/50 hover:border-primary/50 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
               <MousePointer2 size={16} className="text-primary" />
               Drill Down
            </button>
          </div>
          
        </div>
      </div>

    </div>
  );
}
