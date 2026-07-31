"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchFromMetaphor } from "../api";
import { Command, Network, MousePointer2, AlertCircle } from "lucide-react";

export default function SpatialHUDDashboard() {
  const router = useRouter();
  
  const [snapshot, setSnapshot] = useState<any>(null);
  const [inboxData, setInboxData] = useState<any>({ pending_nodes: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isFocused, setIsFocused] = useState(false);

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
            { id: "p3", name: "Knowledge Ingestion", type: "System", confidence: 0.77 },
            { id: "p4", name: "Neural Link", type: "Integration", confidence: 0.64 }
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

  const radius = 220; // Increased radius to spread nodes out more
  const numNodes = snapshot?.active_projects?.length || 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans selection:bg-primary selection:text-white">
      
      {/* ── Spatial Canvas Background ── */}
      {/* Ambient glow from Obsidian */}
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
      {/* Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:40px_40px] opacity-20 cursor-grab active:cursor-grabbing z-0" />

      {/* ── Main Graph Canvas (Interactive) ── */}
      {/* We shifted the canvas down to top-[55%] so the top nodes don't collide with the command palette */}
      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[600px] h-[600px]">
        
        {/* SVG Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {snapshot?.active_projects?.map((p: any, i: number) => {
            // Offset the starting angle by 45 degrees (Math.PI/4) so no node is perfectly at 12 o'clock
            const angle = (i * Math.PI * 2) / numNodes - (Math.PI / 4);
            const x = 300 + Math.cos(angle) * radius; // 300 is center of 600px container
            const y = 300 + Math.sin(angle) * radius;
            return (
              <line 
                key={`line-${p.id}`}
                x1="300" y1="300" 
                x2={x} y2={y} 
                stroke="url(#line-grad)" 
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
            );
          })}
        </svg>

        {/* Nodes Container */}
        <div className="absolute inset-0">
          {/* Central Root Node */}
          <div 
            onClick={() => setSelectedNode({ name: "System Core", type: "Root", desc: snapshot?.mission, confidence: snapshot?.confidence })}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full flex items-center justify-center relative transition-all duration-500 cursor-pointer z-20 group
              ${selectedNode?.name === "System Core" ? "bg-surface/90 border-primary shadow-[0_0_40px_rgba(6,182,212,0.4)] scale-105" : "bg-surface/60 backdrop-blur-3xl border-border shadow-[0_0_20px_rgba(0,0,0,0.5)]"} 
              border-[1px] hover:border-primary/60`}
          >
            {/* Pulsing inner ring */}
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-[ping_3s_ease-in-out_infinite]" />
            <span className="font-bold text-2xl text-foreground text-center leading-tight tracking-tight z-10 drop-shadow-md">
              Metaphor<br/>Core
            </span>
          </div>
          
          {/* Orbital Nodes */}
          {snapshot?.active_projects?.map((p: any, i: number) => {
            // Offset the starting angle by 45 degrees
            const angle = (i * Math.PI * 2) / numNodes - (Math.PI / 4);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isSelected = selectedNode?.name === p.name;
            
            return (
              <div 
                key={p.id} 
                onClick={() => setSelectedNode({ name: p.name, type: p.type, desc: `Continuously indexed ${p.type.toLowerCase()} across all integrated data sources.`, confidence: p.confidence })}
                className={`absolute top-1/2 left-1/2 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 group z-10 border-[1px]
                  ${isSelected ? "bg-primary/20 backdrop-blur-2xl border-primary shadow-[0_0_30px_rgba(6,182,212,0.4)] z-30" : "bg-surface/40 backdrop-blur-xl border-white/5 hover:border-white/20 shadow-xl"}`}
                style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-sm font-semibold text-center px-4 leading-tight text-muted-foreground group-hover:text-foreground transition-colors">{p.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Foreground HUD: Command Palette ── */}
      {/* Sleeker, floating higher, with focus glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-3xl z-40 animate-fade-in-down">
        <div className={`transition-all duration-300 rounded-2xl ${isFocused ? "shadow-[0_0_40px_rgba(6,182,212,0.2)]" : "shadow-[0_15px_50px_rgba(0,0,0,0.6)]"}`}>
          <div className={`p-1 bg-surface/80 backdrop-blur-3xl rounded-2xl border transition-colors duration-300 ${isFocused ? "border-primary/50" : "border-border/60"}`}>
            <div className="flex items-center gap-4 px-5 py-4">
              <Command className={`w-5 h-5 transition-colors ${isFocused ? "text-primary" : "text-muted-foreground"}`} />
              <input 
                type="text" 
                value={searchQuery}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query Metaphor OS..." 
                className="flex-1 bg-transparent border-none text-lg outline-none placeholder:text-muted-foreground/60 font-medium text-foreground tracking-wide"
              />
              <div className="px-2.5 py-1 bg-background/80 rounded border border-border/50 text-[10px] font-mono text-muted-foreground tracking-widest shadow-inner">
                ⌘K
              </div>
            </div>
            
            {/* Render search results if there is a query */}
            {searchQuery && (
              <div className="px-3 pb-3 pt-1 border-t border-border/50">
                <p className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-widest px-3 py-2">Context Matches</p>
                <div className="space-y-1">
                   <div className="px-4 py-3 bg-background/50 rounded-xl border border-transparent hover:border-border hover:bg-surface cursor-pointer transition-all flex items-center gap-3">
                      <Network className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">Searching for "{searchQuery}"...</span>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Foreground HUD: Inbox Signals (Bottom Left) ── */}
      <div className="absolute bottom-10 left-10 w-[340px] z-40 animate-fade-in-up">
        <div className="p-6 bg-surface/60 backdrop-blur-3xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-white/5">
          <div className="flex items-center gap-2 mb-5">
            <AlertCircle className="w-4 h-4 text-accent-red" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">Inbox Signals</h3>
          </div>
          <div className="space-y-3">
            {inboxData?.pending_nodes?.map((n: any) => (
              <div key={n.id} className="p-4 bg-background/40 rounded-xl border border-white/5 hover:border-accent-red/40 hover:bg-accent-red/5 transition-all cursor-pointer group">
                <p className="text-sm font-medium mb-3 text-foreground/90 group-hover:text-white transition-colors leading-tight">{n.name}</p>
                <span className="text-[9px] font-mono uppercase tracking-widest bg-accent-red/10 text-accent-red px-2 py-1 rounded border border-accent-red/20 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]">Action Required</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Foreground HUD: Inspector Panel (Right) ── */}
      <div className="absolute top-1/2 -translate-y-1/2 right-10 w-[380px] z-40 animate-fade-in-left">
        <div className="p-8 bg-surface/60 backdrop-blur-3xl rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.4)] border border-white/5 relative overflow-hidden">
          
          {/* Subtle top glare */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-semibold text-foreground tracking-tight drop-shadow-sm">{selectedNode?.name}</h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]">
              {selectedNode?.type}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground/90 leading-relaxed mb-8">{selectedNode?.desc}</p>
          
          <div className="space-y-4">
            <div className="p-5 bg-background/40 rounded-2xl border border-white/5">
              <span className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-widest block mb-2">Confidence Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-light font-mono text-primary drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                  {selectedNode?.confidence ? (selectedNode.confidence * 100).toFixed(0) : 0}%
                </span>
                <span className="text-sm text-muted-foreground/60 font-mono">/ 100%</span>
              </div>
            </div>
            
            <button className="w-full py-4 bg-background/50 hover:bg-primary/10 border border-white/5 hover:border-primary/40 text-sm font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-sm">
               <MousePointer2 size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
               <span className="text-muted-foreground group-hover:text-foreground transition-colors tracking-wide">Drill Down</span>
            </button>
          </div>
          
        </div>
      </div>

    </div>
  );
}
