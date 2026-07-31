import React from "react";
import { Network, Search, Command } from "lucide-react";

interface Props {
  snapshot: any;
  inboxData: any;
  theme: string;
  onThemeChange: (t: string) => void;
}

export default function ObsidianHUDLayout({ snapshot, inboxData, theme, onThemeChange }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* ── Ambient HUD Glow ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Massive Command Palette (The Core Interface) ── */}
      <div className="w-full max-w-2xl panel p-2 bg-surface/50 backdrop-blur-2xl border-border/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 animate-fade-in-up">
        <div className="flex items-center gap-4 p-4 border-b border-border/50">
          <Command className="w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Query Metaphor OS..." 
            className="flex-1 bg-transparent border-none text-xl outline-none placeholder:text-muted-foreground font-semibold"
            autoFocus
          />
          <div className="px-2 py-1 bg-background rounded-md text-[10px] font-mono border border-border/50 text-muted-foreground">⌘K</div>
        </div>
        
        <div className="p-4 space-y-4">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Active Context</p>
          <div className="grid grid-cols-2 gap-4">
            {snapshot?.active_projects?.map((p: any) => (
              <div key={p.id} className="p-4 bg-background/50 rounded-lg border border-border/50 hover:bg-surface cursor-pointer transition-colors">
                <Network className="w-4 h-4 text-primary mb-2" />
                <h4 className="font-semibold text-sm">{p.name}</h4>
              </div>
            ))}
          </div>
          
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-4">Inbox Signals</p>
          <div className="space-y-2">
            {inboxData?.pending_nodes?.map((n: any) => (
              <div key={n.id} className="p-3 bg-background/50 rounded-lg border border-border/50 flex justify-between items-center hover:bg-surface cursor-pointer">
                <span className="text-sm">{n.name}</span>
                <span className="tag red text-[10px]">Action Required</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Floating Theme Switcher ── */}
      <div className="absolute bottom-8 right-8 flex gap-2 z-50">
        {["minimalist", "editorial", "scifi", "spatial", "obsidian"].map((t) => (
          <button 
            key={t}
            onClick={() => onThemeChange(t)}
            className={`w-3 h-3 rounded-full transition-all ${theme === t ? "bg-primary ring-4 ring-primary/20 scale-125" : "bg-border hover:bg-muted-foreground"}`}
            title={`Switch to ${t}`}
          />
        ))}
      </div>
    </div>
  );
}
