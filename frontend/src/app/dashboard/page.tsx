"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge
} from "@xyflow/react";

type MetaphorNode = Node<{
  name: string;
  type: string;
  metadata?: Record<string, any>;
}>;
import "@xyflow/react/dist/style.css";

import { 
  fetchFromMetaphor 
} from "../api";
import { CustomNode } from "../CustomNode";
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
  const router = useRouter();
  
  // Graph States
  const [nodes, setNodes, onNodesChange] = useNodesState<MetaphorNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
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
      const isLoggedIn = localStorage.getItem("metaphor_logged_in") === "true";
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      const savedKey = localStorage.getItem("metaphor_api_key");
      if (savedKey) setApiKey(savedKey);
      
      const savedNotion = localStorage.getItem("notion_token");
      if (savedNotion) setNotionToken(savedNotion);

      const savedGithub = localStorage.getItem("github_token");
      if (savedGithub) setGithubToken(savedGithub);
      
      // Fetch initial graph and timeline
      loadGraphData();
    }
  }, [router]);

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

  // Composer Query State
  const [composerQuery, setComposerQuery] = useState("");

  const handleComposeSubmit = () => {
    if (!composerQuery) return;
    // Auto-search or explain connections matching query entities if present
    // For V1, we search the nodes to see if we can auto-fill selections from query
    const words = composerQuery.toLowerCase();
    let foundA: string | null = null;
    let foundB: string | null = null;

    // Scan node names
    for (const node of nodes) {
      const nameLower = node.data.name.toLowerCase();
      if (words.includes(nameLower)) {
        if (!foundA) {
          foundA = node.data.name;
        } else if (foundA !== node.data.name) {
          foundB = node.data.name;
          break;
        }
      }
    }

    if (foundA && foundB) {
      setSelectedNodeA(foundA);
      setSelectedNodeB(foundB);
      setActiveTab("explain");
      // Trigger explain
      setIsExplaining(true);
      setExplanation("Asking Claude to analyze causal and semantic pathways...");
      fetchFromMetaphor("/explain", {
        node_a_name: foundA,
        node_b_name: foundB
      }).then(data => {
        setExplanation(data.explanation);
        setIsExplaining(false);
      }).catch(err => {
        setExplanation(`Could not explain connection: ${err.message}`);
        setIsExplaining(false);
      });
    } else if (foundA) {
      setSelectedNodeA(foundA);
      alert(`Mapped query to object '${foundA}'. Select a second object to explain relationships.`);
    } else {
      alert("Type a query referencing mapped objects (e.g. 'Sarah Client Sync' or 'Value-based Pricing') to explain their relationship.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col p-4 md:p-6 select-none bg-white relative">
      {/* Background gradient blur container */}
      <div className="grainient-bg"></div>

      {/* HEADER SECTION (TIMBAL STYLING) */}
      <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {/* Logo symbol */}
          <div className="bg-slate-900 text-white p-2 rounded-xl flex items-center justify-center shadow-md">
            <Sparkles className="h-5 w-5 text-[#00f2fe]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                METAPHOR
              </h1>
              <span className="text-[10px] px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-full uppercase tracking-wider font-bold">
                World Modeling
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuously evolving model of the user's world for multi-agent reasoning.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sync Stats badge */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500 mr-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full font-medium">
            <div>
              <span className="text-slate-900 font-bold inline">{nodes.length}</span> Objects Mapped
            </div>
            <div className="border-l border-slate-200 h-4"></div>
            <div>
              <span className="text-slate-900 font-bold inline">{edges.length}</span> Causal Links
            </div>
          </div>
          
          <button 
            onClick={runSync} 
            disabled={isSyncing}
            className={`timbal-btn-primary flex items-center gap-2 ${isSyncing ? "opacity-75" : ""}`}
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing..." : "Sync Workspace"}
          </button>
        </div>
      </header>

      {/* TIMBAL HERO INTRO & COMPOSER CONTAINER */}
      <section className="relative z-10 max-w-4xl mx-auto w-full text-center mb-10 flex flex-col items-center">
        {/* Banner badge */}
        <span className="group inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 py-1 pr-3 pl-1 shadow-sm shadow-slate-100/50 backdrop-blur-xl mb-4">
          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase shadow-sm shadow-blue-600/25">NEW</span>
          <span className="text-[11px] font-semibold text-slate-700">Say hello to Metaphor Compose</span>
        </span>
        
        <h2 className="hero-title max-w-2xl mb-4 font-sans font-medium text-slate-900">
          The end-to-end context layer for <span className="text-blue-600 font-semibold">AI agents</span>
        </h2>
        <p className="mx-auto max-w-lg text-[13px] sm:text-[14px] leading-snug font-medium text-slate-500 mb-8">
          Ask questions, trace commit timelines, and let your models reason over relationships rather than isolated documents.
        </p>

        {/* COMPOSER CARD (TIMBAL COMPOSE STYLE) */}
        <div className="w-full max-w-2xl composer-card p-3 text-left">
          <textarea
            value={composerQuery}
            onChange={(e) => setComposerQuery(e.target.value)}
            className="w-full resize-none border-0 bg-transparent px-1 py-1 font-sans text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[50px]"
            placeholder="Search connections (e.g. 'Sarah Client Sync and Value-based Pricing')..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleComposeSubmit();
              }
            }}
          />
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab("keys")}
                className="timbal-btn-secondary flex items-center gap-1.5"
              >
                <Key size={12} />
                <span>Configure Keys</span>
              </button>
              <button 
                onClick={clearSelection}
                className="timbal-btn-secondary flex items-center gap-1.5"
              >
                <span>Reset View</span>
              </button>
            </div>
            
            <button
              onClick={handleComposeSubmit}
              disabled={!composerQuery}
              className="send-ball transition-opacity duration-200"
              title="Send to Claude"
            >
              <Sparkles size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* DASHBOARD SPLIT GRID */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* GRAPH CANVAS AREA */}
        <section className="lg:col-span-8 timbal-panel h-[600px] overflow-hidden flex flex-col relative bg-[#f8fafc]">
          {/* Dimension badges */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className="px-2.5 py-1 bg-white border border-slate-200 text-[10px] rounded-full text-slate-600 font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span> Structural
            </span>
            <span className="px-2.5 py-1 bg-white border border-slate-200 text-[10px] rounded-full text-[#3b82f6] font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Semantic
            </span>
            <span className="px-2.5 py-1 bg-white border border-slate-200 text-[10px] rounded-full text-[#f59e0b] font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Temporal (Causal)
            </span>
          </div>

          {/* Active selection helper */}
          <div className="absolute bottom-4 left-4 z-10 max-w-xs p-3.5 bg-white border border-slate-200 rounded-2xl text-xs shadow-md">
            <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Activity size={12} className="text-blue-600" /> Selection State
            </h4>
            <p className="text-slate-500 text-[11px] leading-snug">Click graph nodes to configure focus relationships.</p>
            <div className="mt-2.5 space-y-1 text-slate-700">
              <div className="truncate">Node A: <span className="text-[#ea580c] font-bold">{selectedNodeA || "(None)"}</span></div>
              <div className="truncate">Node B: <span className="text-[#0284c7] font-bold">{selectedNodeB || "(None)"}</span></div>
            </div>
            {(selectedNodeA || selectedNodeB) && (
              <button 
                onClick={clearSelection} 
                className="mt-2.5 w-full text-center text-[10px] text-red-500 hover:text-red-600 border border-red-100 bg-red-50/50 py-1.5 rounded-lg font-semibold transition-colors"
              >
                Clear Selection
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
            className="bg-[#f8fafc]"
          >
            <Background color="#cbd5e1" gap={18} />
            <Controls className="fill-slate-700" />
            <MiniMap 
              nodeColor={(n) => {
                const colors: Record<string, string> = {
                  person: "#0284c7",
                  meeting: "#7c3aed",
                  idea: "#ea580c",
                  decision: "#db2777",
                  commit: "#16a34a",
                  project: "#4f46e5"
                };
                return colors[n.type || ""] || "#94a3b8";
              }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm"
            />
          </ReactFlow>
        </section>

        {/* SIDE PANELS (REASONING & CONFIG) */}
        <section className="lg:col-span-4 flex flex-col h-[600px]">
          {/* TAB HEADERS */}
          <div className="flex border-b border-slate-200 bg-slate-50/50 rounded-t-2xl">
            <button
              onClick={() => setActiveTab("explain")}
              className={`flex-1 py-3.5 text-[11px] uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 transition-colors ${activeTab === "explain" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
            >
              <HelpCircle size={13} /> Explain
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex-1 py-3.5 text-[11px] uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 transition-colors ${activeTab === "timeline" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Clock size={13} /> Timeline
            </button>
            <button
              onClick={() => setActiveTab("keys")}
              className={`flex-1 py-3.5 text-[11px] uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 transition-colors ${activeTab === "keys" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Key size={13} /> Keys
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="flex-1 timbal-panel rounded-t-none p-4 overflow-y-auto bg-white flex flex-col">
            
            {/* TAB: EXPLAIN CONNECTIONS */}
            {activeTab === "explain" && (
              <div className="flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-blue-600" /> Relationship Explainer
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Select two nodes on the left canvas to ask Claude to explain their causal or structural relationship.</p>
                </div>

                <div className="flex-1 border border-slate-100 rounded-2xl p-3 bg-slate-50/30 flex flex-col justify-between mb-4 overflow-y-auto max-h-[340px]">
                  {explanation ? (
                    <div className="text-[13px] text-slate-600 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {explanation}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 text-center my-auto">
                      Select two nodes in the graph view and press the button below.
                    </div>
                  )}
                </div>

                <button
                  onClick={runExplanation}
                  disabled={isExplaining || !selectedNodeA || !selectedNodeB}
                  className="timbal-btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Sparkles size={14} />
                  {isExplaining ? "Analyzing..." : "Explain Relationship"}
                </button>
              </div>
            )}

            {/* TAB: TEMPORAL TIMELINE HISTORY */}
            {activeTab === "timeline" && (
              <div className="flex flex-col flex-1">
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-500" /> Chronological Timeline
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Causal evolution of decisions, commits, and milestones.</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[400px]">
                  {timeline.length > 0 ? (
                    timeline.map((item, idx) => (
                      <div key={item.id} className="relative pl-6 border-l border-slate-150">
                        {/* Bullet indicators */}
                        <span 
                          className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm"
                          style={{
                            backgroundColor: `var(--color-${item.type.toLowerCase()}, var(--accent-primary))`
                          }}
                        ></span>
                        <div className="text-[10px] text-amber-600 font-mono font-semibold">{item.display_date}</div>
                        <div className="text-[13px] font-semibold text-slate-950 mt-0.5">{item.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{item.type}</div>
                        
                        {item.causes && item.causes.length > 0 && (
                          <div className="mt-2 bg-slate-50/50 p-2 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                            {item.causes.map((c: any, cidx: number) => (
                              <div key={cidx} className="flex items-start gap-1">
                                <Link2 size={11} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>
                                  Led to <strong className="text-slate-800 font-semibold">{c.target_name}</strong>: {c.description}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 text-center py-10">
                      No chronological history synced yet. Click 'Sync Workspace' to build the world history.
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
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Key size={14} className="text-blue-500" /> developer Keys
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Configure developer access keys. Keys are saved securely in your browser's localStorage.</p>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Metaphor API Key</label>
                      <input 
                        type="password" 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-850 focus:outline-none focus:border-slate-800" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Notion Integration Token</label>
                      <input 
                        type="password" 
                        value={notionToken}
                        onChange={(e) => setNotionToken(e.target.value)}
                        placeholder="secret_..."
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-850 focus:outline-none focus:border-slate-800" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">GitHub Personal Token</label>
                      <input 
                        type="password" 
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        placeholder="ghp_..."
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-850 focus:outline-none focus:border-slate-800" 
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveKeys}
                  className="timbal-btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl"
                >
                  <Key size={14} /> Save Configuration
                </button>
              </div>
            )}

          </div>
        </section>
      </div>
    </main>
  );
}
