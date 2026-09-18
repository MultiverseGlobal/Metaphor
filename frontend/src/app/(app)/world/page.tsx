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
  return (
    <div className="px-3 py-1.5 bg-surface-1 border border-border-strong hover:border-foreground rounded-none shadow-sm flex items-center gap-2 transition-colors min-w-[120px]">
      <Handle type="target" position={Position.Top} className="!w-1 !h-1 !bg-foreground !border-none !rounded-none" />
      <div className="text-[10px] uppercase font-mono tracking-widest text-muted">{data.type || "NODE"}</div>
      <span className="text-xs font-sans font-medium text-foreground whitespace-nowrap ml-2">{data.label}</span>
      <Handle type="source" position={Position.Bottom} className="!w-1 !h-1 !bg-foreground !border-none !rounded-none" />
    </div>
  );
};

import { ContextNode } from "@/components/graph/ContextNode";
import { DraftNode } from "@/components/graph/DraftNode";
import { LeadNode } from "@/components/graph/LeadNode";
import { GlowEdge } from "@/components/graph/GlowEdge";
import { PushPanel } from "@/components/PushPanel";

const nodeTypes = {
  custom: CustomNode,
  context: ContextNode,
  draft: DraftNode,
  lead: LeadNode,
};

const edgeTypes = {
  glow: GlowEdge,
};

import { fetchFromMetaphor } from "@/app/api";
import { GraphSkeleton } from "@/components/ui/SkeletonLoader";

export default function KnowledgeGraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([]);
  const [loading, setLoading] = useState(true);
  const [rawNodes, setRawNodes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedNodes, setSelectedNodes] = useState<FlowNode[]>([]);
  const [detailNode, setDetailNode] = useState<any | null>(null);

  const onSelectionChange = useCallback(({ nodes }: { nodes: FlowNode[] }) => {
    setSelectedNodes(nodes);
    if (nodes.length === 1) {
      const raw = rawNodes.find(r => r.id === nodes[0].id);
      setDetailNode(raw || null);
    } else {
      setDetailNode(null);
    }
  }, [rawNodes]);

  const handlePush = (model: string) => {
    console.log(`Pushing context with model ${model}`, selectedNodes);
    // Future integration with backend or AI SDK
    setSelectedNodes([]);
  };

  useEffect(() => {
    async function fetchGraph() {
      try {
        let data = await fetchFromMetaphor("/graph");
        
        let nodesList = data?.nodes || [];
        let edgesList = data?.edges || [];



        const radiusStep = 160;
        const flowNodes: FlowNode[] = nodesList.map((n: any, i: number) => {
          if (i === 0) {
            return {
              id: n.id,
              type: 'custom',
              position: { x: 450, y: 300 },
              data: { label: n.name, type: (n.type || "project").toLowerCase(), summary: n.summary }
            };
          }
          
          const ring = Math.floor(Math.sqrt(i));
          const nodesInRing = Math.max(4, ring * 4);
          const angle = ((i % nodesInRing) / nodesInRing) * 2 * Math.PI;
          const radius = ring * radiusStep + 80;

          const rawType = (n.type || "project").toLowerCase();
          let nodeType = "context";
          if (rawType === "draft") nodeType = "draft";
          if (rawType === "lead") nodeType = "lead";

          return {
            id: n.id,
            type: nodeType,
            position: { 
              x: 450 + radius * Math.cos(angle), 
              y: 300 + radius * Math.sin(angle) 
            },
            data: { label: n.name, type: rawType, summary: n.summary }
          };
        });


        const flowEdges: FlowEdge[] = edgesList.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'glow',
          animated: true,
          style: { stroke: 'var(--color-border-strong)', strokeWidth: 1.5 },
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);
        setRawNodes(nodesList.map((n: any) => ({
          ...n,
          connections: edgesList.filter((e: any) => e.source === n.id || e.target === n.id).length
        })));

      } catch (e) {
        console.error("Failed to fetch graph:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchGraph();
  }, [setNodes, setEdges]);


  const filteredNodes = useMemo(() => {
    return rawNodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (node.summary && node.summary.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = activeFilter === "All" || node.type.toLowerCase() === activeFilter.toLowerCase();
      
      return matchesSearch && matchesFilter;
    });
  }, [rawNodes, searchQuery, activeFilter]);

  if (loading) {
    return (
      <div className="p-8 h-full bg-background flex flex-col justify-center">
        <GraphSkeleton />
      </div>
    );
  }

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
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-background"
          >
            <Background color="var(--color-border-strong)" gap={24} size={1} />
            <Controls className="!bg-surface-1 !border-border-subtle !shadow-sm" />
          </ReactFlow>

          {/* Node Type Legend */}
          <div className="absolute bottom-4 left-4 bg-surface-1/90 backdrop-blur-sm border border-border-subtle rounded-none p-3 flex flex-col gap-2 shadow-sm">
            <div className="text-[9px] font-mono uppercase tracking-widest text-muted mb-1">Node Types</div>
            {[
              "Identity",
              "Project",
              "Document",
              "Other",
            ].map((label) => (
              <div key={label} className="text-[10px] text-muted font-mono uppercase">
                [{label}]
              </div>
            ))}
          </div>

          {/* Provenance Detail Drawer */}
          {detailNode && (
            <div className="absolute top-4 right-4 w-72 bg-surface-1/95 backdrop-blur-md border border-border-subtle rounded-2xl shadow-2xl p-5 animate-in slide-in-from-right-4 fade-in duration-300 z-20">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-muted mb-1">Node Provenance</div>
                  <h3 className="text-sm font-semibold text-foreground">{detailNode.name}</h3>
                </div>
                <button onClick={() => setDetailNode(null)} className="text-muted hover:text-foreground text-xs cursor-pointer">✕</button>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-muted mb-1">Type</div>
                  <span className="px-2 py-0.5 rounded bg-surface-2 border border-border-subtle text-[10px] font-mono capitalize">{detailNode.type}</span>
                </div>
                {detailNode.summary && (
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-muted mb-1">Summary</div>
                    <p className="text-xs text-muted leading-relaxed">{detailNode.summary}</p>
                  </div>
                )}
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-muted mb-1">Connections</div>
                  <p className="text-xs text-foreground">{detailNode.connections} edges</p>
                </div>
              </div>
            </div>
          )}

          <PushPanel 
            selectedNodes={selectedNodes}
            onPush={handlePush}
            onClose={() => setSelectedNodes([])}
          />
        </div>

        {/* Right: Node Explorer Table */}
        <div className="w-1/3 h-full bg-surface-1/50 flex flex-col">
          <div className="p-4 border-b border-border-subtle flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search nodes by semantic meaning..." 
                className="w-full bg-background border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-xs text-foreground focus:outline-none focus:border-primary shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setActiveFilter("All")} className={`flex-1 py-1.5 bg-background border ${activeFilter === "All" ? "border-primary text-foreground" : "border-border-subtle text-muted"} rounded-md text-[10px] uppercase tracking-wider font-semibold hover:text-foreground hover:border-primary transition-colors`}>All</button>
              <button onClick={() => setActiveFilter("Identity")} className={`flex-1 py-1.5 bg-background border ${activeFilter === "Identity" ? "border-primary text-foreground" : "border-border-subtle text-muted"} rounded-md text-[10px] uppercase tracking-wider font-semibold hover:text-foreground hover:border-primary transition-colors`}>Identity</button>
              <button onClick={() => setActiveFilter("Project")} className={`flex-1 py-1.5 bg-background border ${activeFilter === "Project" ? "border-primary text-foreground" : "border-border-subtle text-muted"} rounded-md text-[10px] uppercase tracking-wider font-semibold hover:text-foreground hover:border-primary transition-colors`}>Projects</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {filteredNodes.map(node => (
              <div key={node.id} className="p-3 bg-background border border-border-subtle rounded-lg flex flex-col gap-1 group cursor-pointer hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] uppercase tracking-widest font-mono text-muted">[{node.type}]</span>
                    <span className="text-xs font-semibold text-foreground">{node.name}</span>
                  </div>
                  <span className="text-[10px] text-muted font-mono">{node.connections} edges</span>
                </div>
                {node.summary && (
                  <p className="text-[11px] text-muted line-clamp-2 pl-5">{node.summary}</p>
                )}
              </div>
            ))}
            {filteredNodes.length === 0 && !loading && (
              <div className="text-center p-8 text-muted text-xs">No nodes match your filters.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
