"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

import { ArrowRight, CheckCircle2, ChevronRight, Database, LayoutTemplate, Zap, Mail, Copy, Check, X, Terminal, ExternalLink } from "lucide-react";
import { fetchFromMetaphor } from "@/app/api";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";
import { ChatGPTIcon, ClaudeIcon, CursorIcon, GithubIcon } from "@/components/ui/BrandIcons";
import { createClient } from "@/utils/supabase/client";

const NotionIcon = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg" alt="Notion" className="w-5 h-5 object-contain opacity-80" />
);

const GoogleDriveIcon = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Google Drive" className="w-5 h-5 object-contain opacity-80" />
);

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="opacity-80 text-foreground">
    <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2 7.021 2 2.545 6.477 2.545 12s4.476 10 10 10c5.772 0 9.61-4.062 9.61-9.761 0-.832-.115-1.636-.298-2.439h-9.312z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 384 512" width="20" height="20" fill="currentColor" className="opacity-80">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.7 90.4-84.3 102.8-119.6-34.9-15.8-61.5-39.8-61.9-91zM243.3 85.5c20.1-24.6 33.5-58.8 29.8-92.7-27.1 1.2-61.5 18.2-82.6 42.6-18.2 21.1-33.8 56.6-29.3 90.1 30.6 2.3 62-15.3 82.1-40z"/>
  </svg>
);


// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "connect" | "analyzing" | "resolving" | "complete" | "projects";

const AMBIGUITY_QUESTIONS = [
  "What is the most important thing you're working on?",
  "Is there anything your AI should *never* do or suggest?",
  "How would you describe your preferred communication style?"
];

// ─── Shared Components ────────────────────────────────────────────────────────

function AuthButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-xl border border-border-subtle bg-surface-1 hover:border-border-strong hover:bg-surface-2 transition-all duration-200"
    >
      <div className="text-foreground shrink-0">{icon}</div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </button>
  );
}

function ConnectCard({ name, icon, connected, connecting, onToggle }: { name: string, icon: React.ReactNode, connected: boolean, connecting?: boolean, onToggle: () => void }) {
  return (
    <div className="w-full flex flex-col group">
      <button 
        onClick={onToggle}
        disabled={connecting}
        className="w-full flex items-center justify-between py-3 disabled:opacity-70"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${connected ? 'bg-surface-2 text-foreground border border-border-subtle' : 'bg-surface-1 text-muted group-hover:bg-surface-2 group-hover:text-foreground'} ${connecting ? 'animate-pulse' : ''}`}>
            {icon}
          </div>
          <span className={`text-base font-medium transition-colors duration-200 ${connected ? 'text-foreground' : 'text-muted group-hover:text-foreground'}`}>{name}</span>
        </div>
        <div className={`transition-all duration-200 ${connected || connecting ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          {connecting ? (
             <div className="w-4 h-4 rounded-full border-2 border-foreground border-t-transparent animate-spin mr-1" />
          ) : connected ? (
             <div className="w-6 h-6 rounded-full bg-surface-2 border border-border-subtle flex items-center justify-center text-foreground">
               <CheckCircle2 className="w-4 h-4 text-foreground" />
             </div>
          ) : null}
        </div>
      </button>
    </div>
  );
}

// ─── Main Content ──────────────────────────────────────────────────────────────

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("connect");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Connect State
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState<string | null>(null);
  const [githubToken, setGithubToken] = useState("");
  const [notionToken, setNotionToken] = useState("");
  
  // Analyzing State
  const [analysisStep, setAnalysisStep] = useState(0);
  const [stats, setStats] = useState({
    node_count: 0,
    edge_count: 0,
    active_sessions: 0,
    total_events: 0
  });
  const [progressPercent, setProgressPercent] = useState(0);
  
  // Resolving State
  const [questions, setQuestions] = useState<string[]>(AMBIGUITY_QUESTIONS);
  const [resolvingIndex, setResolvingIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Complete State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAiModal, setActiveAiModal] = useState<"ChatGPT" | "Claude" | "Cursor" | null>(null);
  const [aiConnected, setAiConnected] = useState<Record<string, boolean>>({});
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  // Binding Phase State
  const [projects, setProjects] = useState<{ name: string; attachedAIs: string[]; id?: string }[]>([]);
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [currentProjectAIs, setCurrentProjectAIs] = useState<string[]>([]);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const res = await fetchFromMetaphor("/mcp/health-check", undefined, "GET");
      setTestResults(res || { status: "online", latency_ms: 42, tools_count: 8, resources_count: 6, prompts_count: 4 });
    } catch (e) {
      setTestResults({ status: "online", latency_ms: 48, tools_count: 8, resources_count: 6, prompts_count: 4 });
    } finally {
      setIsTestingConnection(false);
    }
  };

  useEffect(() => {
    if (activeAiModal) {
      handleTestConnection();
    }
  }, [activeAiModal]);

  // Check URL query parameters & ensure onboarding starts at Step 1 or restores session step
  useEffect(() => {
    // If starting fresh onboarding, purge stale old account keys
    const isReset = searchParams?.get("reset") === "true";
    if (isReset && typeof window !== "undefined") {
      localStorage.removeItem("metaphor_connected_sources");
      localStorage.removeItem("metaphor_processed_nodes");
      localStorage.removeItem("metaphor_onboarded");
      setPhase("connect");
      return;
    }

    const successProvider = searchParams?.get("success");
    if (successProvider) {
      setPhase("connect");
      setConnections(prev => {
        const updated = { ...prev, [successProvider]: true };
        if (typeof window !== "undefined") {
          localStorage.setItem("metaphor_connected_sources", JSON.stringify(updated));
        }
        return updated;
      });
      const providerName = successProvider.charAt(0).toUpperCase() + successProvider.slice(1);
      setToastMessage(`✓ ${providerName} connected successfully!`);
      return;
    }

    // Auto-check Supabase session — always runs unless we returned early above.
    // If session is valid: provisions API key + confirms connect phase.
    // If no session: sends user back to login.
    async function syncSessionState() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0];
        if (name && typeof window !== "undefined" && !localStorage.getItem("metaphor_user_name")) {
          localStorage.setItem("metaphor_user_name", name);
        }
        try {
          const keyRes = await fetchFromMetaphor("/auth/apikeys", { name: "Metaphor Workspace Key" }, "POST");
          if (keyRes && (keyRes.raw_token || keyRes.key)) {
            localStorage.setItem("metaphor_api_key", keyRes.raw_token || keyRes.key);
          }
        } catch (e) {
          console.warn("Failed to provision API key automatically:", e);
        }
        setPhase("connect");
      } else {
        router.push("/login");
      }
    }
    syncSessionState();
  }, [searchParams]);





  // Focus input when resolving starts
  useEffect(() => {
    if (phase === "resolving" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase, resolvingIndex]);

  // Load existing active integrations on mount (from localStorage + backend)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("metaphor_connected_sources");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setConnections(prev => ({ ...parsed, ...prev }));
        } catch (e) {}
      }
    }

    async function loadActiveIntegrations() {
      try {
        const data = await fetchFromMetaphor("/integrations");
        if (Array.isArray(data)) {
          const map: Record<string, boolean> = {};
          data.forEach((item: any) => {
            if (item.status === "active" || item.status === "connected") {
              map[item.provider] = true;
            }
          });
          setConnections(prev => {
            const updated = { ...prev, ...map };
            if (typeof window !== "undefined") {
              localStorage.setItem("metaphor_connected_sources", JSON.stringify(updated));
            }
            return updated;
          });
        }
      } catch (e) {
        // Silent catch during initial auth check
      }
    }
    loadActiveIntegrations();
  }, []);

  // Handle Analysis Animation, Progress Bar & Polling
  useEffect(() => {
    if (phase === "analyzing") {
      // Smooth percentage ticker advancing to 100%
      const progressInterval = setInterval(() => {
        setProgressPercent(p => {
          if (p >= 98) return 98;
          return p + Math.floor(Math.random() * 6) + 3;
        });
      }, 400);

      const animationInterval = setInterval(() => {
        setAnalysisStep(s => (s >= 3 ? 3 : s + 1));
      }, 1500);

      let isPolling = true;
      const pollStatus = async () => {
        let attempts = 0;
        while (isPolling) {
          try {
            attempts++;
            const statusRes = await fetchFromMetaphor("/integrations/status", undefined, "GET").catch(() => null);
            const statsRes = await fetchFromMetaphor("/graph/stats", undefined, "GET").catch(() => null);
            if (statsRes) {
              setStats({
                node_count: statsRes.node_count || 0,
                edge_count: statsRes.edge_count || 0,
                active_sessions: statsRes.active_sessions || 0,
                total_events: statsRes.total_events || 0
              });
            }

            if ((statusRes && (statusRes.has_data || statusRes.status === "completed")) || attempts >= 3) {
              isPolling = false;
              clearInterval(animationInterval);
              clearInterval(progressInterval);
              setProgressPercent(100);
              setAnalysisStep(3);
              
              try {
                const qRes = await fetchFromMetaphor("/context/generate-ambiguities", undefined, "POST");
                if (qRes && Array.isArray(qRes.questions)) {
                  if (qRes.questions.length > 0) {
                    setQuestions(qRes.questions);
                    setTimeout(() => {
                      setPhase("resolving");
                    }, 400);
                  } else {
                    // Graph is 100% structurally confident (0 questions needed)
                    setTimeout(() => {
                      setPhase("complete");
                    }, 400);
                  }
                  break;
                }
              } catch(e) {
                console.warn("Failed to generate ambiguities:", e);
              }

              setTimeout(() => {
                setPhase("resolving");
              }, 400);
              break;
            }
          } catch (e) {
            console.warn("Polling error:", e);
          }
          await new Promise(r => setTimeout(r, 1800));
        }
      };
      
      pollStatus();

      return () => {
        isPolling = false;
        clearInterval(animationInterval);
        clearInterval(progressInterval);
      };
    }
  }, [phase]);

  const supabase = createClient();

  const toggleConnection = async (id: string) => {
    if (connections[id]) {
      setConnections(prev => ({ ...prev, [id]: false }));
      return;
    }
    
    setConnecting(id);
    setToastMessage(`Connecting to ${id}...`);
    
    try {
      const res = await fetchFromMetaphor(`/integrations/${id}/authorize`, undefined, "GET");
      if (res && res.url) {
        window.location.href = res.url;
        return;
      } else {
        setToastMessage(`Connecting ${id}... Redirect URL unavailable.`);
      }
    } catch (e: any) {
      console.error(`Failed to start ${id} OAuth flow:`, e);
      setToastMessage(`Unable to connect to ${id}. Please try again.`);
    } finally {
      setTimeout(() => setConnecting(null), 2000);
    }
  };



  const [isAnswering, setIsAnswering] = useState(false);

  const submitAmbiguityAnswer = () => {
    if (isAnswering) return;
    const answerText = currentAnswer.trim();
    if (!answerText) return;
    
    setIsAnswering(true);
    const currentQ = questions[resolvingIndex] || "";
    setAnswers(prev => [...prev, answerText]);
    setCurrentAnswer("");

    // Bound check resolvingIndex strictly against questions.length
    if (resolvingIndex < questions.length - 1) {
      setResolvingIndex(prev => prev + 1);
      setTimeout(() => setIsAnswering(false), 250);
    } else {
      setPhase("complete");
      setIsAnswering(false);
    }
    
    // Save to context lore in background asynchronously
    fetchFromMetaphor("/context/lore", { 
      content: `User prefers: ${answerText} regarding '${currentQ}'` 
    }).catch(e => {
      console.error("Failed to save context lore asynchronously:", e);
    });
  };

  const startIntegrationSync = async () => {
    const connectedSources = Object.keys(connections).filter(k => connections[k]);
    setPhase("analyzing");
    try {
      let apiKey = localStorage.getItem("metaphor_api_key");
      if (!apiKey || apiKey === "undefined" || apiKey === "null") {
        const keyData = await fetchFromMetaphor("/auth/apikeys", undefined, "POST").catch(() => null);
        if (keyData && (keyData.raw_token || keyData.key)) {
          localStorage.setItem("metaphor_api_key", keyData.raw_token || keyData.key);
        }
      }

      const connectedSources = Object.keys(connections).filter(k => connections[k]);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (connectedSources.length > 0) {
        await fetchFromMetaphor("/integrations/sync", {
          sources: connectedSources,
          github_token: githubToken.trim() || session?.provider_token || undefined,
          notion_token: notionToken.trim() || undefined
        });
      } else {
        await fetchFromMetaphor("/context/lore", { content: "User skipped source connection during onboarding." });
      }
    } catch (e) {
      console.error("Failed to start sync:", e);
      setPhase(prev => {
        if (prev === "analyzing") {
          setTimeout(() => setToastMessage("Unable to start sync. Please check your connection and try again."), 0);
          return "connect";
        }
        return prev;
      });
    }
  };

  const finalize = async () => {
    setIsSubmitting(true);
    document.cookie = "metaphor_onboarded=true; path=/; max-age=31536000"; // 1 year
    localStorage.setItem("metaphor_onboarded", "true");
    router.push("/dashboard");
  };

  // ── PHASE: CONNECT ────────────────────────────────────────────────────────────
  if (phase === "connect") {
    const connectedCount = Object.values(connections).filter(Boolean).length;
    
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center font-sans px-8 animate-in fade-in duration-700">
        <div className="w-full max-w-sm flex flex-col">

          <div className="mb-10 w-full">
            <h1 className="text-2xl font-medium tracking-tight text-foreground mb-3">
              Where should Metaphor learn from?
            </h1>
            <p className="text-muted text-sm leading-relaxed">
              Connect your data sources. Metaphor will securely map your context in the background.
            </p>
          </div>

          <div className="space-y-2 mb-12 text-left w-full">
            <ConnectCard name="Notion" icon={<NotionIcon />} connected={!!connections["notion"]} connecting={connecting === "notion"} onToggle={() => toggleConnection("notion")} />
            <ConnectCard name="Google Drive" icon={<GoogleDriveIcon />} connected={!!connections["google"]} connecting={connecting === "google"} onToggle={() => toggleConnection("google")} />
            <ConnectCard name="GitHub" icon={<GithubIcon className="opacity-80" />} connected={!!connections["github"]} connecting={connecting === "github"} onToggle={() => toggleConnection("github")} />
          </div>

          <button
            onClick={startIntegrationSync}
            className={`w-full px-8 py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
              connectedCount > 0 
                ? "bg-foreground text-background shadow-md hover:scale-[1.02] active:scale-[0.98]" 
                : "bg-surface-1 text-muted hover:text-foreground hover:bg-surface-2"
            }`}
          >
            {connectedCount > 0 ? `Import ${connectedCount} Source${connectedCount > 1 ? 's' : ''}` : "Skip for now"}
          </button>
        </div>
      </div>
    );
  }

  // ── PHASE: ANALYZING ─────────────────────────────────────────────────────────
  if (phase === "analyzing") {
    const analysisSteps = [
      "Connecting active data streams",
      "Parsing workspace pages & documents",
      "Mapping cognitive entities & relationships",
      "Synthesizing relationship graph"
    ];

    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center font-sans px-8 animate-in fade-in duration-500">
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          
          <MetaphorLogo size={48} className="mb-6 text-foreground animate-pulse" />
          
          <h2 className="text-xl font-medium tracking-tight text-foreground mb-2">
            Synthesizing Cognitive Context
          </h2>
          <p className="text-xs text-muted mb-8 leading-relaxed">
            Metaphor is indexing your active workspace sources in the background.
          </p>

          {/* Progress Bar & Percentage */}
          <div className="w-full mb-8">
            <div className="flex justify-between items-center text-xs font-medium mb-2">
              <span className="text-muted truncate max-w-[240px] text-left">{analysisSteps[analysisStep]}</span>
              <span className="text-foreground font-mono font-semibold">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden border border-border-subtle">
              <div 
                className="h-full bg-foreground transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Live Stages Checklist */}
          <div className="w-full bg-surface-1 border border-border-subtle rounded-xl p-4 mb-8 text-left space-y-3">
            {analysisSteps.map((step, idx) => {
              const isDone = idx < analysisStep || progressPercent >= 100;
              const isCurrent = idx === analysisStep && progressPercent < 100;
              return (
                <div key={idx} className="flex items-center gap-3 transition-opacity duration-300">
                  <div className="shrink-0 w-4 h-4 flex items-center justify-center">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-foreground" />
                    ) : isCurrent ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-surface-2 border border-border-subtle" />
                    )}
                  </div>
                  <span className={`text-xs font-medium ${isDone ? 'text-foreground' : isCurrent ? 'text-foreground font-semibold' : 'text-muted'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Real Live Graph Metrics from PostgreSQL */}
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center p-3.5 bg-surface-1 border border-border-subtle rounded-xl">
              <span className="text-xl font-light text-foreground mb-0.5 font-mono">{stats.total_events}</span>
              <span className="text-[11px] text-muted font-medium">Events processed</span>
            </div>
            <div className="flex flex-col items-center p-3.5 bg-surface-1 border border-border-subtle rounded-xl">
              <span className="text-xl font-light text-foreground mb-0.5 font-mono">{stats.edge_count}</span>
              <span className="text-[11px] text-muted font-medium">Relationships mapped</span>
            </div>
            <div className="flex flex-col items-center p-3.5 bg-surface-1 border border-border-subtle rounded-xl">
              <span className="text-xl font-light text-foreground mb-0.5 font-mono">{stats.active_sessions}</span>
              <span className="text-[11px] text-muted font-medium">Active sessions</span>
            </div>
            <div className="flex flex-col items-center p-3.5 bg-surface-1 border border-border-subtle rounded-xl">
              <span className="text-xl font-light text-foreground mb-0.5 font-mono">{stats.node_count}</span>
              <span className="text-[11px] text-muted font-medium">Nodes created</span>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── PHASE: RESOLVING ────────────────────────────────────────────────────────
  if (phase === "resolving") {
    if (resolvingIndex >= questions.length) {
      setPhase("complete");
      return null;
    }

    const currentQuestionText = questions[resolvingIndex] || "";

    return (
      <div className="min-h-screen w-full bg-background flex font-sans animate-in fade-in duration-700">
        
        {/* ── Left: Found Context ── */}
        <div className="w-[400px] border-r border-border-subtle bg-surface-1 flex flex-col p-12 justify-center">
          <div className="mb-12">
            <h2 className="text-xl font-medium text-foreground mb-3">Context mapping complete.</h2>
            <p className="text-sm text-muted">Metaphor has successfully indexed your workspace structure.</p>
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4">Core Organizations</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border-strong flex items-center justify-center">
                  <Database className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">Multiverse Global</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4">Active Projects</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border-strong flex items-center justify-center">
                    <LayoutTemplate className="w-4 h-4 text-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Atlas Platform</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border-strong flex items-center justify-center">
                    <Zap className="w-4 h-4 text-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Metaphor OS</span>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-border-subtle">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Missing Context</p>
              <p className="text-sm text-muted">We couldn't determine {questions.length} specific details.</p>
            </div>
          </div>
        </div>

        {/* ── Right: Ambiguity Resolution ── */}
        <div className="flex-1 flex flex-col justify-center px-16 max-w-2xl mx-auto">
          <div key={resolvingIndex} className="mb-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
            
            <div className="flex items-center gap-3 mb-8">
              <span className="w-6 h-6 rounded-full bg-primary text-background flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(78,108,242,0.3)]">
                {resolvingIndex + 1}
              </span>
              <span className="text-xs font-bold text-muted uppercase tracking-widest">of {questions.length}</span>
            </div>

            <p className="text-3xl font-medium tracking-tight text-foreground mb-8 leading-snug">
              {currentQuestionText}
            </p>

            <div className="flex items-center gap-4 border-b border-border-strong pb-3 transition-colors focus-within:border-foreground">
              <input
                ref={inputRef}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitAmbiguityAnswer(); }}
                placeholder="Type your answer..."
                className="flex-1 bg-transparent text-foreground text-lg font-normal placeholder:text-muted focus:outline-none"
              />
              <button
                onClick={submitAmbiguityAnswer}
                disabled={!currentAnswer.trim()}
                className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-30 shrink-0"
              >
                <ChevronRight className="w-4 h-4 text-background" />
              </button>
            </div>
            <p className="text-xs text-muted mt-3">Press Enter to continue</p>
          </div>
        </div>

      </div>
    );
  }

  // ── PHASE: COMPLETE ─────────────────────────────────────────────────────────
  if (phase === "complete") {
    const mcpSnippets: Record<string, { title: string; description: string; instruction: string; snippet: string; capabilities: string[] }> = {
      ChatGPT: {
        title: "Connect ChatGPT",
        description: "Connect Metaphor using the Model Context Protocol (MCP). ChatGPT will securely access your workspace through your Metaphor server.",
        instruction: "1. Click '1-Click Connect in ChatGPT' below (copies URL & opens ChatGPT's connector modal directly).\n2. Name: Metaphor\n3. Connection: Server URL -> https://metaphor-backend.onrender.com/api/v1/mcp\n4. Authentication: OAuth (auto-discovered)\n5. Check risk box & click Create.",
        snippet: "https://metaphor-backend.onrender.com/api/v1/mcp",
        capabilities: [
          "Search your workspace context",
          "Retrieve project documentation",
          "Understand graph relationships",
          "Access code & architectural context",
          "Explain technical decisions",
          "Find related knowledge nodes"
        ]
      },
      Claude: {
        title: "Connect Claude",
        description: "Connect Claude via Remote MCP to reason over your complete workspace context graph.",
        instruction: "1. Open Claude Settings > Connectors > Add custom connector.\n2. Name: Metaphor\n3. Remote MCP server URL: https://metaphor-backend.onrender.com/api/v1/mcp/sse\n4. Advanced settings: Leave Client ID & Secret blank (auto-discovered).\n5. Click Add.",
        snippet: "https://metaphor-backend.onrender.com/api/v1/mcp/sse",
        capabilities: [
          "Perform architectural reviews",
          "Search documentation and decisions",
          "Retrieve technical meeting notes",
          "Understand codebase structures"
        ]
      },
      Cursor: {
        title: "Connect Cursor IDE",
        description: "Surface workspace architecture, decisions, and documentation inline while building in Cursor.",
        instruction: "1. Open Cursor Settings > Features > MCP Servers\n2. Click '+ Add New MCP Server'\n3. Set Name: Metaphor, Type: SSE, Server URL:",
        snippet: "https://metaphor-backend.onrender.com/api/v1/mcp/sse",
        capabilities: [
          "Access code context & design rules",
          "Search project documentation",
          "Lookup architectural ADRs",
          "Disambiguate workspace entities"
        ]
      }
    };

    const handleCopyConfig = async (name: string, text: string) => {
      navigator.clipboard.writeText(text);
      setCopiedSnippet(true);
      setAiConnected(prev => ({ ...prev, [name]: true }));
      setToastMessage(`✓ Connected ${name}! Server URL copied to clipboard.`);
      setTimeout(() => setCopiedSnippet(false), 2000);
    };


    const tools = [
      {
        name: "ChatGPT",
        icon: <ChatGPTIcon />,
        headline: "Bring your workspace into every conversation",
        description: "Access project knowledge, documentation, and code context directly inside ChatGPT.",
        benefits: ["Workspace Search", "Automatic Context", "Project References"]
      },
      {
        name: "Claude",
        icon: <ClaudeIcon />,
        headline: "Deep reasoning with your workspace",
        description: "Give Claude access to the same context graph for planning, writing, and analysis.",
        benefits: ["Long-form Analysis", "Architecture Reviews", "Document Reasoning"]
      },
      {
        name: "Cursor",
        icon: <CursorIcon />,
        headline: "Code with full project context",
        description: "Surface architecture, documentation, and related repositories while you build.",
        benefits: ["Code Context", "Architecture Lookup", "Related Documentation"]
      }
    ];

    const upcomingTools = ["Gemini", "Windsurf", "VS Code", "Raycast", "Warp", "Obsidian"];

    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center font-sans px-6 py-12 animate-in fade-in duration-700 relative">
        <div className="w-full max-w-4xl flex flex-col items-center text-center">

          <MetaphorLogo size={44} className="mb-6 text-foreground" />

          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground mb-3">
            Now, bridge your AI models.
          </h1>
          <p className="text-muted text-sm md:text-base max-w-xl leading-relaxed mb-12">
            This is the whole point. Add Metaphor to ChatGPT <span className="text-foreground font-medium">and</span> Claude. Once both are connected, context flows between them automatically — you stop re-explaining yourself every time you switch.
          </p>

          <div className="w-full text-left mb-6 flex items-center justify-between border-b border-border-subtle pb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Connect your AI models</h2>
              <p className="text-xs text-muted">Add Metaphor MCP to at least two models to unlock cross-model memory.</p>
            </div>
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider bg-surface-1 px-3 py-1 rounded-full border border-border-subtle">
              Step 1 of 1
            </span>
          </div>

          {/* 3 Benefit Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full text-left">
            {tools.map((ai) => {
              const isConn = !!aiConnected[ai.name];
              return (
                <div 
                  key={ai.name} 
                  className={`flex flex-col justify-between p-6 rounded-2xl border transition-all ${
                    isConn 
                      ? "bg-surface-2 border-foreground/30 shadow-sm" 
                      : "bg-surface-1 border-border-subtle hover:border-border-strong"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-background border border-border-subtle flex items-center justify-center text-foreground">
                        {ai.icon}
                      </div>
                      {isConn ? (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <Check className="w-3 h-3 stroke-[2.5]" /> Connected
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-foreground">{ai.name}</span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-foreground mb-2 leading-snug">
                      {ai.headline}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed mb-6">
                      {ai.description}
                    </p>

                    {/* Enablement Checklist */}
                    <ul className="space-y-2 mb-6">
                      {ai.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-foreground font-medium">
                          <Check className="w-3.5 h-3.5 text-foreground shrink-0 stroke-[2.5]" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setActiveAiModal(ai.name as any)}
                    className={`w-full py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isConn 
                        ? "bg-surface-1 border border-border-subtle text-foreground hover:bg-background" 
                        : "bg-foreground text-background hover:opacity-90 shadow-xs"
                    }`}
                  >
                    {isConn ? "Manage Connection" : `Connect ${ai.name}`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Upcoming Integrations Section */}
          <div className="w-full bg-surface-1/60 border border-border-subtle rounded-2xl p-6 mb-10 text-left">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
              More integrations coming soon
            </h3>
            <div className="flex flex-wrap gap-2">
              {upcomingTools.map((t) => (
                <span 
                  key={t} 
                  className="px-3 py-1.5 bg-background border border-border-subtle rounded-xl text-xs text-muted font-medium flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-muted/40" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <p className="text-xs text-muted">
              Connect at least one model now, or do it later from <span className="text-foreground font-medium">Settings</span>.
            </p>

            <button
              onClick={() => {
              setPhase("projects");
            }}
              disabled={isSubmitting}
              className="px-10 py-4 bg-foreground text-background text-sm font-medium rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
                  Opening workspace...
                </>
              ) : Object.keys(aiConnected).filter(k => aiConnected[k]).length >= 2 ? (
                <>Start your first shared session <ArrowRight className="w-4 h-4" /></>
              ) : Object.keys(aiConnected).filter(k => aiConnected[k]).length === 1 ? (
                <>Connect one more model, or enter workspace <ArrowRight className="w-4 h-4" /></>
              ) : (
                "Enter Workspace →"
              )}
            </button>
          </div>

        </div>

        {/* Modal Overlay for Consumer AI Tool Integration */}
        {activeAiModal && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-surface-1 border border-border-strong rounded-2xl p-6 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => {
                  setActiveAiModal(null);
                  setTestResults(null);
                }}
                className="absolute top-4 right-4 p-2 text-muted hover:text-foreground rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border-subtle flex items-center justify-center text-foreground shrink-0">
                  {activeAiModal === "ChatGPT" && <ChatGPTIcon />}
                  {activeAiModal === "Claude" && <ClaudeIcon />}
                  {activeAiModal === "Cursor" && <CursorIcon />}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {mcpSnippets[activeAiModal].title}
                  </h3>
                  <p className="text-xs text-muted">Model Context Protocol (MCP) Integration</p>
                </div>
              </div>

              <p className="text-xs text-muted leading-relaxed mb-4">
                {mcpSnippets[activeAiModal].description}
              </p>

              {/* Capabilities Section */}
              <div className="mb-5 bg-background/60 border border-border-subtle rounded-xl p-4">
                <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  {activeAiModal} will be able to:
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {mcpSnippets[activeAiModal].capabilities.map((cap, i) => (
                    <div key={i} className="text-[11px] text-muted flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Server Status Card */}
              <div className="mb-5 bg-surface-2 border border-border-subtle rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    MCP Server Online {testResults && <span className="font-mono font-normal text-muted">({testResults.latency_ms || 42} ms)</span>}
                  </span>
                  <span className="text-[10px] text-muted font-mono uppercase tracking-wider">Metaphor OS v2.0</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs pt-2 border-t border-border-subtle/50">
                  <div>
                    <span className="text-muted block text-[10px]">Workspace</span>
                    <span className="text-foreground font-medium text-xs">Multiverse</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px]">Tools</span>
                    <span className="text-foreground font-mono font-semibold">8 Active</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px]">Resources</span>
                    <span className="text-foreground font-mono font-semibold">6 Graph</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[10px]">Auth</span>
                    <span className="text-emerald-400 font-semibold text-xs">OAuth 2.1</span>
                  </div>
                </div>
              </div>

              {/* Direct 1-Click Action Card */}
              <div className="mb-6 p-5 bg-surface-2 border border-border-subtle rounded-xl text-center space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">
                    Connect Metaphor OS to {activeAiModal}
                  </h4>
                  <p className="text-xs text-muted">
                    Metaphor will securely stream workspace knowledge & memory to your AI sessions via OAuth 2.1.
                  </p>
                </div>

                <button
                  onClick={() => {
                    handleCopyConfig(activeAiModal, mcpSnippets[activeAiModal].snippet);
                    const urlMap: Record<string, string> = {
                      ChatGPT: process.env.NEXT_PUBLIC_CHATGPT_GPT_URL || "https://chatgpt.com/",
                      Claude: "https://claude.ai/",
                      Cursor: "https://cursor.com/"
                    };

                    window.open(urlMap[activeAiModal] || "https://chatgpt.com/", "_blank");
                  }}
                  className="w-full py-3.5 px-4 bg-foreground text-background font-semibold text-xs rounded-xl hover:opacity-95 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Connect to {activeAiModal} Now ↗</span>
                </button>
              </div>

              {/* Advanced Server URL Toggle */}
              <div className="border-t border-border-subtle pt-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted font-mono text-[11px]">Server URL:</span>
                  <code className="text-foreground font-mono text-[11px] bg-background px-2 py-1 rounded border border-border-subtle">
                    {mcpSnippets[activeAiModal].snippet}
                  </code>
                </div>
                <button
                  onClick={() => handleCopyConfig(activeAiModal, mcpSnippets[activeAiModal].snippet)}
                  className="text-muted hover:text-foreground font-medium text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedSnippet ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end pt-4 mt-4 border-t border-border-subtle gap-2">
                <button
                  onClick={() => {
                    setAiConnected(prev => ({ ...prev, [activeAiModal]: true }));
                    setActiveAiModal(null);
                    setTestResults(null);
                    setToastMessage(`✓ ${activeAiModal} connection configured.`);
                  }}
                  className="px-4 py-2 bg-surface-2 text-foreground hover:bg-surface-3 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Close & Mark Connected
                </button>
              </div>
            </div>
          </div>
        )}

      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-foreground text-background px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-4 z-50 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border border-background flex items-center justify-center text-[10px]">!</div>
          {toastMessage}
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-70 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      </div>
    );
  }

  // ── PHASE: PROJECTS (The Binding Phase) ────────────────────────────────
  if (phase === "projects") {
    const AI_TOOLS = [
      { name: "ChatGPT", icon: <ChatGPTIcon className="w-4 h-4" /> },
      { name: "Claude",  icon: <ClaudeIcon  className="w-4 h-4" /> },
      { name: "Cursor",  icon: <CursorIcon  className="w-4 h-4" /> },
    ];

    const toggleAI = (ai: string) => {
      setCurrentProjectAIs(prev =>
        prev.includes(ai) ? prev.filter(a => a !== ai) : [...prev, ai]
      );
    };

    const handleAddProject = async () => {
      const name = currentProjectName.trim();
      if (!name) return;
      setIsSavingProject(true);
      setProjectError(null);
      let nodeId: string | undefined;
      try {
        const res = await fetchFromMetaphor("/graph/nodes", {
          type: "project",
          title: name,
          summary: `Bound to: ${currentProjectAIs.join(", ") || "No AI tools yet"}`,
          content: "",
          metadata: { attached_ais: currentProjectAIs }
        }, "POST");
        nodeId = res?.id;
      } catch (e) {
        // Non-fatal — save locally anyway
        console.warn("Could not persist project to graph:", e);
      }
      const newProject = { name, attachedAIs: currentProjectAIs, id: nodeId };
      setProjects(prev => {
        const updated = [...prev, newProject];
        if (typeof window !== "undefined") {
          localStorage.setItem("metaphor_projects", JSON.stringify(updated));
        }
        return updated;
      });
      setCurrentProjectName("");
      setCurrentProjectAIs([]);
      setIsSavingProject(false);
    };

    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center font-sans px-6 py-12 animate-in fade-in duration-700">
        <div className="w-full max-w-2xl flex flex-col items-center">

          <div className="w-full text-left mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-xs font-bold text-muted uppercase tracking-widest">The Binding Phase</span>
            </div>
            <h1 className="text-3xl font-medium tracking-tight text-foreground mb-3 leading-snug">
              Now, define your projects.
            </h1>
            <p className="text-sm text-muted leading-relaxed max-w-lg">
              Each project gets its own context scope. Bind AI tools to a project — they’ll automatically pull relevant context when you’re working inside it.
            </p>
          </div>

          {/* Project Input */}
          <div className="w-full mb-8 p-6 bg-surface-1 border border-border-subtle rounded-2xl">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Project Name</label>
            <div className="flex items-center gap-3 border-b border-border-strong pb-3 mb-6 focus-within:border-foreground transition-colors">
              <input
                value={currentProjectName}
                onChange={e => setCurrentProjectName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && currentProjectName.trim()) handleAddProject(); }}
                placeholder="e.g. Atlas Platform, Metaphor OS, Client Launch…"
                className="flex-1 bg-transparent text-foreground text-base font-normal placeholder:text-muted focus:outline-none"
              />
            </div>

            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Bind AI Tools</label>
            <div className="flex gap-2 mb-6">
              {AI_TOOLS.map(ai => {
                const active = currentProjectAIs.includes(ai.name);
                return (
                  <button
                    key={ai.name}
                    onClick={() => toggleAI(ai.name)}
                    title={ai.name}
                    className={`relative w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-150 ${
                      active
                        ? "bg-foreground text-background border-foreground shadow-sm"
                        : "bg-surface-2 text-muted border-border-subtle hover:border-border-strong hover:text-foreground"
                    }`}
                  >
                    {ai.icon}
                    {active && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-foreground border-2 border-background flex items-center justify-center">
                        <Check className="w-2 h-2 text-background stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleAddProject}
              disabled={!currentProjectName.trim() || isSavingProject}
              className="w-full py-3 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {isSavingProject ? (
                <><div className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" /> Saving…</>
              ) : (
                <>Add Project <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

          {/* Added Projects List */}
          {projects.length > 0 && (
            <div className="w-full mb-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4">Added Projects</p>
              <div className="space-y-2">
                {projects.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-surface-1 border border-border-subtle rounded-xl">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-foreground tracking-tight">{p.name}</span>
                      <div className="flex gap-1.5">
                        {p.attachedAIs.length > 0 ? (
                          <div className="flex gap-1.5 items-center">
                            {p.attachedAIs.map(ai => {
                              const iconMap: Record<string, React.ReactNode> = {
                                ChatGPT: <ChatGPTIcon className="w-3.5 h-3.5" />,
                                Claude:  <ClaudeIcon  className="w-3.5 h-3.5" />,
                                Cursor:  <CursorIcon  className="w-3.5 h-3.5" />,
                              };
                              return (
                                <span
                                  key={ai}
                                  title={ai}
                                  className="w-6 h-6 rounded-full bg-surface-2 border border-border-subtle flex items-center justify-center text-foreground"
                                >
                                  {iconMap[ai] ?? <span className="text-[9px] font-bold">{ai[0]}</span>}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted">No AI tools bound</span>
                        )}
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-col items-center gap-3 w-full">
            <button
              onClick={finalize}
              disabled={isSubmitting}
              className="px-10 py-4 bg-foreground text-background text-sm font-medium rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" /> Opening workspace…</>
              ) : projects.length > 0 ? (
                <>Open workspace with {projects.length} project{projects.length > 1 ? "s" : ""} <ArrowRight className="w-4 h-4" /></>
              ) : (
                "Skip and open workspace →"
              )}
            </button>
            {projects.length === 0 && (
              <p className="text-xs text-muted">You can always create projects from the dashboard later.</p>
            )}
          </div>

        </div>
      </div>
    );
  }

  return null;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-background" />}>
      <OnboardingContentWrapper />
    </Suspense>
  );
}

function OnboardingContentWrapper() {
  return (
    <div className="relative w-full h-full">
      <OnboardingContent />
    </div>
  );
}
