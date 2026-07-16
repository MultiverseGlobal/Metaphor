"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { 
  fetchFromMetaphor 
} from "./api";
import { CustomNode } from "./CustomNode";
import { 
  RefreshCw, 
  GitBranch, 
  Activity, 
  HelpCircle, 
  Clock, 
  Key, 
  MessageSquare,
  Sparkles,
  Link2
} from "lucide-react";

// Node Types dictionary for React Flow
const nodeTypes = {
  person: CustomNode,
  meeting: CustomNode,
  idea: CustomNode,
  decision: CustomNode,
  commit: CustomNode,
  project: CustomNode
};

export default function Dashboard() {
  // Graph States
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // App States
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedNodeA, setSelectedNodeA] = useState<string | null>(null);
  const [selectedNodeB, setSelectedNodeB] = useState<string | null>(null);
  
  // Reasoning State
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  
  // Timeline State
  const [timeline, setTimeline] = useState<any[]>([]);
  
  // Active Panel Tab
  const [activeTab, setActiveTab] = useState<"explain" | "timeline" | "keys">("explain");
  
  // Config States
  const [apiKey, setApiKey] = useState("metaphor_dev_secret_key_123");
  const [notionToken, setNotionToken] = useState("");
  const [githubToken, setGithubToken] = useState("");

  // Load configuration from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("metaphor_api_key");
      if (savedKey) setApiKey(savedKey);
      
      const savedNotion = localStorage.getItem("notion_token");
      if (savedNotion) setNotionToken(savedNotion);

      const savedGithub = localStorage.getItem("github_token");
      if (savedGithub) setGithubToken(savedGithub);
    }
    
    // Fetch initial graph and timeline
    loadGraphData();
  }, []);

  // Save config
  const saveKeys = () => {
    localStorage.setItem("metaphor_api_key", apiKey);
    localStorage.setItem("notion_token", notionToken);
    localStorage.setItem("github_token", githubToken);
    alert("API Configuration saved locally.");
  };

  // Main graph loaders
  const loadGraphData = async () => {
    try {
      // 1. Fetch Graph
      const graphData = await fetchFromMetaphor("/graph");
      
      // Map database nodes to React Flow nodes with layout
      // Simple grid/radial mapping to avoid overlap
      const mappedNodes = graphData.nodes.map((node: any, index: number) => {
        // Simple positioning algorithm
        const angle = (index / graphData.nodes.length) * 2 * Math.PI;
        const radius = 220 + (index % 2) * 80;
        const x = 350 + radius * Math.cos(angle);
        const y = 250 + radius * Math.sin(angle);
        
        return {
          id: node.id,
          type: node.type.toLowerCase(),
          data: { name: node.name, type: node.type, metadata: node.metadata },
          position: { x, y }
        };
      });

      // Map database edges to React Flow edges with distinct colors/styles
      const mappedEdges = graphData.edges.map((edge: any) => {
        let edgeColor = "var(--color-structural)";
        let animated = false;
        let style: any = { strokeWidth: 2 };

        if (edge.dimension === "semantic") {
          edgeColor = "var(--color-semantic)";
          style.strokeDasharray = "4 4";
        } else if (edge.dimension === "temporal") {
          edgeColor = "var(--color-temporal)";
          animated = true;
          style.strokeWidth = 3;
        }

        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          animated,
          label: edge.type,
          labelStyle: { fill: "#a1a1aa", fontSize: 9, fontWeight: 500 },
          style: { ...style, stroke: edgeColor },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
            width: 14,
            height: 14
          }
        };
      });

      setNodes(mappedNodes);
      setEdges(mappedEdges);

      // 2. Fetch Timeline History
      const historyData = await fetchFromMetaphor("/history");
      setTimeline(historyData.timeline || []);

    } catch (err: any) {
      console.error("Error loading Metaphor data:", err);
    }
  };

  // Trigger sync parser and reflection
  const runSync = async () => {
    setIsSyncing(true);
    try {
      await fetchFromMetaphor("/sync");
      await loadGraphData();
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Node Click Selection for explanation
  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    const nodeName = node.data.name;
    
    setSelectedNodeA((prev) => {
      if (!prev) return nodeName;
      if (prev === nodeName) return null; // toggle off
      
      // Node A is set, set Node B
      setSelectedNodeB((prevB) => {
        if (prevB === nodeName) return null;
        return nodeName;
      });
      return prev;
    });
  }, []);

  // Reset Node selection
  const clearSelection = () => {
    setSelectedNodeA(null);
    setSelectedNodeB(null);
    setExplanation(null);
  };

  // Request connection explanation
  const runExplanation = async () => {
    if (!selectedNodeA || !selectedNodeB) return;
    setIsExplaining(true);
    setExplanation("Asking Claude to analyze causal and semantic pathways...");
    try {
      const data = await fetchFromMetaphor("/explain", {
        node_a_name: selectedNodeA,
        node_b_name: selectedNodeB
      });
      setExplanation(data.explanation);
    } catch (err: any) {
      setExplanation(`Could not explain connection: ${err.message}`);
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col p-4 md:p-6 select-none bg-[#030307]">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#00f2fe] h-6 w-6 animate-pulse" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight glow-text">
              METAPHOR
            </h1>
            <span className="text-xs px-2 py-0.5 bg-[#5f3bf6]/20 border border-[#5f3bf6]/40 text-[#a18cd1] rounded-full uppercase tracking-wider font-semibold">
              V1 Context Engine
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Metaphor builds a continuously evolving model of your world, enabling AI systems to reason over relationships, history, and context.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Quick Counter */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400 mr-2">
            <div>
              <span className="text-gray-100 font-bold block text-sm">{nodes.length}</span>
              Objects Mapped
            </div>
            <div className="border-l border-gray-800 h-6"></div>
            <div>
              <span className="text-gray-100 font-bold block text-sm">{edges.length}</span>
              Edges Linked
            </div>
          </div>
          
          <button 
            onClick={runSync} 
            disabled={isSyncing}
            className={`glow-btn flex items-center gap-2 ${isSyncing ? "indexing-pulse opacity-85" : ""}`}
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing..." : "Sync Workspace"}
          </button>
        </div>
      </header>

      {/* DASHBOARD SPLIT GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]">
        {/* GRAPH CANVAS AREA */}
        <section className="lg:col-span-8 glass-panel h-[680px] overflow-hidden flex flex-col relative">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className="px-2 py-1 bg-gray-900/80 border border-gray-800 text-xs rounded text-gray-300 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"></span> Structural
            </span>
            <span className="px-2 py-1 bg-gray-900/80 border border-gray-800 text-xs rounded text-[#3b82f6] flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Semantic
            </span>
            <span className="px-2 py-1 bg-gray-900/80 border border-gray-800 text-xs rounded text-[#f59e0b] flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Temporal (Causal)
            </span>
          </div>

          <div className="absolute bottom-4 left-4 z-10 max-w-xs p-3 bg-black/90 border border-gray-800 rounded-lg text-xs">
            <h4 className="font-bold text-[#00f2fe] mb-1 flex items-center gap-1">
              <Activity size={12} /> Selection Controller
            </h4>
            <p className="text-gray-400">Click a node to select A. Click another to select B to explain connections.</p>
            <div className="mt-2 text-gray-200">
              <div className="truncate">Node A: <span className="text-[#ff8177] font-semibold">{selectedNodeA || "(None)"}</span></div>
              <div className="truncate">Node B: <span className="text-[#4facfe] font-semibold">{selectedNodeB || "(None)"}</span></div>
            </div>
            {(selectedNodeA || selectedNodeB) && (
              <button 
                onClick={clearSelection} 
                className="mt-2 w-full text-center text-[10px] text-red-400 hover:text-red-300 border border-red-500/20 bg-red-500/5 py-1 rounded"
              >
                Clear Selections
              </button>
            )}
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            className="bg-[#040409]"
          >
            <Background color="#1f2937" gap={18} />
            <Controls className="fill-white" />
            <MiniMap 
              nodeColor={(n) => {
                const colors: Record<string, string> = {
                  person: "#4facfe",
                  meeting: "#a18cd1",
                  idea: "#ff8177",
                  decision: "#f9d423",
                  commit: "#4caf50",
                  project: "#ec4899"
                };
                return colors[n.type || ""] || "#9ca3af";
              }}
              className="bg-black/90 rounded border border-gray-800"
            />
          </ReactFlow>
        </section>

        {/* SIDE PANELS (REASONING & CONFIG) */}
        <section className="lg:col-span-4 flex flex-col h-[680px]">
          {/* TAB HEADERS */}
          <div className="flex border-b border-gray-800 bg-[#0d0d17]/40 rounded-t-lg">
            <button
              onClick={() => setActiveTab("explain")}
              className={`flex-1 py-3 text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 transition-colors ${activeTab === "explain" ? "border-b-2 border-[#5f3bf6] text-[#00f2fe]" : "text-gray-400 hover:text-gray-200"}`}
            >
              <HelpCircle size={14} /> Explain
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex-1 py-3 text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 transition-colors ${activeTab === "timeline" ? "border-b-2 border-[#5f3bf6] text-[#00f2fe]" : "text-gray-400 hover:text-gray-200"}`}
            >
              <Clock size={14} /> Timeline
            </button>
            <button
              onClick={() => setActiveTab("keys")}
              className={`flex-1 py-3 text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 transition-colors ${activeTab === "keys" ? "border-b-2 border-[#5f3bf6] text-[#00f2fe]" : "text-gray-400 hover:text-gray-200"}`}
            >
              <Key size={14} /> Keys
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="flex-1 glass-panel rounded-t-none p-4 overflow-y-auto bg-[#0d0d17]/80 flex flex-col">
            
            {/* TAB: EXPLAIN CONNECTIONS */}
            {activeTab === "explain" && (
              <div className="flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#5f3bf6]" /> Relationship Explainer
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Select two nodes on the left canvas to ask Claude to explain their causal or structural relationship.</p>
                </div>

                <div className="flex-1 border border-gray-800/60 rounded-lg p-3 bg-black/40 flex flex-col justify-between mb-4">
                  {explanation ? (
                    <div className="text-sm text-gray-300 overflow-y-auto whitespace-pre-wrap leading-relaxed max-h-[400px]">
                      {explanation}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 text-center my-auto">
                      Select two nodes in the graph view and press the button below.
                    </div>
                  )}
                </div>

                <button
                  onClick={runExplanation}
                  disabled={isExplaining || !selectedNodeA || !selectedNodeB}
                  className="glow-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-lg disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Sparkles size={16} />
                  {isExplaining ? "Analyzing..." : "Explain Relationship"}
                </button>
              </div>
            )}

            {/* TAB: TEMPORAL TIMELINE HISTORY */}
            {activeTab === "timeline" && (
              <div className="flex flex-col flex-1">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                    <Clock size={16} className="text-[#f59e0b]" /> Chronological World History
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Causal evolution of decisions, code commits, and project milestones.</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {timeline.length > 0 ? (
                    timeline.map((item, idx) => (
                      <div key={item.id} className="relative pl-6 border-l border-gray-800">
                        {/* Bullet indicators */}
                        <span 
                          className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border border-black"
                          style={{
                            backgroundColor: `var(--color-${item.type.toLowerCase()}, var(--accent-primary))`
                          }}
                        ></span>
                        <div className="text-[10px] text-[#f59e0b] font-mono">{item.display_date}</div>
                        <div className="text-sm font-semibold text-gray-200 mt-0.5">{item.name}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">{item.type}</div>
                        
                        {item.causes && item.causes.length > 0 && (
                          <div className="mt-1.5 bg-black/30 p-2 rounded border border-gray-800/40 text-xs">
                            {item.causes.map((c: any, cidx: number) => (
                              <div key={cidx} className="flex items-start gap-1 text-[11px] text-gray-300">
                                <Link2 size={12} className="text-[#00f2fe] mt-0.5 flex-shrink-0" />
                                <span>
                                  Led to <strong className="text-gray-100">{c.target_name}</strong>: {c.description}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 text-center py-10">
                      No chronological history synced yet. Click 'Sync Workspace' to build the world history logs.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: DEV KEYS & SETTINGS */}
            {activeTab === "keys" && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                      <Key size={16} className="text-[#00f2fe]" /> developer Access Keys
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Configure development secret access keys used locally by the parsers. Keys are stored safely in browser localStorage.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">Metaphor Internal API Key</label>
                      <input 
                        type="password" 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full text-sm bg-black/60 border border-gray-800 rounded p-2 text-gray-200 focus:outline-none focus:border-[#5f3bf6]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">Notion Integration Token</label>
                      <input 
                        type="password" 
                        value={notionToken}
                        onChange={(e) => setNotionToken(e.target.value)}
                        placeholder="secret_..."
                        className="w-full text-sm bg-black/60 border border-gray-800 rounded p-2 text-gray-200 focus:outline-none focus:border-[#5f3bf6]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">GitHub Personal Access Token (PAT)</label>
                      <input 
                        type="password" 
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        placeholder="ghp_..."
                        className="w-full text-sm bg-black/60 border border-gray-800 rounded p-2 text-gray-200 focus:outline-none focus:border-[#5f3bf6]" 
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveKeys}
                  className="glow-btn w-full flex items-center justify-center gap-2 py-2 rounded-lg"
                >
                  <Key size={16} /> Save Configuration
                </button>
              </div>
            )}

          </div>
        </section>
      </div>
    </main>
  );
}
