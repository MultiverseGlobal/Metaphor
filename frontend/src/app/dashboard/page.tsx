"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchFromMetaphor } from "../api";

// Spatial HUD Components
import SpatialCanvas from "@/components/dashboard/SpatialCanvas";
import CommandPalette from "@/components/dashboard/CommandPalette";
import InspectorPanel from "@/components/dashboard/InspectorPanel";
import InboxSignals from "@/components/dashboard/InboxSignals";

export default function SpatialHUDDashboard() {
  const router = useRouter();
  
  const [snapshot, setSnapshot] = useState<any>(null);
  const [inboxData, setInboxData] = useState<any>({ pending_nodes: [] });
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans selection:bg-primary selection:text-white">
      {/* Background / Main Graph */}
      <SpatialCanvas 
        snapshot={snapshot} 
        selectedNode={selectedNode} 
        onSelectNode={setSelectedNode} 
      />

      {/* Foreground HUD Elements */}
      <CommandPalette />
      <InboxSignals inboxData={inboxData} />
      <InspectorPanel selectedNode={selectedNode} />
    </div>
  );
}
