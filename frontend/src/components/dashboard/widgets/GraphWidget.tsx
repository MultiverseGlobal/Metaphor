import React from "react";
import { Network } from "lucide-react";
import SpatialCanvas from "@/components/dashboard/SpatialCanvas";

export default function GraphWidget() {
  // A wrapper around the SpatialCanvas to fit inside a Bento Box cell
  const snapshot = {
    mission: "Develop the Metaphor universal context operating system to align all connected AI agents.",
    active_projects: [
      { id: "p1", name: "Metaphor Core", type: "Project", confidence: 0.95 },
      { id: "p2", name: "Atlas Portal", type: "Project", confidence: 0.82 },
      { id: "p3", name: "Knowledge Ingestion", type: "System", confidence: 0.77 },
      { id: "p4", name: "Neural Link", type: "Integration", confidence: 0.64 }
    ],
    confidence: 0.88
  };

  return (
    <div className="w-full h-full bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-surface/80 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
        <Network className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Knowledge Graph</span>
      </div>
      
      {/* Container to scale down the absolute positioned graph */}
      <div className="absolute inset-0 flex items-center justify-center scale-75 transform-origin-center pointer-events-auto">
         <div className="relative w-[800px] h-[800px]">
            {/* We override the fixed positioning from the original SpatialCanvas by wrapping it in relative */}
            <div className="[&>div.fixed]:absolute [&>div.fixed]:top-1/2 [&>div.fixed]:left-1/2">
                <SpatialCanvas 
                  snapshot={snapshot} 
                  selectedNode={null} 
                  onSelectNode={() => {}} 
                />
            </div>
         </div>
      </div>
    </div>
  );
}
