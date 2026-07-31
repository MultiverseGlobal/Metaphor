"use client";

import React, { useState } from "react";
import { Network, Database, Brain, GitBranch, ArrowRight, Share2, Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function KnowledgeGraphPage() {
  const [nodes] = useState([
    { id: "1", label: "Identity: William", type: "identity", x: 20, y: 30, connections: 3 },
    { id: "2", label: "Project: Atlas", type: "project", x: 70, y: 20, connections: 5 },
    { id: "3", label: "Insight: Direct Tone", type: "insight", x: 40, y: 70, connections: 1 },
    { id: "4", label: "Constraint: No Jargon", type: "insight", x: 80, y: 80, connections: 1 },
    { id: "5", label: "Doc: Notion Arch", type: "document", x: 50, y: 40, connections: 2 },
    { id: "6", label: "Commit: Pricing to $500", type: "document", x: 85, y: 45, connections: 1 },
  ]);

  const [edges] = useState([
    { source: "1", target: "2" },
    { source: "1", target: "3" },
    { source: "1", target: "4" },
    { source: "2", target: "5" },
    { source: "1", target: "5" },
    { source: "2", target: "6" },
  ]);

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="px-8 py-6 border-b border-border-subtle flex items-center justify-between bg-surface-1/50">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight mb-1 flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" /> Knowledge Graph
          </h1>
          <p className="text-sm text-muted">A live visualizer of your continuous context model.</p>
        </div>
        <div className="flex gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 bg-surface-2 rounded-md text-foreground border border-border-subtle flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" /> {nodes.length} Nodes
          </div>
          <div className="px-3 py-1.5 bg-surface-2 rounded-md text-foreground border border-border-subtle flex items-center gap-1.5">
            <Share2 className="w-3 h-3 text-muted" /> {edges.length} Edges
          </div>
        </div>
      </header>

      {/* Main Split Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Interactive Canvas */}
        <div className="w-2/3 h-full relative border-r border-border-subtle bg-surface-1/30">
          {/* Grid Background */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--border-subtle) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }} />

          {/* SVG Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {edges.map((edge, i) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;
              
              return (
                <line 
                  key={i}
                  x1={`${sourceNode.x}%`} 
                  y1={`${sourceNode.y}%`} 
                  x2={`${targetNode.x}%`} 
                  y2={`${targetNode.y}%`}
                  stroke="var(--border-strong)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>

          {/* Render Nodes */}
          {nodes.map((node) => (
            <div 
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 bg-surface-1 border border-border-strong rounded-full shadow-sm z-10 flex items-center gap-2 cursor-pointer hover:border-primary hover:shadow-md hover:scale-105 transition-all"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div className={`w-2 h-2 rounded-full ${node.type === 'identity' ? 'bg-primary' : node.type === 'project' ? 'bg-accent-blue' : node.type === 'document' ? 'bg-success' : 'bg-accent-red'}`} />
              <span className="text-[11px] font-medium text-foreground">{node.label}</span>
            </div>
          ))}
        </div>

        {/* Right: Node Explorer Table */}
        <div className="w-1/3 h-full bg-surface-1/50 flex flex-col">
          
          <div className="p-4 border-b border-border-subtle flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search nodes by semantic meaning..." 
                className="w-full bg-background border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-xs text-foreground focus:outline-none focus:border-primary shadow-inner"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-1.5 bg-background border border-border-subtle rounded-md text-[10px] uppercase tracking-wider font-semibold text-muted hover:text-foreground hover:border-primary/50 transition-colors">Identity</button>
              <button className="flex-1 py-1.5 bg-background border border-border-subtle rounded-md text-[10px] uppercase tracking-wider font-semibold text-muted hover:text-foreground hover:border-primary/50 transition-colors">Projects</button>
              <button className="flex-1 py-1.5 bg-background border border-border-subtle rounded-md text-[10px] uppercase tracking-wider font-semibold text-muted hover:text-foreground hover:border-primary/50 transition-colors">Insights</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {nodes.map(node => (
              <div key={node.id} className="p-3 bg-background border border-border-subtle rounded-lg flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${node.type === 'identity' ? 'bg-primary' : node.type === 'project' ? 'bg-accent-blue' : node.type === 'document' ? 'bg-success' : 'bg-accent-red'}`} />
                  <span className="text-xs font-medium text-foreground">{node.label}</span>
                </div>
                <span className="text-[10px] text-muted font-mono">{node.connections} edges</span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
