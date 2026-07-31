import React from "react";

interface Props {
  snapshot: any;
  inboxData: any;
  theme: string;
  onThemeChange: (t: string) => void;
}

export default function MinimalistGridLayout({ snapshot, inboxData, theme, onThemeChange }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono flex flex-col uppercase">
      
      {/* ── Brutalist Header ── */}
      <header className="grid-section flex items-center justify-between px-6 py-4 bg-card border-b-4 border-foreground">
        <div className="font-bold tracking-tighter text-2xl">M—OS // Raw Data</div>
        <div className="flex gap-4">
          <span className="tag filled">Confidence: {snapshot?.confidence * 100}%</span>
        </div>
      </header>

      {/* ── Massive Grid Structure ── */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
        
        {/* Core Mission Panel */}
        <div className="col-span-1 lg:col-span-2 col-border border-b-2 border-border p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold mb-8 border-b-2 border-border inline-block">01. Mission Statement</h2>
            <p className="text-2xl font-bold leading-tight">{snapshot?.mission}</p>
          </div>
        </div>

        {/* Active Projects Panel */}
        <div className="col-span-1 col-border border-b-2 border-border p-0 flex flex-col">
          <div className="p-4 border-b-2 border-border font-bold text-sm bg-surface">02. Active Entities</div>
          <div className="divide-y-2 divide-border flex-1">
            {snapshot?.active_projects?.map((p: any) => (
              <div key={p.id} className="p-4 hover:bg-foreground hover:text-background transition-colors cursor-pointer flex justify-between">
                <span className="font-bold">{p.name}</span>
                <span>[{p.type}]</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inbox Panel */}
        <div className="col-span-1 border-b-2 border-border p-0 flex flex-col bg-surface/50">
          <div className="p-4 border-b-2 border-border font-bold text-sm bg-surface">03. Pending Actions</div>
          <div className="divide-y-2 divide-border">
            {inboxData?.pending_nodes?.map((n: any) => (
              <div key={n.id} className="p-4 bg-accent-red text-white font-bold">
                {n.name}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Theme Switcher Footer ── */}
      <footer className="border-t-4 border-foreground p-6 grid grid-cols-5 gap-4 bg-card">
        {["minimalist", "editorial", "scifi", "spatial", "obsidian"].map((t) => (
          <button 
            key={t}
            onClick={() => onThemeChange(t)}
            className={`btn-tactile w-full py-4 ${theme === t ? "bg-foreground text-background" : ""}`}
          >
            {t}
          </button>
        ))}
      </footer>

    </div>
  );
}
