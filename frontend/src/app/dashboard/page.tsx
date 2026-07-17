"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Compass, 
  Clock, 
  Inbox, 
  Settings, 
  Globe, 
  RefreshCw, 
  Sparkles,
  Loader2, 
  Check, 
  X, 
  Plus, 
  Sun, 
  BookOpen, 
  Moon, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  FileText,
  Plug,
  CircleDot,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  LogOut,
  ChevronLeft
} from "lucide-react";
import { fetchFromMetaphor } from "../api";

export default function Dashboard() {
  const router = useRouter();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<"maps" | "timeline" | "notifications" | "reports" | "datasources" | "publicpage" | "settings">("maps");
  const [theme, setTheme] = useState<"theme-clean" | "theme-paper" | "theme-dark">("theme-clean");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Maps / Diagnostics state
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [qualitativeNote, setQualitativeNote] = useState("We paused GitHub commits this week to focus on outbound sales.");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosed, setDiagnosed] = useState(false);
  const [roadmapType, setRoadmapType] = useState<"sales" | "reboot">("sales");
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);

  // Loaded Context Data States
  const [snapshot, setSnapshot] = useState<any>(null);
  const [inboxData, setInboxData] = useState<any>({ pending_nodes: [], pending_edges: [], clarifications: [] });
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Credentials config
  const [apiKey, setApiKey] = useState("metaphor_dev_secret_key_123");
  const [notionToken, setNotionToken] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [chatgptToken, setChatgptToken] = useState("");
  const [claudeToken, setClaudeToken] = useState("");

  // Theme Sync on Mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("metaphor_logged_in") === "true";
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      const storedTheme = (localStorage.getItem("atlas.theme") as any) || "theme-clean";
      setTheme(storedTheme);

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
        loadInboxData()
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
      setInboxData(data);
    } catch (err) {
      setInboxData({
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

  const cycleTheme = () => {
    let nextTheme: typeof theme = "theme-clean";
    if (theme === "theme-clean") nextTheme = "theme-paper";
    else if (theme === "theme-paper") nextTheme = "theme-dark";
    
    setTheme(nextTheme);
    localStorage.setItem("atlas.theme", nextTheme);
    document.documentElement.className = nextTheme;
    if (nextTheme === "theme-dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    router.push("/login");
  };

  // Milestone Definitions
  const salesMilestones = [
    {
      title: "Realign Development with Sales Feedback",
      est: "Est. 1-2 weeks depending on sales team feedback",
      desc: "Realign development priorities based on insights gathered from outbound sales efforts"
    },
    {
      title: "Complete Beta Feature Set",
      est: "Est. 2-3 weeks depending on development pace",
      desc: "Finish building the minimum feature set required for the beta launch of the SaaS"
    },
    {
      title: "Conduct Internal Beta Testing",
      est: "Est. 1-2 weeks",
      desc: "Perform internal testing to identify and fix major issues before public beta launch"
    }
  ];

  const rebootMilestones = [
    {
      title: "Reboot Development",
      est: "Est. 1 week",
      desc: "Resume GitHub commits and refocus the development team on SaaS beta completion"
    },
    {
      title: "Feature Freeze and Beta Specification",
      est: "Est. 1-2 weeks",
      desc: "Define the final set of features for the beta release and create a detailed specification document"
    },
    {
      title: "Beta Build and Internal Testing",
      est: "Est. 2-3 weeks depending on testing complexity",
      desc: "Complete the beta build and conduct internal testing to identify and fix major issues"
    },
    {
      title: "External Beta Testing and Feedback",
      est: "Est. 1-2 weeks depending on feedback rate",
      desc: "Release the beta to a small group of external users and gather feedback for final polishing"
    },
    {
      title: "Final Polish and Deployment",
      est: "Est. 1 week",
      desc: "Address feedback, finalize the beta, and deploy it to production"
    }
  ];

  const currentMilestones = roadmapType === "sales" ? salesMilestones : rebootMilestones;

  const handleMarkComplete = () => {
    if (currentMilestoneIndex < currentMilestones.length) {
      setCurrentMilestoneIndex(prev => prev + 1);
    }
  };

  const triggerDiagnosis = () => {
    setIsDiagnosing(true);
    setTimeout(() => {
      setIsDiagnosing(false);
      setDiagnosed(true);
      setCurrentMilestoneIndex(0);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex relative overflow-hidden font-sans transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside className={`border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] flex flex-col relative z-20 shrink-0 transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}>
        
        {/* Header Branding */}
        <div className={`p-5 flex items-center border-b border-[var(--sidebar-border)] ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
          <div className="h-7 w-7 rounded-full border-2 border-[var(--accent-gold)] flex items-center justify-center shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
          </div>
          {!sidebarCollapsed && (
            <div className="text-left">
              <h1 className="text-sm font-bold font-serif tracking-tight">Atlas</h1>
              <p className="text-[9px] text-[var(--muted)] font-mono tracking-wider">STRATEGIC PROSTHETIC</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {[
            { id: "maps", label: "Maps", icon: Compass },
            { id: "timeline", label: "Timeline", icon: Clock },
            { id: "notifications", label: "Notifications", icon: Inbox },
            { id: "reports", label: "Reports", icon: FileText },
            { id: "datasources", label: "Data sources", icon: Plug },
            { id: "publicpage", label: "Public page", icon: Globe },
            { id: "settings", label: "Settings", icon: Settings }
          ].map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  sidebarCollapsed ? "justify-center p-3" : "px-3.5 py-2.5 gap-3"
                } ${
                  isActive 
                    ? "bg-[var(--card-bg)] text-[var(--foreground)] border-l-2 border-[var(--accent-gold)] shadow-sm font-bold" 
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]/50"
                }`}
              >
                <IconComp size={16} className={isActive ? "text-[var(--accent-gold)]" : "text-[var(--muted)]"} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-[var(--sidebar-border)] space-y-2">
          
          {/* Collapse sidebar button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full text-left flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
          >
            <ChevronLeft size={16} className={`transition-transform duration-350 ${sidebarCollapsed ? "rotate-180" : ""}`} />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>

          {/* Cycle Theme button */}
          <button
            onClick={cycleTheme}
            className="w-full text-left flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
          >
            {theme === "theme-clean" && <Sun size={15} className="text-amber-500 shrink-0" />}
            {theme === "theme-paper" && <BookOpen size={15} className="text-amber-800 shrink-0" />}
            {theme === "theme-dark" && <Moon size={15} className="text-amber-300 shrink-0" />}
            {!sidebarCollapsed && <span className="capitalize font-mono text-[10px]">Theme: {theme.replace("theme-", "")}</span>}
          </button>

          {/* Profile Card */}
          <div className={`pt-2 border-t border-[var(--sidebar-border)] flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
            {!sidebarCollapsed && (
              <div className="text-left pl-2">
                <p className="text-xs font-bold text-[var(--foreground)]">John Doe</p>
                <p className="text-[10px] text-[var(--muted)] font-mono">@john</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-[var(--card-bg)] text-[var(--muted)] hover:text-red-500 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>

        </div>

      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--background)] relative z-10 overflow-y-auto">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-[var(--background)]/85 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={36} className="animate-spin text-[var(--accent-gold)]" />
              <p className="text-xs text-[var(--muted)] font-mono">Loading Strategy Map...</p>
            </div>
          </div>
        )}

        <div className="flex-1 p-8">
          
          {/* TAB 1: MAPS VIEW (CORE FLOW) */}
          {activeTab === "maps" && (
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* State A: Maps List */}
              {selectedMapId === null ? (
                <div className="space-y-8 text-left">
                  
                  {/* Headline Title */}
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[var(--accent-gold)] font-mono text-[9px] tracking-wider uppercase font-bold">
                        <CircleDot size={12} />
                        <span>Your Maps</span>
                      </div>
                      <h2 className="text-3xl font-serif font-semibold text-[var(--foreground)] leading-tight">Where are you trying to get?</h2>
                      <p className="text-xs text-[var(--muted)]">Each map is a goal. Atlas diagnoses what's blocking it.</p>
                    </div>

                    <button className="atlas-btn-primary flex items-center gap-1.5">
                      <Plus size={14} /> New map
                    </button>
                  </div>

                  {/* Goal Cards */}
                  <div className="grid grid-cols-1 gap-4">
                    <div 
                      onClick={() => setSelectedMapId("da3ad08c-854d-4d1c-9909-de44d91b9740")}
                      className="atlas-card atlas-card-hover cursor-pointer border-[var(--card-border)] relative overflow-hidden transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
                          <span className="atlas-badge">Starter</span>
                          <span className="text-[10px] text-[var(--muted)] font-mono">about 10 hours ago</span>
                        </div>
                        <ArrowRight size={14} className="text-[var(--muted)]" />
                      </div>

                      <h3 className="text-lg font-serif font-semibold text-[var(--foreground)] mb-1">
                        Ship the beta of my SaaS by end of month
                      </h3>
                      <p className="text-xs text-[var(--muted)] mb-4">
                        Ship the beta of my SaaS by end of month
                      </p>

                      {/* Accent gold bar at the bottom */}
                      <div className="absolute bottom-0 left-0 h-1 bg-[var(--accent-gold)]" style={{ width: "120px" }} />
                    </div>
                  </div>

                </div>
              ) : (
                
                /* State B: Map Detail & Diagnostic timeline flow */
                <div className="space-y-8 text-left">
                  
                  {/* Breadcrumb controls */}
                  <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4">
                    <button 
                      onClick={() => setSelectedMapId(null)}
                      className="text-xs font-mono text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={14} /> YOUR MAPS
                    </button>

                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-mono font-bold uppercase text-[var(--muted)] bg-[var(--muted-bg)] px-2 py-0.5 rounded border border-[var(--card-border)]">Private</span>
                      <span className="text-[9px] font-mono text-[var(--muted)]">Focus Mode</span>
                    </div>
                  </div>

                  {/* Goal Header */}
                  <div className="space-y-1.5">
                    <h2 className="text-3xl font-serif font-semibold text-[var(--foreground)] tracking-tight">
                      Ship the beta of my SaaS by end of month
                    </h2>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[var(--accent-gold)] uppercase tracking-wider">
                      <span>Goal:</span>
                      <span>Ship the beta of my SaaS by end of month</span>
                    </div>
                  </div>

                  {/* Signals and Context Panel */}
                  <div className="atlas-card bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl space-y-4">
                    <h3 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider font-mono">Context Signals</h3>
                    
                    <div className="flex flex-wrap gap-3">
                      {[
                        { label: "GitHub", connected: true },
                        { label: "Stripe", connected: true },
                        { label: "Notion", connected: true },
                        { label: "Slack", connected: true }
                      ].map((sig) => (
                        <div key={sig.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="font-semibold">{sig.label} Connected</span>
                        </div>
                      ))}

                      {/* Qualitative note context connection */}
                      <button 
                        onClick={() => setShowNoteInput(!showNoteInput)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs cursor-pointer ${
                          diagnosed 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" 
                            : "bg-[var(--accent-gold-bg)] border-[var(--card-border)] text-[var(--accent-gold)]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${diagnosed ? "bg-emerald-500" : "bg-[var(--accent-gold)] animate-pulse"}`} />
                        <span className="font-semibold">Qualitative Note</span>
                      </button>
                    </div>

                    {/* Qualitative Note Input */}
                    {(showNoteInput || !diagnosed) && (
                      <div className="space-y-3 bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]">
                        <label className="text-[10px] font-bold text-[var(--muted)] font-mono uppercase block">Staged Context Note</label>
                        <textarea
                          rows={3}
                          value={qualitativeNote}
                          onChange={(e) => setQualitativeNote(e.target.value)}
                          className="w-full atlas-input font-sans text-xs focus:border-[var(--accent-gold)]"
                        />
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={triggerDiagnosis}
                            disabled={isDiagnosing}
                            className="atlas-btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-2"
                          >
                            {isDiagnosing ? (
                              <>
                                <Loader2 size={12} className="animate-spin text-current" />
                                <span>Diagnosing blocks...</span>
                              </>
                            ) : (
                              <span>Diagnose now</span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vertical Timeline Diagnostic Flow */}
                  {diagnosed && (
                    <div className="relative pl-10 pt-4 space-y-12">
                      
                      {/* Vertical line connector */}
                      <div className="absolute left-[7px] top-0 bottom-8 w-0.5 border-l border-dashed border-[var(--timeline-line)]" />

                      {/* 1. Goal Node */}
                      <div className="relative">
                        <div className="absolute -left-[45px] top-1.5 h-5 w-5 rounded-full border-2 border-[var(--accent-gold)] bg-[var(--background)] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
                        </div>
                        
                        <span className="text-[9px] font-mono text-[var(--accent-gold)] uppercase tracking-wider font-bold block mb-1">Goal</span>
                        <h3 className="text-xl font-serif font-medium text-[var(--foreground)]">Ship the beta of my SaaS by end of month</h3>
                      </div>

                      {/* 2. Constraint Node */}
                      <div className="relative">
                        <div className="absolute -left-[45px] top-1.5 h-5 w-5 rounded-full border-2 border-red-500 bg-[var(--background)] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping absolute" />
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 relative z-10" />
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-mono text-red-500 uppercase tracking-wider font-bold">Constraint</span>
                          <span className="bg-red-100 text-red-700 text-[8px] font-mono uppercase font-black px-1.5 py-0.25 rounded border border-red-200">Blocking</span>
                        </div>

                        <h3 className="text-xl font-serif font-semibold text-[var(--foreground)] mb-4">
                          No GitHub commits have been made in the last 14 days
                        </h3>

                        {/* Audit Details */}
                        <div className="space-y-6">
                          
                          {/* Diagnostic audit card */}
                          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-5 text-red-900 dark:text-red-400 font-serif text-sm italic leading-relaxed">
                            <span className="text-[10px] font-mono font-bold uppercase text-red-500 block not-italic mb-1 tracking-wider">Atlas Diagnostic Audit</span>
                            "The founder's goal of shipping the SaaS beta by the end of the month is at risk due to the pause in GitHub commits. With no recent integration activity logs, it is unclear what progress has been made on the beta development. The current trajectory suggests that the beta may not be ready to ship by the end of the month. The lack of GitHub activity and unclear development status are major concerns. The founder needs to refocus on development and provide a clear plan to get the beta ready for shipping."
                          </div>

                          {/* Quantified gap table */}
                          <div className="atlas-card bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl overflow-hidden p-5">
                            <span className="text-[10px] font-mono font-bold uppercase text-[var(--muted)] block mb-3 tracking-wider">Quantified Goal Gap Analysis</span>
                            
                            <table className="gap-analysis-table">
                              <thead>
                                <tr>
                                  <th>Metric</th>
                                  <th>Current</th>
                                  <th>Target</th>
                                  <th>Deficit / Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="font-semibold text-xs">GitHub commits per week</td>
                                  <td className="font-mono text-xs">0</td>
                                  <td className="font-mono font-bold text-[var(--accent-gold)] text-xs">10+</td>
                                  <td className="text-xs text-[var(--muted)]">The current commit rate is not sufficient to meet the shipping goal</td>
                                </tr>
                                <tr>
                                  <td className="font-semibold text-xs">Days until shipping goal</td>
                                  <td className="font-mono text-xs">Less than 14</td>
                                  <td className="font-mono font-bold text-[var(--accent-gold)] text-xs">0</td>
                                  <td className="text-xs text-[var(--muted)] font-serif italic text-red-500">Time is running out to complete the beta development</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* Strategic Alternatives */}
                          <div className="space-y-3">
                            <span className="text-[10px] font-mono font-bold uppercase text-[var(--muted)] block tracking-wider">Strategic Alternatives (V1 Paths)</span>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="atlas-card bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl flex flex-col justify-between">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-bold text-[var(--foreground)]">Outsourced Development</h4>
                                  <p className="text-[11px] text-[var(--muted)]">Hire external developers to accelerate the beta development</p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-[var(--card-border)] text-[9px] font-mono text-[var(--accent-gold)] font-bold">
                                  LOAD: 10 HRS/WEEK, SIGNIFICANT BUDGET
                                </div>
                              </div>

                              <div className="atlas-card bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl flex flex-col justify-between">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-bold text-[var(--foreground)]">Internal Development Sprint</h4>
                                  <p className="text-[11px] text-[var(--muted)]">Focus internal resources on a development sprint to complete the beta</p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-[var(--card-border)] text-[9px] font-mono text-[var(--accent-gold)] font-bold">
                                  LOAD: 40 HRS/WEEK, NO BUDGET
                                </div>
                              </div>
                            </div>

                            {/* "This isn't right" roadmap update toggle button */}
                            <div className="pt-2 flex justify-start">
                              <button 
                                onClick={() => {
                                  setRoadmapType(roadmapType === "sales" ? "reboot" : "sales");
                                  setCurrentMilestoneIndex(0);
                                }}
                                className="px-4 py-2 border border-[var(--card-border)] hover:border-[var(--card-hover-border)] text-xs font-mono font-bold rounded-lg text-[var(--accent-gold)] cursor-pointer"
                              >
                                {roadmapType === "sales" ? "This isn't right" : "Switch to Outbound focus"}
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* 3. Evidence Node */}
                      <div className="relative">
                        <div className="absolute -left-[45px] top-1.5 h-5 w-5 rounded-full border-2 border-emerald-500 bg-[var(--background)] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                        
                        <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold block mb-1">Evidence</span>
                        <h3 className="text-xl font-serif font-semibold text-[var(--foreground)]">
                          Last commit was 14 days ago and no recent integration activity logs
                        </h3>
                      </div>

                      {/* 4. Next Move Node */}
                      <div className="relative">
                        <div className="absolute -left-[45px] top-1.5 h-5 w-5 rounded-full border-2 border-[var(--foreground)] bg-[var(--background)] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--foreground)]" />
                        </div>
                        
                        <div className="flex items-center gap-1.5 mb-1 text-[9px] font-mono uppercase tracking-wider font-bold">
                          <span className="text-[var(--foreground)]">Next Move</span>
                          <span className="text-[var(--muted)]">· Check back 2026-07-24</span>
                        </div>

                        <h3 className="text-xl font-serif font-semibold text-[var(--foreground)] max-w-xl">
                          Save a note explaining the current status of the project, specifically addressing why development has paused.
                        </h3>
                      </div>

                      {/* 5. Campaign Roadmap */}
                      <div className="relative">
                        <div className="absolute -left-[45px] top-1.5 h-5 w-5 rounded-full border-2 border-[var(--accent-gold)] bg-[var(--background)] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
                        </div>
                        
                        <div className="atlas-card bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl p-6 space-y-6">
                          
                          <div className="flex justify-between items-center border-b border-[var(--card-border)] pb-3">
                            <span className="text-xs font-bold text-[var(--accent-gold)] uppercase tracking-wider font-mono">Campaign Roadmap</span>
                            <span className="text-[9px] font-mono text-[var(--muted)]">Active Sequence</span>
                          </div>

                          {/* Milestones checklist rendering */}
                          <div className="space-y-6 pl-4 border-l border-[var(--card-border)]">
                            {currentMilestones.map((ms, index) => {
                              const isCompleted = index < currentMilestoneIndex;
                              const isActive = index === currentMilestoneIndex;
                              
                              return (
                                <div key={ms.title} className="relative space-y-1">
                                  {/* Milestone checkpoint icon */}
                                  <div className={`absolute -left-[24px] top-1 h-[14px] w-[14px] rounded-full border flex items-center justify-center ${
                                    isCompleted 
                                      ? "bg-[var(--accent-gold)] border-[var(--accent-gold)] text-[var(--card-bg)]" 
                                      : isActive 
                                        ? "border-[var(--accent-gold)] bg-[var(--card-bg)]" 
                                        : "border-[var(--card-border)] bg-[var(--background)]"
                                  }`}>
                                    {isCompleted && <Check size={8} className="stroke-[3]" />}
                                  </div>

                                  <div className="flex justify-between items-start">
                                    <span className={`text-sm font-serif font-medium ${isCompleted ? "line-through text-[var(--muted)]" : "text-[var(--foreground)]"}`}>
                                      Milestone {index + 1}: {ms.title}
                                    </span>
                                    <span className="text-[9px] font-mono text-[var(--muted)]">{ms.est}</span>
                                  </div>
                                  <p className={`text-xs ${isCompleted ? "text-[var(--muted)]" : "text-[var(--muted)]/80"}`}>{ms.desc}</p>
                                </div>
                              );
                            })}
                          </div>

                          {/* Active milestone block */}
                          {currentMilestoneIndex < currentMilestones.length ? (
                            <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-xl p-5 space-y-4">
                              <div className="flex justify-between items-center border-b border-[var(--card-border)] pb-2">
                                <span className="text-[9px] font-mono font-bold text-[var(--accent-gold)] uppercase tracking-wider">Active Milestone</span>
                                <span className="text-[9px] font-mono text-[var(--muted)]">{currentMilestones[currentMilestoneIndex].est}</span>
                              </div>
                              
                              <h4 className="text-base font-serif font-semibold text-[var(--foreground)]">
                                {currentMilestones[currentMilestoneIndex].title}
                              </h4>
                              
                              <div className="flex justify-end pt-2">
                                <button 
                                  onClick={handleMarkComplete}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                  <Check size={12} className="stroke-[3]" /> Mark milestone complete
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl p-5 text-center space-y-2">
                              <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
                              <h4 className="font-serif font-bold text-base">Campaign Complete!</h4>
                              <p className="text-xs">All objectives achieved. The operational constraint is resolved.</p>
                            </div>
                          )}

                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* TAB 2: TIMELINE VIEW */}
          {activeTab === "timeline" && (
            <div className="max-w-2xl mx-auto space-y-6 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[var(--accent-gold)] font-mono text-[9px] tracking-wider uppercase font-bold">
                  <Clock size={12} />
                  <span>Timeline</span>
                </div>
                <h2 className="text-2xl font-serif font-semibold text-[var(--foreground)]">Progression Log</h2>
                <p className="text-xs text-[var(--muted)]">Chronological ledger of structural mappings and strategic shifts.</p>
              </div>

              <div className="relative border-l border-[var(--timeline-line)] ml-4 pl-6 py-4 space-y-8">
                {[
                  { date: "2026-07-17 08:32", type: "Sync", title: "Ingested Notion Client Interview Notes", desc: "Added client validation context to value pricing model." },
                  { date: "2026-07-16 14:15", type: "Decision", title: "Deploy Postgres + pgvector inside Docker Container", desc: "Staged constraint for database vectors budget limit." },
                  { date: "2026-07-15 09:10", type: "Sync", title: "Git Commit: fix: decouple tokens validation", desc: "Resolved API tokens credentials bypass." }
                ].map((evt) => (
                  <div key={evt.title} className="relative space-y-1.5">
                    <div className="absolute left-[-31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-[var(--accent-gold)] bg-[var(--background)]" />
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-[var(--muted)]">{evt.date}</span>
                      <span className="atlas-badge">{evt.type}</span>
                    </div>
                    <div className="atlas-card bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-[var(--foreground)] mb-1">{evt.title}</h4>
                      <p className="text-xs text-[var(--muted)]">{evt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS VIEW */}
          {activeTab === "notifications" && (
            <div className="max-w-2xl mx-auto space-y-6 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[var(--accent-gold)] font-mono text-[9px] tracking-wider uppercase font-bold">
                  <Inbox size={12} />
                  <span>Notifications</span>
                </div>
                <h2 className="text-2xl font-serif font-semibold text-[var(--foreground)]">Inbox Signals</h2>
                <p className="text-xs text-[var(--muted)] font-sans">Review alerts and staging confirmations generated by connected credentials.</p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Goal confidence established", content: "Atlas successfully formed a high confidence vector relationship for 'SaaS beta completion'.", time: "10 mins ago", type: "info" },
                  { title: "GitHub connection paused", content: "No new activity has been registered on the 'Pseudonyms' branch in the last 14 days.", time: "2 hours ago", type: "warning" },
                  { title: "Notion indexing complete", content: "Parsed 12 active document nodes mapping business rules and budget restrictions.", time: "1 day ago", type: "success" }
                ].map((note) => (
                  <div key={note.title} className="atlas-card bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl flex items-start gap-4 p-5">
                    <div className="mt-0.5">
                      {note.type === "warning" ? (
                        <AlertTriangle className="text-red-500 shrink-0" size={16} />
                      ) : (
                        <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-[var(--foreground)]">{note.title}</h4>
                        <span className="text-[10px] font-mono text-[var(--muted)]">{note.time}</span>
                      </div>
                      <p className="text-xs text-[var(--muted)]">{note.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REPORTS VIEW */}
          {activeTab === "reports" && (
            <div className="max-w-3xl mx-auto space-y-6 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[var(--accent-gold)] font-mono text-[9px] tracking-wider uppercase font-bold">
                  <FileText size={12} />
                  <span>Reports</span>
                </div>
                <h2 className="text-2xl font-serif font-semibold text-[var(--foreground)]">Strategy Audits</h2>
                <p className="text-xs text-[var(--muted)]">Analytical breakdowns of active maps, decision vectors, and block history.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="atlas-card bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl p-6 space-y-4">
                  <span className="text-[9px] font-mono font-bold text-[var(--accent-gold)] uppercase tracking-wider block">Operational Velocity</span>
                  <div className="h-32 flex items-end justify-between gap-2 border-b border-[var(--card-border)] pb-2">
                    <div className="w-full bg-[var(--muted-bg)] h-[20%] rounded-sm" />
                    <div className="w-full bg-[var(--muted-bg)] h-[35%] rounded-sm" />
                    <div className="w-full bg-[var(--muted-bg)] h-[60%] rounded-sm" />
                    <div className="w-full bg-[var(--accent-gold)] h-[90%] rounded-sm" />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold">Weekly velocity</span>
                    <span className="font-mono text-[var(--accent-gold)] font-bold">+45%</span>
                  </div>
                </div>

                <div className="atlas-card bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-[var(--accent-gold)] uppercase tracking-wider block mb-2">Audit Summary</span>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">
                      Your business constraints show 88% alignment. Outbound Sales operations show low constraint levels, while Product Development remains blocked due to Github commit pauses.
                    </p>
                  </div>
                  <button className="atlas-btn-secondary w-full text-xs font-semibold py-2">Download Audit PDF</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA SOURCES VIEW */}
          {activeTab === "datasources" && (
            <div className="max-w-2xl mx-auto space-y-6 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[var(--accent-gold)] font-mono text-[9px] tracking-wider uppercase font-bold">
                  <Plug size={12} />
                  <span>Data sources</span>
                </div>
                <h2 className="text-2xl font-serif font-semibold text-[var(--foreground)]">Active Connections</h2>
                <p className="text-xs text-[var(--muted)]">Manage external API integrations mapping activity logs to your strategic timelines.</p>
              </div>

              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 space-y-4">
                {[
                  { name: "GitHub Repositories", type: "code", active: !!githubToken },
                  { name: "Notion Workspaces", type: "documents", active: !!notionToken },
                  { name: "Slack Conversations", type: "chat", active: true },
                  { name: "Stripe Subscriptions", type: "billing", active: true }
                ].map((conn) => (
                  <div key={conn.name} className="flex justify-between items-center py-3 border-b border-[var(--card-border)] last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${conn.active ? "bg-emerald-500" : "bg-[var(--muted)]"}`} />
                      <div>
                        <h4 className="text-xs font-bold text-[var(--foreground)]">{conn.name}</h4>
                        <p className="text-[9px] font-mono text-[var(--muted)] uppercase">{conn.type}</p>
                      </div>
                    </div>

                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                      conn.active 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold" 
                        : "bg-[var(--muted-bg)] border-[var(--card-border)] text-[var(--muted)]"
                    }`}>
                      {conn.active ? "Active" : "Offline"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PUBLIC PAGE VIEW */}
          {activeTab === "publicpage" && (
            <div className="max-w-2xl mx-auto space-y-6 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[var(--accent-gold)] font-mono text-[9px] tracking-wider uppercase font-bold">
                  <Globe size={12} />
                  <span>Public page</span>
                </div>
                <h2 className="text-2xl font-serif font-semibold text-[var(--foreground)]">Public Map Shares</h2>
                <p className="text-xs text-[var(--muted)]">Share interactive read-only versions of your roadmap progress with external advisors.</p>
              </div>

              <div className="atlas-card bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl p-8 text-center space-y-4">
                <Globe size={32} className="mx-auto text-[var(--accent-gold)]" />
                <h4 className="font-semibold text-sm">Public sharing is currently offline</h4>
                <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                  Enable public sharing to generate custom URLs showing your goal milestones progression to stakeholders.
                </p>
                <button className="atlas-btn-primary px-6 py-2 text-xs font-semibold">Enable Public Mappings</button>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS VIEW */}
          {activeTab === "settings" && (
            <div className="max-w-xl mx-auto space-y-6 text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[var(--accent-gold)] font-mono text-[9px] tracking-wider uppercase font-bold">
                  <Settings size={12} />
                  <span>Settings</span>
                </div>
                <h2 className="text-2xl font-serif font-semibold text-[var(--foreground)]">API Credentials</h2>
                <p className="text-xs text-[var(--muted)]">Update secret integrations keys and context engine credentials.</p>
              </div>

              <div className="atlas-card bg-[var(--card-bg)] border-[var(--card-border)] rounded-xl p-6 space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[var(--muted)] font-mono uppercase block">Metaphor Engine Secret Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full atlas-input font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[var(--muted)] font-mono uppercase block">Notion API Secret</label>
                  <input
                    type="password"
                    placeholder="secret_..."
                    value={notionToken}
                    onChange={(e) => setNotionToken(e.target.value)}
                    className="w-full atlas-input font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[var(--muted)] font-mono uppercase block">GitHub PAT</label>
                  <input
                    type="password"
                    placeholder="ghp_..."
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="w-full atlas-input font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[var(--muted)] font-mono uppercase block">ChatGPT Platform Key</label>
                  <input
                    type="password"
                    placeholder="sk-proj-..."
                    value={chatgptToken}
                    onChange={(e) => setChatgptToken(e.target.value)}
                    className="w-full atlas-input font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[var(--muted)] font-mono uppercase block">Claude Platform Key</label>
                  <input
                    type="password"
                    placeholder="sk-ant-..."
                    value={claudeToken}
                    onChange={(e) => setClaudeToken(e.target.value)}
                    className="w-full atlas-input font-mono text-xs"
                  />
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    onClick={handleSignOut}
                    className="text-xs font-bold text-red-500 font-mono uppercase hover:text-red-400 cursor-pointer"
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
                      alert("API config saved locally.");
                    }}
                    className="atlas-btn-primary text-xs font-semibold py-2 px-5 cursor-pointer"
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
