import React from "react";

interface Props {
  snapshot: any;
  inboxData: any;
  theme: string;
  onThemeChange: (t: string) => void;
}

export default function EditorialLayout({ snapshot, inboxData, theme, onThemeChange }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground font-serif p-8 md:p-16 max-w-5xl mx-auto">
      
      {/* ── Magazine Header ── */}
      <header className="border-b border-border pb-12 mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 text-primary">Metaphor.</h1>
          <p className="text-xl italic text-muted-foreground font-serif max-w-lg leading-relaxed">
            The Context Operating System. A single source of truth for intelligent agents.
          </p>
        </div>
        <div className="text-right hidden md:block text-sm font-sans uppercase tracking-widest text-muted-foreground">
          Vol. 1 — {new Date().getFullYear()}
        </div>
      </header>

      {/* ── Asymmetrical Magazine Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
        
        {/* Left Column (Main Article/Mission) */}
        <div className="md:col-span-7">
          <h2 className="text-3xl font-bold mb-6 font-serif">The State of the Graph</h2>
          <p className="text-lg leading-relaxed mb-8 first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-4px] first-letter:text-primary">
            {snapshot?.mission}
          </p>
          
          <hr className="my-12 border-border" />
          
          <h3 className="text-2xl font-bold mb-6 font-serif">Active Directives</h3>
          <div className="space-y-6">
            {snapshot?.active_projects?.map((p: any) => (
              <div key={p.id} className="flex gap-6 items-start">
                <span className="text-4xl text-border font-light">{p.id.replace('p','0')}</span>
                <div>
                  <h4 className="text-xl font-bold mb-2">{p.name}</h4>
                  <p className="text-muted-foreground font-sans text-sm">Classification: {p.type}. Continuously indexed and verified across all connected nodes.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (Sidebar/Inbox) */}
        <div className="md:col-span-5 space-y-12">
          
          <div className="p-8 bg-surface border border-border">
            <h3 className="text-sm font-sans font-bold uppercase tracking-widest mb-6 border-b border-border pb-4">Required Clarifications</h3>
            <div className="space-y-4">
              {inboxData?.pending_nodes?.map((n: any) => (
                <div key={n.id} className="font-serif">
                  <p className="text-lg font-bold mb-1">{n.name}</p>
                  <button className="text-xs font-sans uppercase tracking-widest text-accent-red hover:text-primary transition-colors border-b border-accent-red hover:border-primary pb-1">Review Details</button>
                </div>
              ))}
            </div>
          </div>

          <div>
             <h3 className="text-sm font-sans font-bold uppercase tracking-widest mb-6 border-b border-border pb-4">Theme Settings</h3>
             <div className="flex flex-col gap-2 font-sans text-sm">
                {["minimalist", "editorial", "scifi", "spatial", "obsidian"].map((t) => (
                  <button 
                    key={t}
                    onClick={() => onThemeChange(t)}
                    className={`text-left py-2 border-b border-border/30 hover:text-primary transition-colors ${theme === t ? "font-bold text-primary" : "text-muted-foreground"}`}
                  >
                    {theme === t && "→ "} {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
