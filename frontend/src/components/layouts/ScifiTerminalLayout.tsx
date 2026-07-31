import React from "react";
import { Activity, Terminal } from "lucide-react";

interface Props {
  snapshot: any;
  inboxData: any;
  theme: string;
  onThemeChange: (t: string) => void;
}

export default function ScifiTerminalLayout({ snapshot, inboxData, theme, onThemeChange }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono p-4 flex flex-col overflow-hidden">
      
      {/* Top Bar */}
      <header className="flex justify-between items-center border-b-2 border-border pb-2 mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <Terminal className="w-5 h-5 text-primary" />
          <h1 className="text-sm font-bold uppercase tracking-widest">METAPHOR_OS // ROOT_TERMINAL</h1>
        </div>
        <div className="flex gap-4 text-xs font-bold uppercase">
          <span className="text-accent-red animate-pulse">[ UPLINK ACTIVE ]</span>
          <span>SYS_CONFIDENCE: {snapshot?.confidence * 100}%</span>
        </div>
      </header>

      {/* Tiling Window Grid */}
      <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-4 min-h-0">
        
        {/* Main Graph Viewer */}
        <div className="col-span-8 row-span-4 panel p-0 flex flex-col">
          <div className="bg-surface border-b-2 border-border p-2 px-4 flex justify-between text-xs font-bold uppercase">
            <span>Graph_Viewer.exe</span>
            <span className="text-primary">[ RUNNING ]</span>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center items-center relative overflow-hidden">
             <div className="absolute inset-0 bg-texture opacity-20 pointer-events-none" />
             <Activity className="w-16 h-16 text-primary/50 mb-4" />
             <p className="text-center max-w-md text-sm leading-relaxed z-10 bg-background/80 p-4 border border-border shadow-hard">
               {snapshot?.mission}
             </p>
          </div>
        </div>

        {/* Live Event Stream */}
        <div className="col-span-4 row-span-6 panel p-0 flex flex-col">
          <div className="bg-surface border-b-2 border-border p-2 px-4 text-xs font-bold uppercase">
            <span>Event_Stream.log</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="text-xs">
                <span className="text-muted-foreground">[10:4{i}:22]</span> <span className="text-accent-blue">INFO:</span> Ingested new context fragment from source_id={i * 1234}
              </div>
            ))}
          </div>
        </div>

        {/* Entities DB */}
        <div className="col-span-8 row-span-2 panel p-0 flex flex-col">
          <div className="bg-surface border-b-2 border-border p-2 px-4 text-xs font-bold uppercase">
            <span>Entity_Registry.db</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground border-b border-border">
                <tr><th>ID</th><th>NAME</th><th>TYPE</th><th>STATUS</th></tr>
              </thead>
              <tbody>
                {snapshot?.active_projects?.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-surface">
                    <td className="py-2">0x{i}A9</td>
                    <td className="py-2 text-primary font-bold">{p.name}</td>
                    <td className="py-2">{p.type}</td>
                    <td className="py-2">[ VERIFIED ]</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Floating Theme Switcher */}
      <div className="fixed bottom-4 left-4 flex gap-2 z-50 panel p-2">
        {["minimalist", "editorial", "scifi", "spatial", "obsidian"].map((t) => (
          <button 
            key={t}
            onClick={() => onThemeChange(t)}
            className={`px-2 py-1 text-[10px] uppercase font-bold border-2 ${theme === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.substring(0,3)}
          </button>
        ))}
      </div>

    </div>
  );
}
