import React from "react";
import { MousePointer2, Settings2 } from "lucide-react";

interface Props {
  snapshot: any;
  inboxData: any;
  theme: string;
  onThemeChange: (t: string) => void;
}

export default function SpatialCanvasLayout({ snapshot, inboxData, theme, onThemeChange }: Props) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      
      {/* ── Infinite Canvas Background (Dot Grid) ── */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px] opacity-20 cursor-grab active:cursor-grabbing" />
      
      {/* ── Main Graph Canvas ── */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Central Core Node */}
        <div className="relative group cursor-pointer animate-fade-in-up">
          <div className="w-32 h-32 rounded-full bg-surface/80 backdrop-blur-xl border border-border shadow-panel flex items-center justify-center z-10 relative hover:scale-105 transition-transform">
            <span className="font-bold text-lg text-foreground">Metaphor Core</span>
          </div>
          
          {/* Orbital Nodes */}
          {snapshot?.active_projects?.map((p: any, i: number) => {
            const angle = (i * Math.PI * 2) / snapshot.active_projects.length;
            const radius = 150;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <div 
                key={p.id} 
                className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-background/90 backdrop-blur-md border border-border/50 shadow-hard flex items-center justify-center hover:-translate-y-2 transition-all cursor-pointer"
                style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
              >
                <span className="text-xs font-semibold text-center px-2">{p.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Spatial Floating Inspector Panel ── */}
      <div className="absolute top-8 right-8 w-80 panel p-6 bg-surface/60 backdrop-blur-2xl z-20 shadow-panel">
        <h3 className="text-xl font-serif font-bold mb-4">Inspector</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{snapshot?.mission}</p>
        
        <div className="space-y-4">
          <div className="p-3 bg-background/50 rounded-[calc(var(--radius)-4px)] border border-border/50">
            <span className="text-xs font-mono text-muted-foreground uppercase block mb-1">Confidence</span>
            <span className="text-2xl font-bold font-mono text-primary">{snapshot?.confidence * 100}%</span>
          </div>
        </div>
      </div>

      {/* ── Floating Toolbar ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 panel px-6 py-3 bg-surface/80 backdrop-blur-2xl flex items-center gap-6 z-20 rounded-full">
        <button className="p-2 text-foreground hover:bg-background rounded-full transition-colors"><MousePointer2 size={20} /></button>
        <div className="w-[1px] h-6 bg-border/50" />
        
        {/* Theme Switcher inline in toolbar */}
        <div className="flex gap-2">
          {["minimalist", "editorial", "scifi", "spatial", "obsidian"].map((t) => (
            <button 
              key={t}
              onClick={() => onThemeChange(t)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${theme === t ? "border-primary bg-primary/20 scale-110" : "border-border hover:border-foreground bg-transparent"}`}
              title={t}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
