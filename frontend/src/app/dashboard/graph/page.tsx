"use client";

import React, { useState, useEffect } from "react";
import SpatialCanvas from "@/components/dashboard/SpatialCanvas";

export default function GraphDashboard() {
  const [snapshot, setSnapshot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    // For the graph view specifically, we might force dark mode or let it respect global
    // But since the user wants Light Mode default, we will just use the global theme.
    // However, Spatial Canvas looks best dark, so we force it just for this page.
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute('data-theme', 'obsidian');
      loadAllData();
    }
    
    // Cleanup when leaving graph view
    return () => {
       if (typeof window !== "undefined") {
          document.documentElement.setAttribute('data-theme', localStorage.getItem('metaphor_theme') || 'light');
       }
    };
  }, []);

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
      {/* Background / Main Graph */}
      <SpatialCanvas 
        snapshot={snapshot} 
        selectedNode={selectedNode} 
        onSelectNode={setSelectedNode} 
      />
      
      {/* Simplified overlay just to show what node is selected */}
      {selectedNode && (
         <div className="absolute top-8 left-8 p-6 bg-surface/80 backdrop-blur-md rounded-xl border border-border shadow-xl max-w-sm z-50">
            <h3 className="text-2xl font-bold text-foreground mb-2">{selectedNode.name}</h3>
            <span className="text-xs font-mono px-2 py-1 bg-primary/10 text-primary rounded">{selectedNode.type}</span>
            <p className="mt-4 text-sm text-muted-foreground">{selectedNode.desc}</p>
         </div>
      )}
    </div>
  );
}
