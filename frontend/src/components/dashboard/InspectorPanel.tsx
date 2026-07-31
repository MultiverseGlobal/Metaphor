import React from "react";
import { MousePointer2 } from "lucide-react";

interface InspectorPanelProps {
  selectedNode: any;
}

export default function InspectorPanel({ selectedNode }: InspectorPanelProps) {
  if (!selectedNode) return null;

  return (
    <div className="fixed top-10 bottom-10 right-10 w-[400px] z-40 animate-fade-in-left flex flex-col">
      <div className="flex-1 p-8 bg-surface/60 backdrop-blur-3xl rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.4)] border border-white/5 relative overflow-hidden flex flex-col">
        
        {/* Subtle top glare */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-semibold text-foreground tracking-tight drop-shadow-sm">{selectedNode.name}</h3>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]">
            {selectedNode.type}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground/90 leading-relaxed mb-8">{selectedNode.desc}</p>
        
        <div className="mt-auto space-y-4">
          <div className="p-5 bg-background/40 rounded-2xl border border-white/5">
            <span className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-widest block mb-2">Confidence Score</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-light font-mono text-primary drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                {selectedNode.confidence ? (selectedNode.confidence * 100).toFixed(0) : 0}%
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
  );
}
