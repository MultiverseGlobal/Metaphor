"use client";

import React, { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChevronRight, Database, Search, User } from "lucide-react";
import KPIWidget from "@/components/dashboard/widgets/KPIWidget";
import GraphWidget from "@/components/dashboard/widgets/GraphWidget";
import TerminalWidget from "@/components/dashboard/widgets/TerminalWidget";

export default function DashboardPage({ activeNav = "dashboard" }: { activeNav?: string }) {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // Level 0 Base Panel
  const renderBasePanel = () => {
    switch (activeNav) {
      case "dashboard":
        return (
          <Panel level={selectedAgentId ? 0 : 0} className="p-8 gap-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold tracking-tight">System Dashboard</h1>
              <div className="text-xs text-muted font-mono">metaphor_os // v2.0.0</div>
            </div>
            
            {/* The Premium Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[400px]">
                <GraphWidget />
              </div>
              <div className="lg:col-span-1 h-[400px]">
                <KPIWidget />
              </div>
            </div>
            <div className="h-[300px]">
              <TerminalWidget />
            </div>
          </Panel>
        );
      case "agents":
        return (
          <Panel level={selectedAgentId ? 0 : 0} className="p-0 flex flex-col">
            <div className="p-6 border-b border-border-subtle bg-surface-1/50">
              <h1 className="text-2xl font-bold tracking-tight">Agent Topologies</h1>
            </div>
            
            {/* The Dense List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedAgentId(`agent-${i}`)}
                  className="flex items-center justify-between p-4 bg-surface-2/50 border border-border-subtle rounded-lg hover:border-primary/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-background border border-border-strong flex items-center justify-center">
                      <Database className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-bright">Atlas Oracle {i}</h3>
                      <p className="text-[11px] text-muted font-mono mt-0.5">id: atlas-oracle-{i} • status: syncing</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                </div>
              ))}
            </div>
          </Panel>
        );
      default:
        return (
          <Panel level={0} className="p-8 flex items-center justify-center">
            <p className="text-muted font-mono">Module '{activeNav}' is offline.</p>
          </Panel>
        );
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Base Layer */}
      {renderBasePanel()}

      {/* Stacked Level 1 (e.g. Agent Deep Dive) */}
      {selectedAgentId && (
        <>
          <div className="absolute inset-0 bg-background/20 backdrop-blur-sm z-10 transition-opacity" onClick={() => setSelectedAgentId(null)}></div>
          <Panel level={1} className="ml-[10%] p-0 flex flex-col border-l border-border-strong shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-6 border-b border-border-subtle bg-surface-2/50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-bright">Deep Dive: {selectedAgentId}</h2>
                <p className="text-xs text-muted font-mono mt-1">Live telemetry stream active</p>
              </div>
              <button onClick={() => setSelectedAgentId(null)} className="px-4 py-2 bg-surface-1 border border-border-subtle rounded text-xs hover:text-bright transition-colors">
                Close Panel
              </button>
            </div>
            <div className="flex-1 p-6 bg-surface-1/90">
              <TerminalWidget />
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
