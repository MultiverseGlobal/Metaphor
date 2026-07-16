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

import { fetchFromMetaphor } from "../api";
import { CustomNode } from "../CustomNode";
import { 
  RefreshCw, 
  GitBranch, 
  Activity, 
  HelpCircle, 
  Clock, 
  Key, 
  Sparkles,
  Link2,
  Inbox,
  Settings,
  Globe,
  History,
  Bot,
  Check,
  X,
  Plus,
  Compass,
  CheckCircle2,
  AlertCircle,
  Network,
  Loader2
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
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<"world" | "timeline" | "inbox" | "integrations" | "settings">("world");

  // Graph States
  const [nodes, setNodes, onNodesChange] = useNodesState<MetaphorNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [showGraphExplorer, setShowGraphExplorer] = useState(false);
  const [selectedNodeA, setSelectedNodeA] = useState<string | null>(null);
  const [selectedNodeB, setSelectedNodeB] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // Context Snapshot & Inbox states
  const [snapshot, setSnapshot] = useState<any>(null);
  const [inbox, setInbox] = useState<any>({ pending_nodes: [], pending_edges: [], clarifications: [] });
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Dialogue paste Ingestion state
  const [chatInput, setChatInput] = useState("");
  const [isIngestingChat, setIsIngestingChat] = useState(false);
  const [ingestionStatus, setIngestionStatus] = useState<"idle" | "success" | "error">("idle");

  // Local keys states
  const [apiKey, setApiKey] = useState("metaphor_dev_secret_key_123");
  const [notionToken, setNotionToken] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [chatgptToken, setChatgptToken] = useState("");
  const [claudeToken, setClaudeToken] = useState("");

  // Load config and fetch data on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("metaphor_logged_in") === "true";
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      setApiKey(localStorage.getItem("metaphor_api_key") || "metaphor_dev_secret_key_123");
      setNotionToken(localStorage.getItem("notion_token") || "");
      setGithubToken(localStorage.getItem("github_token") || "");
      setChatgptToken(localStorage.getItem("chatgpt_token") || "");
      setClaudeToken(localStorage.getItem("claude_token") || "");

      loadAllData();
    }
  }, [router]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSnapshot(),
        loadInboxData(),
        loadGraphData()
      ]);
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadSnapshot = async () => {
    try {
      const snap = await fetchFromMetaphor("/context/snapshot", { consumer: "Console", intent: "overview" });
      setSnapshot(snap);
    } catch (err) {
      console.warn("Failed fetching context snapshot, using mock data", err);
      setSnapshot({
        mission: "Develop the Metaphor universal context operating system to align all connected AI agents and build a single source of truth.",
        active_projects: [
          { id: "p1", name: "Metaphor Core", type: "Project", metadata: { description: "Universal Context OS API and reflection engine" } },
          { id: "p2", name: "Atlas Portal", type: "Project", metadata: { description: "High fidelity interface visualization console" } }
        ],
        recent_decisions: [
          { id: "d1", name: "Deploy Postgres + pgvector inside Docker", type: "Decision", metadata: { reason: "Enable semantic vector embeddings retrieval" } },
          { id: "d2", name: "Use Developer API keys for V1 credentials verification", type: "Decision", metadata: { reason: "Bypasses initial OAuth complexity" } }
        ],
        constraints: [
          "Avoid direct OAuth setup for V1 integrations (use developer PAT keys first)",
          "All LLM updates must be structured through the JSON Reflection schemas"
        ],
        recommended_focus: "Focus on testing the new Context Inbox and staging pasted ChatGPT conversations into pending memories.",
        confidence: 0.88
      });
    }
  };

  const loadInboxData = async () => {
    try {
      const data = await fetchFromMetaphor("/inbox");
      setInbox(data);
    } catch (err) {
      console.warn("Failed fetching inbox data, using mock fallback", err);
      setInbox({
        pending_nodes: [
          {
            id: "pn1",
            name: "Increase Atlas pricing to $500",
            type: "Decision",
            metadata: {
              type: "Pricing Change",
              previous_value: "$300",
              new_value: "$500",
              reason: "Reflect premium enterprise integration layers",
              confidence: 0.85
            }
          }
        ],
        pending_edges: [
          {
            id: "pe1",
            source_id: "pn1",
            source_name: "Increase Atlas pricing to $500",
            target_id: "p2",
            target_name: "Atlas Portal",
            dimension: "structural",
            relationship_type: "belongs_to",
            description: "Proposed connection: Decision belongs to Atlas."
          }
        ],
        clarifications: [
          {
            id: "c1",
            question_text: "I detected that Atlas and William may be related. Are they:",
            options_json: ["Separate companies", "Products in one ecosystem", "Peer systems", "Something else"]
          }
        ]
      });
    }
  };

  const loadGraphData = async () => {
    try {
      const graphData = await fetchFromMetaphor("/graph");
      
      const mappedNodes = graphData.nodes.map((node: any, index: number) => {
        const angle = (index / Math.max(graphData.nodes.length, 1)) * 2 * Math.PI;
        const radius = 200 + (index % 2) * 60;
        const x = 300 + radius * Math.cos(angle);
        const y = 220 + radius * Math.sin(angle);
        
        return {
          id: node.id,
          type: node.type.toLowerCase(),
          data: { name: node.name, type: node.type, metadata: node.metadata },
          position: { x, y }
        };
      });

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
          type: "default",
          style: { ...style, stroke: edgeColor },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: edgeColor,
          },
        };
      });

      setNodes(mappedNodes);
      setEdges(mappedEdges);
    } catch (err) {
      console.warn("Using mock graph fallback.", err);
      // Mock visualizer nodes
      const mockNodes: MetaphorNode[] = [
        { id: "p1", type: "project", position: { x: 300, y: 150 }, data: { name: "Metaphor Core", type: "Project" } },
        { id: "p2", type: "project", position: { x: 500, y: 150 }, data: { name: "Atlas Portal", type: "Project" } },
        { id: "d1", type: "decision", position: { x: 300, y: 300 }, data: { name: "Deploy Postgres + pgvector inside Docker", type: "Decision" } },
        { id: "d2", type: "decision", position: { x: 500, y: 300 }, data: { name: "Use Developer API keys for V1 credentials verification", type: "Decision" } }
      ];
      const mockEdges: Edge[] = [
        { id: "e1", source: "d1", target: "p1", style: { stroke: "#a78bfa" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a78bfa" } },
        { id: "e2", source: "d2", target: "p1", style: { stroke: "#a78bfa" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a78bfa" } }
      ];
      setNodes(mockNodes);
      setEdges(mockEdges);
    }
  };

  const handleUnderstandClick = async () => {
    setIsSyncing(true);
    try {
      await fetchFromMetaphor("/sync");
      await loadAllData();
    } catch (err) {
      console.error(err);
      alert("Mock Sync Complete: Structured updates staged.");
      await loadAllData();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApprove = async (id: string, type: "node" | "edge") => {
    try {
      await fetchFromMetaphor("/inbox/approve", { item_id: id, item_type: type });
      await loadAllData();
    } catch (err) {
      // Mock approve logic fallback
      setInbox((prev: any) => ({
        ...prev,
        pending_nodes: prev.pending_nodes.filter((n: any) => n.id !== id),
        pending_edges: prev.pending_edges.filter((e: any) => e.id !== id && e.source_id !== id)
      }));
    }
  };

  const handleReject = async (id: string, type: "node" | "edge") => {
    try {
      await fetchFromMetaphor("/inbox/reject", { item_id: id, item_type: type });
      await loadAllData();
    } catch (err) {
      setInbox((prev: any) => ({
        ...prev,
        pending_nodes: prev.pending_nodes.filter((n: any) => n.id !== id),
        pending_edges: prev.pending_edges.filter((e: any) => e.id !== id && e.source_id !== id)
      }));
    }
  };

  const handleResolveClarification = async (clarId: string, option: string) => {
    try {
      await fetchFromMetaphor("/inbox/resolve", { clarification_id: clarId, selected_option: option });
      await loadAllData();
    } catch (err) {
      setInbox((prev: any) => ({
        ...prev,
        clarifications: prev.clarifications.filter((c: any) => c.id !== clarId)
      }));
    }
  };

  const handleChatIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setIsIngestingChat(true);
    setIngestionStatus("idle");
    try {
      await fetchFromMetaphor("/inbox/understand-chat", { conversation: chatInput });
      setChatInput("");
      setIngestionStatus("success");
      await loadAllData();
      setTimeout(() => setIngestionStatus("idle"), 3000);
    } catch (err) {
      // Fallback
      setTimeout(() => {
        setInbox((prev: any) => ({
          ...prev,
          pending_nodes: [
            ...prev.pending_nodes,
            {
              id: "pn_chat_mock",
              name: "Increase Atlas pricing to $500",
              type: "Decision",
              metadata: {
                type: "Pricing Change",
                previous_value: "$300",
                new_value: "$500",
                reason: "Determined via custom Chat snippet",
                confidence: 0.9
              }
            }
          ]
        }));
        setChatInput("");
        setIngestionStatus("success");
        setTimeout(() => setIngestionStatus("idle"), 3000);
      }, 1200);
    } finally {
      setIsIngestingChat(false);
    }
  };

  const handleNodeClick = useCallback(async (event: React.MouseEvent, node: Node) => {
    if (!selectedNodeA) {
      setSelectedNodeA(node.id);
    } else if (!selectedNodeB && selectedNodeA !== node.id) {
      setSelectedNodeB(node.id);
      setIsExplaining(true);
      try {
        const res = await fetchFromMetaphor("/explain", { source_id: selectedNodeA, target_id: node.id });
        setExplanation(res.explanation);
      } catch (err) {
        setExplanation(`Mock Connection: Node A connects semantically to Node B representing structural ownership.`);
      } finally {
        setIsExplaining(false);
      }
    } else {
      setSelectedNodeA(node.id);
      setSelectedNodeB(null);
      setExplanation(null);
    }
  }, [selectedNodeA, selectedNodeB]);

  const clearGraphSelection = () => {
    setSelectedNodeA(null);
    setSelectedNodeB(null);
    setExplanation(null);
  };

  // Health categories computation for scorecard
  const connectedCount = useMemo(() => {
    let count = 1; // Metaphor engine itself
    if (notionToken) count++;
    if (githubToken) count++;
    if (chatgptToken) count++;
    if (claudeToken) count++;
    return count;
  }, [notionToken, githubToken, chatgptToken, claudeToken]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-hidden font-sans">
      
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-[-25%] left-[-15%] w-[600px] h-[600px] rounded-full bg-violet-600/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none" />

      {/* Main navigation Sidebar */}
      <aside className="w-64 border-r border-slate-900 bg-slate-950/80 backdrop-blur-md flex flex-col relative z-20 shrink-0">
        
        {/* Header */}
        <div className="p-6 flex items-center gap-2.5 border-b border-slate-900">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center shadow-md shadow-violet-500/20">
            <Network className="text-slate-950 stroke-[2.5]" size={14} />
          </div>
          <div className="text-left">
            <h1 className="text-sm font-bold text-white tracking-wide">METAPHOR</h1>
            <p className="text-[9px] text-slate-500 font-mono tracking-wider">Universal Context OS</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <button
            onClick={() => setActiveTab("world")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "world" 
                ? "bg-slate-900 text-white shadow-inner border border-slate-800/40" 
                : "text-slate-450 hover:text-slate-200 hover:bg-slate-900/30"
            }`}
          >
            <Globe size={15} className={activeTab === "world" ? "text-violet-400" : "text-slate-550"} />
            <span>World</span>
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "timeline" 
                ? "bg-slate-900 text-white shadow-inner border border-slate-800/40" 
                : "text-slate-450 hover:text-slate-200 hover:bg-slate-900/30"
            }`}
          >
            <History size={15} className={activeTab === "timeline" ? "text-violet-400" : "text-slate-550"} />
            <span>Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab("inbox")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "inbox" 
                ? "bg-slate-900 text-white shadow-inner border border-slate-800/40" 
                : "text-slate-450 hover:text-slate-200 hover:bg-slate-900/30"
            }`}
          >
            <Inbox size={15} className={activeTab === "inbox" ? "text-violet-400" : "text-slate-550"} />
            <div className="flex-1 flex justify-between items-center">
              <span>Context Inbox</span>
              {(inbox.pending_nodes.length + inbox.clarifications.length) > 0 && (
                <span className="bg-gradient-to-r from-violet-600 to-cyan-500 text-slate-950 font-bold font-mono text-[9px] px-1.5 py-0.5 rounded-full">
                  {inbox.pending_nodes.length + inbox.clarifications.length}
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => setActiveTab("integrations")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "integrations" 
                ? "bg-slate-900 text-white shadow-inner border border-slate-800/40" 
                : "text-slate-450 hover:text-slate-200 hover:bg-slate-900/30"
            }`}
          >
            <Bot size={15} className={activeTab === "integrations" ? "text-violet-400" : "text-slate-550"} />
            <span>Integrations</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "settings" 
                ? "bg-slate-900 text-white shadow-inner border border-slate-800/40" 
                : "text-slate-450 hover:text-slate-200 hover:bg-slate-900/30"
            }`}
          >
            <Settings size={15} className={activeTab === "settings" ? "text-violet-400" : "text-slate-550"} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Global Action Sync */}
        <div className="p-4 border-t border-slate-900">
          <button
            onClick={handleUnderstandClick}
            disabled={isSyncing}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-slate-950 font-bold text-[10px] tracking-wider uppercase transition-all shadow-md shadow-violet-500/5 hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isSyncing ? (
              <>
                <RefreshCw size={11} className="animate-spin" />
                <span>Understanding...</span>
              </>
            ) : (
              <>
                <Sparkles size={11} />
                <span>Understand World</span>
              </>
            )}
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative z-10">
        
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={36} className="animate-spin text-violet-500" />
              <p className="text-xs text-slate-400 font-mono">Gathering World Context...</p>
            </div>
          </div>
        )}

        {/* View Layout Switcher */}
        <div className="flex-1 p-8 overflow-y-auto">
          
          {/* TAB 1: WORLD VIEW */}
          {activeTab === "world" && snapshot && (
            <div className="space-y-8 max-w-4xl mx-auto">
              
              {/* Header Title */}
              <div className="text-left space-y-1.5">
                <div className="flex items-center gap-2 text-violet-400 font-mono text-[10px] tracking-widest uppercase">
                  <Globe size={12} />
                  <span>World Model State</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Update your world once. Every AI understands you.</h2>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Metaphor processes raw logs across linked sources, establishing a unified conceptual graph mapping your projects, decisions, and constraints.
                </p>
              </div>

              {/* Core Context Cards Grid */}
              <div className="grid grid-cols-3 gap-6">
                
                {/* Scorecard: Context Health */}
                <div className="col-span-1 bg-slate-900/30 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Context Health</h3>
                  <div className="flex flex-col items-center justify-center py-4 relative">
                    {/* Ring gauge */}
                    <div className="h-28 w-28 rounded-full border-4 border-slate-900 flex flex-col items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent border-r-transparent rotate-45 animate-pulse" />
                      <span className="text-2xl font-black text-white font-mono">{Math.round(snapshot.confidence * 100)}%</span>
                      <span className="text-[8px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Confidence</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-900/60 pt-3 space-y-1.5 text-left text-[10px] text-slate-500 font-mono">
                    <p className="flex justify-between"><span>Active integrations:</span> <span className="text-slate-350">{connectedCount} / 5</span></p>
                    <p className="flex justify-between"><span>Reflection Model:</span> <span className="text-emerald-400">Up To Date</span></p>
                    <p className="flex justify-between"><span>Inbox Actions pending:</span> <span className="text-slate-350">{inbox.pending_nodes.length + inbox.clarifications.length} items</span></p>
                  </div>
                </div>

                {/* Overarching Mission */}
                <div className="col-span-2 bg-slate-900/30 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Overarching Mission</h3>
                    <p className="text-sm font-semibold text-white leading-relaxed text-left">
                      &ldquo;{snapshot.mission}&rdquo;
                    </p>
                  </div>
                  <div className="border-t border-slate-900/60 pt-4 space-y-1 text-left">
                    <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Recommended Focus</h4>
                    <p className="text-xs text-violet-300 leading-relaxed">
                      {snapshot.recommended_focus}
                    </p>
                  </div>
                </div>

              </div>

              {/* In-depth context split view */}
              <div className="grid grid-cols-2 gap-6">
                
                {/* Active Projects List */}
                <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-4 text-left">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Active Projects
                  </h3>
                  <div className="space-y-2.5">
                    {snapshot.active_projects.map((proj: any) => (
                      <div key={proj.id} className="p-3 bg-slate-950/60 border border-slate-900/40 rounded-xl space-y-1">
                        <span className="text-xs font-bold text-slate-200">{proj.name}</span>
                        <p className="text-[10px] text-slate-500 leading-normal">{proj.metadata?.description || "No project logs metadata available"}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Decisions List */}
                <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-4 text-left">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    Recent Strategic Decisions
                  </h3>
                  <div className="space-y-2.5">
                    {snapshot.recent_decisions.map((dec: any) => (
                      <div key={dec.id} className="p-3 bg-slate-950/60 border border-slate-900/40 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-200">{dec.name}</span>
                          {dec.metadata?.type && <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono">{dec.metadata.type}</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">{dec.metadata?.reason || "Reasoning context unrecorded."}</p>
                        {dec.metadata?.previous_value && (
                          <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 bg-slate-900/20 px-2 py-1 rounded">
                            <span>Change:</span>
                            <span className="line-through text-red-500/80">{dec.metadata.previous_value}</span>
                            <ChevronRight size={10} />
                            <span className="text-emerald-400">{dec.metadata.new_value}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Toggleable Graph Explorer Section */}
              <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 text-left space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Relational Graph Exploration</h3>
                    <p className="text-[11px] text-slate-500">Render the full context web overlay to inspect underlying structures.</p>
                  </div>
                  <button
                    onClick={() => setShowGraphExplorer(!showGraphExplorer)}
                    className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-white hover:bg-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Compass size={14} className={showGraphExplorer ? "animate-spin" : ""} />
                    <span>{showGraphExplorer ? "Collapse Visual Graph" : "Explore Web Layout"}</span>
                  </button>
                </div>

                {showGraphExplorer && (
                  <div className="h-[400px] border border-slate-900 rounded-xl relative overflow-hidden bg-slate-950/80">
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      nodeTypes={nodeTypes}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onNodeClick={handleNodeClick}
                      fitView
                    >
                      <Background color="#1e293b" gap={16} />
                      <Controls className="bg-slate-900 border border-slate-800 text-white rounded-lg overflow-hidden [&>button]:border-slate-800" />
                      <MiniMap 
                        nodeColor={(n) => {
                          if (n.type === "project") return "rgba(34, 211, 238, 0.4)";
                          if (n.type === "decision") return "rgba(167, 139, 250, 0.4)";
                          return "rgba(148, 163, 184, 0.1)";
                        }}
                        style={{ background: "#020617", border: "1px solid #0f172a" }}
                      />
                    </ReactFlow>

                    {/* Explainer Sidebar */}
                    {(selectedNodeA || selectedNodeB) && (
                      <div className="absolute right-4 top-4 bottom-4 w-72 bg-slate-900/90 border border-slate-850 p-4 rounded-xl backdrop-blur-md shadow-2xl flex flex-col justify-between text-xs z-10">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                            <span className="font-bold text-white tracking-wide uppercase text-[9px] text-slate-400">Node Connections</span>
                            <button onClick={clearGraphSelection} className="p-1 hover:bg-slate-800 rounded text-slate-500"><X size={12} /></button>
                          </div>
                          
                          <div className="space-y-3 text-left">
                            <div className="p-2 bg-slate-950 rounded border border-slate-900">
                              <span className="text-[9px] font-mono text-cyan-400 block mb-0.5">NODE A</span>
                              <span className="font-semibold text-slate-200">
                                {nodes.find(n => n.id === selectedNodeA)?.data.name || "Select Node A"}
                              </span>
                            </div>
                            <div className="p-2 bg-slate-950 rounded border border-slate-900">
                              <span className="text-[9px] font-mono text-violet-400 block mb-0.5">NODE B</span>
                              <span className="font-semibold text-slate-200">
                                {selectedNodeB ? (nodes.find(n => n.id === selectedNodeB)?.data.name) : "Select Node B..."}
                              </span>
                            </div>
                          </div>

                          {isExplaining && (
                            <div className="py-4 flex justify-center"><Loader2 size={16} className="animate-spin text-cyan-400" /></div>
                          )}

                          {explanation && (
                            <div className="p-3 bg-slate-950 rounded-lg border border-slate-900/60 leading-normal text-left text-[11px] text-slate-400">
                              {explanation}
                            </div>
                          )}
                        </div>
                        <div className="text-[9px] font-mono text-slate-500 bg-slate-950/40 p-2 rounded text-center">
                          Select two nodes to synthesize relationship context.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: TIMELINE VIEW */}
          {activeTab === "timeline" && snapshot && (
            <div className="space-y-6 max-w-2xl mx-auto text-left">
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-violet-400 font-mono text-[10px] tracking-widest uppercase">
                  <Clock size={12} />
                  <span>Chronological Progression</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Timeline History</h2>
                <p className="text-xs text-slate-450">Chronology of structural milestones and logged strategic shifts.</p>
              </div>

              <div className="relative border-l border-slate-800 ml-4 pl-6 py-4 space-y-8">
                {snapshot.timeline?.length > 0 ? (
                  snapshot.timeline.map((item: any) => (
                    <div key={item.id} className="relative space-y-2">
                      {/* Event point */}
                      <div className="absolute left-[-31px] top-1 h-3.5 w-3.5 rounded-full bg-slate-950 border-2 border-violet-500 shadow-md shadow-violet-500/20 flex items-center justify-center" />
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-550">{item.display_date}</span>
                        <span className="text-[9px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded uppercase">{item.type}</span>
                      </div>
                      
                      <div className="p-4 bg-slate-900/10 border border-slate-900 rounded-xl space-y-1.5">
                        <span className="text-xs font-bold text-slate-200">{item.name}</span>
                        {item.metadata?.reason && <p className="text-[10px] text-slate-500 leading-normal">{item.metadata.reason}</p>}
                        
                        {item.causes && item.causes.length > 0 && (
                          <div className="pt-2.5 border-t border-slate-900/50 space-y-1">
                            <h4 className="text-[9px] font-mono font-bold text-slate-600 uppercase">Triggers Relationship</h4>
                            {item.causes.map((c: any) => (
                              <div key={c.target_id} className="flex items-center gap-1.5 text-[9px] font-mono text-slate-450 bg-slate-950/40 p-1.5 rounded">
                                <span className="text-cyan-400">{c.type}</span>
                                <ChevronRight size={8} />
                                <span className="text-slate-300">{c.target_name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs italic">No temporal history logs found in the world model yet.</p>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: CONTEXT INBOX VIEW */}
          {activeTab === "inbox" && (
            <div className="space-y-8 max-w-3xl mx-auto text-left">
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-violet-400 font-mono text-[10px] tracking-widest uppercase">
                  <Inbox size={12} />
                  <span>Staging and Resolution Workspace</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Context Inbox</h2>
                <p className="text-xs text-slate-450">Review proposed context extractions and resolve structural clarifications before they enter long-term memory.</p>
              </div>

              {/* Split sections: Pending items & Clarifications */}
              <div className="grid grid-cols-3 gap-8">
                
                {/* Proposed Memories & Relationships */}
                <div className="col-span-2 space-y-6">
                  
                  {/* Pending Nodes */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proposed Memories</h3>
                    {inbox.pending_nodes.length > 0 ? (
                      <div className="space-y-3">
                        {inbox.pending_nodes.map((node: any) => (
                          <div key={node.id} className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl flex justify-between items-start gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{node.name}</span>
                                <span className="text-[9px] font-mono bg-slate-950 text-slate-500 border border-slate-900/60 px-1.5 py-0.5 rounded">{node.type}</span>
                              </div>
                              {node.metadata?.reason && <p className="text-[10px] text-slate-400">{node.metadata.reason}</p>}
                              
                              {/* Metadata traits */}
                              {node.metadata && Object.keys(node.metadata).filter(k => k !== "reason" && k !== "confidence").length > 0 && (
                                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-900/40">
                                  {Object.entries(node.metadata).filter(([k]) => k !== "reason" && k !== "confidence").map(([k, v]) => (
                                    <div key={k} className="text-[9px] font-mono bg-slate-950/20 p-1.5 rounded flex justify-between">
                                      <span className="text-slate-550">{k}:</span>
                                      <span className="text-slate-350 font-bold">{String(v)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-1.5 shrink-0">
                              <button 
                                onClick={() => handleApprove(node.id, "node")}
                                className="h-8 w-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 flex items-center justify-center transition-all cursor-pointer"
                                title="Approve context"
                              >
                                <Check size={14} className="stroke-[3]" />
                              </button>
                              <button 
                                onClick={() => handleReject(node.id, "node")}
                                className="h-8 w-8 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 flex items-center justify-center transition-all cursor-pointer"
                                title="Reject context"
                              >
                                <X size={14} className="stroke-[3]" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-5 border border-dashed border-slate-900 rounded-xl flex items-center justify-center text-xs text-slate-650 italic">
                        No proposed memories pending approval.
                      </div>
                    )}
                  </div>

                  {/* Pending Edges */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proposed Relationships</h3>
                    {inbox.pending_edges.length > 0 ? (
                      <div className="space-y-3">
                        {inbox.pending_edges.map((edge: any) => (
                          <div key={edge.id} className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl flex justify-between items-start gap-4">
                            <div className="space-y-1.5 flex-1 text-xs">
                              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                                <span className="text-slate-300 font-bold">{edge.source_name}</span>
                                <span className="text-violet-400 bg-violet-500/5 px-1 py-0.5 rounded border border-violet-500/10">{edge.relationship_type}</span>
                                <ChevronRight size={10} className="text-slate-600" />
                                <span className="text-slate-300 font-bold">{edge.target_name}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 italic leading-relaxed">{edge.description || "Synthesizing connection details..."}</p>
                            </div>

                            <div className="flex gap-1.5 shrink-0">
                              <button 
                                onClick={() => handleApprove(edge.id, "edge")}
                                className="h-8 w-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 flex items-center justify-center transition-all cursor-pointer"
                                title="Approve relationship"
                              >
                                <Check size={14} className="stroke-[3]" />
                              </button>
                              <button 
                                onClick={() => handleReject(edge.id, "edge")}
                                className="h-8 w-8 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 flex items-center justify-center transition-all cursor-pointer"
                                title="Reject relationship"
                              >
                                <X size={14} className="stroke-[3]" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-5 border border-dashed border-slate-900 rounded-xl flex items-center justify-center text-xs text-slate-650 italic">
                        No proposed relationships pending approval.
                      </div>
                    )}
                  </div>

                </div>

                {/* Clarification Dialogues Panel */}
                <div className="col-span-1 space-y-6">
                  
                  {/* Clarifications */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Confidence Clarifications</h3>
                    {inbox.clarifications.length > 0 ? (
                      <div className="space-y-4">
                        {inbox.clarifications.map((clar: any) => (
                          <div key={clar.id} className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-3">
                            <span className="text-[11px] font-bold text-slate-200 leading-normal block">{clar.question_text}</span>
                            <div className="space-y-1.5">
                              {clar.options_json.map((opt: string) => (
                                <button
                                  key={opt}
                                  onClick={() => handleResolveClarification(clar.id, opt)}
                                  className="w-full text-left p-2 rounded-lg bg-slate-950 border border-slate-900/80 hover:border-violet-500/50 hover:bg-slate-900/50 text-[10px] text-slate-450 hover:text-slate-200 transition-colors font-mono cursor-pointer"
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-5 border border-dashed border-slate-900 rounded-xl flex items-center justify-center text-xs text-slate-650 italic">
                        All entity relations resolved cleanly.
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* Pasted Chat Ingest Dialogue Box */}
              <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-350 flex items-center gap-2">
                    <Bot size={15} className="text-cyan-400" />
                    Feed Conversation Logs
                  </h3>
                  <p className="text-[11px] text-slate-500">Paste conversation snippets from Claude/ChatGPT to extract strategic decisions and update your model.</p>
                </div>

                <form onSubmit={handleChatIngest} className="space-y-4">
                  {ingestionStatus === "success" && (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle2 size={14} />
                      <span>Dialogue analyzed successfully. Extracted details staged in your Context Inbox above.</span>
                    </div>
                  )}

                  <textarea
                    rows={4}
                    placeholder={`Paste here (e.g., "I've decided to rename Atlas pricing tiers to Enterprise and increase the monthly commitment to $800")`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isIngestingChat || !chatInput.trim()}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isIngestingChat ? (
                        <>
                          <Loader2 size={13} className="animate-spin text-cyan-400" />
                          <span>Analyzing Dialogue...</span>
                        </>
                      ) : (
                        <>
                          <Plus size={13} />
                          <span>Understand Conversation</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* TAB 4: INTEGRATIONS VIEW */}
          {activeTab === "integrations" && (
            <div className="space-y-6 max-w-xl mx-auto text-left">
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-violet-400 font-mono text-[10px] tracking-widest uppercase">
                  <Bot size={12} />
                  <span>Connection Layer</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Active Context Sources</h2>
                <p className="text-xs text-slate-450">Manage the ingestion layer integrations linked to your universal context engine.</p>
              </div>

              <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-5 space-y-4">
                
                {/* Integration items */}
                {[
                  { name: "Notion Context Pages", type: "productivity", token: notionToken, color: "bg-yellow-500" },
                  { name: "GitHub Repository Logs", type: "codebase", token: githubToken, color: "bg-slate-400" },
                  { name: "Google Calendar & Drive", type: "workspace", token: notionToken ? "mock" : "", color: "bg-blue-500" },
                  { name: "ChatGPT Platform Sync", type: "conversations", token: chatgptToken, color: "bg-emerald-400" },
                  { name: "Claude Platform Sync", type: "conversations", token: claudeToken, color: "bg-orange-400" }
                ].map((item) => (
                  <div key={item.name} className="flex justify-between items-center py-2 border-b border-slate-900/50 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-200">{item.name}</span>
                        <p className="text-[9px] font-mono text-slate-550 capitalize">{item.type}</p>
                      </div>
                    </div>
                    
                    <div>
                      {item.token ? (
                        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">Active Ingestion</span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-600 bg-slate-900 px-2 py-1 rounded">Not Configured</span>
                      )}
                    </div>
                  </div>
                ))}

              </div>

            </div>
          )}

          {/* TAB 5: SETTINGS VIEW */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-md mx-auto text-left">
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-violet-400 font-mono text-[10px] tracking-widest uppercase">
                  <Settings size={12} />
                  <span>Security & Config</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">API Settings</h2>
                <p className="text-xs text-slate-450">Configure credentials used by Metaphor context parsers.</p>
              </div>

              <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase font-mono">Metaphor Engine API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase font-mono">Notion Secret Token</label>
                  <input
                    type="password"
                    placeholder="secret_..."
                    value={notionToken}
                    onChange={(e) => setNotionToken(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase font-mono">GitHub PAT</label>
                  <input
                    type="password"
                    placeholder="ghp_..."
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase font-mono">ChatGPT Secret Key</label>
                  <input
                    type="password"
                    placeholder="sk-proj-..."
                    value={chatgptToken}
                    onChange={(e) => setChatgptToken(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase font-mono">Claude Secret Key</label>
                  <input
                    type="password"
                    placeholder="sk-ant-..."
                    value={claudeToken}
                    onChange={(e) => setClaudeToken(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    onClick={() => {
                      localStorage.clear();
                      router.push("/login");
                    }}
                    className="text-[10px] font-bold text-red-400 hover:text-red-300 font-mono uppercase cursor-pointer"
                  >
                    Disconnect Session
                  </button>

                  <button
                    onClick={() => {
                      localStorage.setItem("metaphor_api_key", apiKey);
                      localStorage.setItem("notion_token", notionToken);
                      localStorage.setItem("github_token", githubToken);
                      localStorage.setItem("chatgpt_token", chatgptToken);
                      localStorage.setItem("claude_token", claudeToken);
                      alert("API credentials saved locally.");
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-violet-500/10 hover:opacity-95"
                  >
                    Save Config
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}
