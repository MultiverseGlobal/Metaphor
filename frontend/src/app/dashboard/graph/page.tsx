"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Network, Search, Share2 } from "lucide-react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node as FlowNode,
  Edge as FlowEdge,
  MarkerType,
  Handle,
  Position
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// ── Custom Node Implementation ──
const CustomNode = ({ data }: { data: any }) => {
  const isIdentity = data.type === "identity";
  const isProject = data.type === "project";
  const isDocument = data.type === "document";
  
  return (
    <div className="px-4 py-2 bg-surface-1 border border-border-strong rounded-full shadow-sm flex items-center gap-2 hover:border-primary transition-colors min-w-[120px]">
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !bg-muted !border-none" />
      <div className={`w-2.5 h-2.5 rounded-full ${
        isIdentity ? "bg-primary" : 
        isProject ? "bg-cyan-500" : 
        isDocument ? "bg-emerald-500" : "bg-rose-500"
      }`} />
      <span className="text-xs font-medium text-foreground whitespace-nowrap">{data.label}</span>
      <Handle type="source" position={Position.Bottom} className="!w-1.5 !h-1.5 !bg-muted !border-none" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export default function KnowledgeGraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);
  const [loading, setLoading] = useState(true);
  const [rawNodes, setRawNodes] = useState<any[]>([]);

  useEffect(() => {
    async function fetchGraph() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const res = await fetch(`${apiUrl}/graph`);
        const data = await res.json();
        
        // Simple force-directed/grid layout for MVP
        const flowNodes: FlowNode[] = data.nodes.map((n: any, i: number) => ({
          id: n.id,
          type: 'custom',
          position: { 
            x: (i % 5) * 200 + 100, 
            y: Math.floor(i / 5) * 150 + 100 
          },
          data: { label: n.name, type: n.type.toLowerCase(), summary: n.summary }
        }));

        const flowEdges: FlowEdge[] = data.edges.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'var(--color-border-strong)', strokeWidth: 1.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'var(--color-border-strong)',
          },
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);
        
        // Save raw nodes for the sidebar
        setRawNodes(data.nodes.map((n: any) => ({
          ...n,
          connections: data.edges.filter((e: any) => e.source === n.id || e.target === n.id).length
        })));

      } catch (e) {
        console.error("Failed to fetch graph:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchGraph();
  }, [setNodes, setEdges]);

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-150">
      
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
        
        {/* Left: Interactive React Flow Canvas */}
        <div className="w-2/3 h-full relative border-r border-border-subtle bg-surface-1/30">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background"
          >
            <Background color="var(--color-border-strong)" gap={24} size={1} />
            <Controls className="!bg-surface-1 !border-border-subtle !shadow-sm" />
          </ReactFlow>
        </div>

        {/* Right: Node Explorer Table */}
        <div className="w-1/3 h-full bg-surface-1/50 flex flex-col">
          <div className="p-4 border-b border-border-subtle flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                placeholder="Search nodes by semantic meaning..." 
                className="w-full bg-background border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-xs text-foreground focus:outline-none focus:border-primary shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-1.5 bg-background border border-border-subtle rounded-md text-[10px] uppercase tracking-wider font-semibold text-muted hover:text-foreground hover:border-primary transition-colors">All</button>
              <button className="flex-1 py-1.5 bg-background border border-border-subtle rounded-md text-[10px] uppercase tracking-wider font-semibold text-muted hover:text-foreground hover:border-primary transition-colors">Identity</button>
              <button className="flex-1 py-1.5 bg-background border border-border-subtle rounded-md text-[10px] uppercase tracking-wider font-semibold text-muted hover:text-foreground hover:border-primary transition-colors">Projects</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {rawNodes.map(node => (
              <div key={node.id} className="p-3 bg-background border border-border-subtle rounded-lg flex flex-col gap-1 group cursor-pointer hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${node.type.toLowerCase() === 'identity' ? 'bg-primary' : node.type.toLowerCase() === 'project' ? 'bg-cyan-500' : node.type.toLowerCase() === 'document' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-xs font-semibold text-foreground">{node.name}</span>
                  </div>
                  <span className="text-[10px] text-muted font-mono">{node.connections} edges</span>
                </div>
                {node.summary && (
                  <p className="text-[11px] text-muted line-clamp-2 pl-5">{node.summary}</p>
                )}
              </div>
            ))}
            {rawNodes.length === 0 && !loading && (
              <div className="text-center p-8 text-muted text-xs">No nodes found. Connect an integration to begin building your graph.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
