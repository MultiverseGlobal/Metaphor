import React, { useState } from "react";
import { Folder, Database, Terminal as TerminalIcon, Layout, Settings } from "lucide-react";
import TerminalWidget from "@/components/dashboard/widgets/TerminalWidget";
import GraphWidget from "@/components/dashboard/widgets/GraphWidget";
import DataTableWidget from "@/components/dashboard/widgets/DataTableWidget";

export default function IDEParadigm() {
  const [activeTab, setActiveTab] = useState<"graph" | "data">("graph");

  return (
    <div className="w-full h-full flex bg-background text-sm font-sans">
      
      {/* Activity Bar */}
      <div className="w-12 h-full bg-surface-1 border-r border-border-subtle flex flex-col items-center py-4 space-y-6">
        <Folder className="w-5 h-5 text-muted hover:text-primary cursor-pointer transition-colors" />
        <Database className="w-5 h-5 text-primary cursor-pointer" />
        <Layout className="w-5 h-5 text-muted hover:text-primary cursor-pointer transition-colors" />
        <div className="flex-1"></div>
        <Settings className="w-5 h-5 text-muted hover:text-primary cursor-pointer transition-colors" />
      </div>

      {/* Primary Sidebar (Explorer) */}
      <div className="w-64 h-full bg-surface-1 border-r border-border-subtle flex flex-col">
        <div className="px-4 py-3 border-b border-border-subtle">
          <span className="text-xs font-bold tracking-widest uppercase text-muted">Explorer</span>
        </div>
        <div className="flex-1 p-2 space-y-1">
          <div 
            onClick={() => setActiveTab("graph")}
            className={`px-3 py-1.5 rounded cursor-pointer ${activeTab === "graph" ? "bg-surface-2 text-primary" : "text-muted hover:bg-surface-2/50"}`}
          >
            Spatial Graph
          </div>
          <div 
            onClick={() => setActiveTab("data")}
            className={`px-3 py-1.5 rounded cursor-pointer ${activeTab === "data" ? "bg-surface-2 text-primary" : "text-muted hover:bg-surface-2/50"}`}
          >
            Active Topology
          </div>
        </div>
      </div>

      {/* Editor & Terminal Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Editor Tabs */}
        <div className="h-10 bg-surface-1 border-b border-border-subtle flex">
          <div className={`px-4 py-2 border-r border-border-subtle border-t-2 cursor-pointer ${activeTab === "graph" ? "bg-background border-t-primary text-foreground" : "border-t-transparent text-muted hover:bg-surface-2"}`} onClick={() => setActiveTab("graph")}>
            graph.tsx
          </div>
          <div className={`px-4 py-2 border-r border-border-subtle border-t-2 cursor-pointer ${activeTab === "data" ? "bg-background border-t-primary text-foreground" : "border-t-transparent text-muted hover:bg-surface-2"}`} onClick={() => setActiveTab("data")}>
            topology.db
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 bg-background p-6 overflow-hidden">
          {activeTab === "graph" && <GraphWidget />}
          {activeTab === "data" && <DataTableWidget />}
        </div>

        {/* Integrated Terminal Panel */}
        <div className="h-64 bg-surface-1 border-t border-border-subtle flex flex-col">
          <div className="flex items-center px-4 py-2 border-b border-border-subtle">
            <span className="text-[10px] font-mono font-medium text-foreground tracking-widest uppercase flex items-center gap-2">
              <TerminalIcon className="w-3 h-3" /> Terminal
            </span>
          </div>
          <div className="flex-1 p-2">
            <TerminalWidget />
          </div>
        </div>

      </div>
    </div>
  );
}
