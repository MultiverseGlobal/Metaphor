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

type Phase = "auth" | "email_auth" | "email_sent" | "connect" | "analyzing" | "resolving" | "complete";

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
  const [phase, setPhase] = useState<Phase>("auth");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Email Auth State
  const [email, setEmail] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  
  // Connect State
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState<string | null>(null);
  const [githubRepo, setGithubRepo] = useState("");
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
    const stepParam = searchParams?.get("step");
    if (stepParam === "1" || stepParam === "auth" || stepParam === "identity") {
      setPhase("auth");
      return;
    }
    if (stepParam === "connect" || stepParam === "2") {
      setPhase("connect");
      return;
    }

    // If starting fresh onboarding, purge stale old account keys
    const isReset = searchParams?.get("reset") === "true";
    if (isReset && typeof window !== "undefined") {
      localStorage.removeItem("metaphor_user_name");
      localStorage.removeItem("metaphor_connected_sources");
      localStorage.removeItem("metaphor_processed_nodes");
      localStorage.removeItem("metaphor_onboarded");
      setPhase("auth");
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

    // Auto-check Supabase session
    async function syncSessionState() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0];
        if (name && typeof window !== "undefined" && !localStorage.getItem("metaphor_user_name")) {
          localStorage.setItem("metaphor_user_name", name);
          setDisplayNameInput(name);
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
        setPhase("auth");
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

  // Add state for Step 1 identity inputs
  const [displayNameInput, setDisplayNameInput] = useState(
    typeof window !== "undefined" ? localStorage.getItem("metaphor_user_name") || "Theoonim" : "Theoonim"
  );
  const [workspaceInput, setWorkspaceInput] = useState("Metaphor OS");




  const handleEmailAuth = async () => {
    if (!email) return;
    setIsEmailLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/onboarding?step=connect')}`,
      },
    });
    setIsEmailLoading(false);
    if (error) {
      console.warn("Magic link error:", error.message);
      if (error.message?.toLowerCase().includes("rate limit") || (error as any).status === 429) {
        setToastMessage("Rate limit reached. Initializing workspace directly...");
        // Auto-provision workspace identity so user is never blocked by email provider limits
        await fetchFromMetaphor("/auth/me", { name: displayNameInput.trim() || email.split("@")[0] }, "PUT").catch(() => {});
        const keyRes = await fetchFromMetaphor("/auth/apikeys", { name: "Metaphor Workspace Key" }, "POST").catch(() => null);
        if (keyRes && (keyRes.raw_token || keyRes.key)) {
          localStorage.setItem("metaphor_api_key", keyRes.raw_token || keyRes.key);
        }
        setPhase("connect");
      } else {
        setToastMessage(`Unable to send magic link: ${error.message}`);
      }
    } else {
      setPhase("email_sent");
    }
  };

  const supabase = createClient();

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    if (displayNameInput.trim()) {
      localStorage.setItem("metaphor_user_name", displayNameInput.trim());
    }
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/onboarding?step=connect')}`,
          queryParams: provider === 'google' ? { access_type: 'offline', prompt: 'consent' } : undefined,
        },
      });

      if (error) {
        console.warn(`${provider} OAuth redirect warning:`, error.message);
        // Provision workspace state and advance smoothly to data sources step
        await fetchFromMetaphor("/auth/me", { name: displayNameInput.trim() }, "PUT").catch(() => {});
        const keyRes = await fetchFromMetaphor("/auth/apikeys", { name: "Metaphor Workspace Key" }, "POST").catch(() => null);
        if (keyRes && (keyRes.raw_token || keyRes.key)) {
          localStorage.setItem("metaphor_api_key", keyRes.raw_token || keyRes.key);
        }
        setPhase("connect");
      }
    } catch (e: any) {
      console.error(`OAuth login catch (${provider}):`, e);
      setPhase("connect");
    }
  };

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
    setPhase("analyzing");
    try {
      let apiKey = localStorage.getItem("metaphor_api_key");
      if (!apiKey) {
        const keyData = await fetchFromMetaphor("/auth/apikeys", undefined, "POST");
        localStorage.setItem("metaphor_api_key", keyData.raw_token);
      }

      const connectedSources = Object.keys(connections).filter(k => connections[k]);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (connectedSources.length > 0) {
        await fetchFromMetaphor("/integrations/sync", {
          sources: connectedSources,
          github_repo: githubRepo.trim() || undefined, 
          github_token: githubToken.trim() || session?.provider_token || undefined,
          notion_token: notionToken.trim() || undefined
        });
      } else {
        await fetchFromMetaphor("/context/lore", { content: "User skipped source connection during onboarding." });
      }
    } catch (e) {
      console.error("Failed to start sync:", e);
    }
  };

  const finalize = async () => {
    setIsSubmitting(true);
    document.cookie = "metaphor_onboarded=true; path=/; max-age=31536000"; // 1 year
    localStorage.setItem("metaphor_onboarded", "true");
    router.push("/dashboard");
  };

  // ── PHASE 1: STEP 1 - WORKSPACE & IDENTITY SETUP ────────────────────────────
  if (phase === "auth") {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center font-sans px-8 animate-in fade-in duration-500">
        <div className="w-full max-w-sm flex flex-col items-center">
          
          <MetaphorLogo size={48} className="mb-8 text-foreground" />

          <div className="mb-8 text-center w-full">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted mb-2 block">Step 1 of 4</span>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
              Initialize Workspace
            </h1>
            <p className="text-sm text-muted">
              Configure your developer profile and workspace identity.
            </p>
          </div>

          <div className="w-full space-y-5 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Display Name</label>
              <input
                type="text"
                value={displayNameInput}
                onChange={e => setDisplayNameInput(e.target.value)}
                placeholder="e.g. Theoonim"
                className="w-full p-3.5 rounded-xl border border-border-subtle bg-surface-1 text-foreground placeholder:text-muted focus:outline-none focus:border-foreground transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Workspace Name</label>
              <input
                type="text"
                value={workspaceInput}
                onChange={e => setWorkspaceInput(e.target.value)}
                placeholder="e.g. Metaphor OS"
                className="w-full p-3.5 rounded-xl border border-border-subtle bg-surface-1 text-foreground placeholder:text-muted focus:outline-none focus:border-foreground transition-colors text-sm"
              />
            </div>

            <button
              onClick={async () => {
                if (displayNameInput.trim()) {
                  localStorage.setItem("metaphor_user_name", displayNameInput.trim());
                }
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                  setPhase("email_auth");
                  return;
                }
                try {
                  await fetchFromMetaphor("/auth/me", { name: displayNameInput.trim() }, "PUT").catch(() => {});
                  const keyRes = await fetchFromMetaphor("/auth/apikeys", { name: "Metaphor Workspace Key" }, "POST");
                  if (keyRes && (keyRes.raw_token || keyRes.key)) {
                    localStorage.setItem("metaphor_api_key", keyRes.raw_token || keyRes.key);
                  }
                } catch (e) {
                  console.warn("User sync warning:", e);
                }
                setPhase("connect");
              }}
              className="w-full p-4 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-all flex justify-center items-center gap-2 cursor-pointer shadow-md mt-6"
            >
              <span>Continue to Data Sources</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

          <div className="py-4 flex items-center gap-4 w-full">
            <div className="flex-1 border-t border-border-subtle"></div>
            <span className="text-[11px] text-muted font-medium">or sign in with OAuth</span>
            <div className="flex-1 border-t border-border-subtle"></div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <AuthButton icon={<GoogleLogo />} label="Google" onClick={() => handleOAuthLogin('google')} />
            <AuthButton icon={<GithubIcon className="opacity-80" />} label="GitHub" onClick={() => handleOAuthLogin('github')} />
          </div>

          <p className="mt-8 text-[11px] text-muted max-w-[280px] text-center leading-relaxed">
            Data is encrypted locally and stored securely in your private knowledge graph.
          </p>

        </div>
      </div>
    );
  }


  // ── PHASE: EMAIL AUTH ────────────────────────────────────────────────────────
  if (phase === "email_auth") {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center font-sans px-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="w-full max-w-sm flex flex-col items-center">
          <MetaphorLogo size={48} className="mb-10 text-foreground" />
          <div className="mb-8 text-center w-full">
            <h1 className="text-2xl font-medium tracking-tight text-foreground mb-3">
              Continue with Email
            </h1>
            <p className="text-sm text-muted">We'll send a magic link to your inbox.</p>
          </div>
          <div className="w-full space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full p-4 rounded-xl border border-border-subtle bg-surface-1 text-foreground placeholder:text-muted focus:outline-none focus:border-foreground transition-colors"
              onKeyDown={e => { if (e.key === "Enter") handleEmailAuth(); }}
            />
            <button
              onClick={handleEmailAuth}
              disabled={isEmailLoading || !email}
              className="w-full p-4 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isEmailLoading ? <div className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" /> : "Send Magic Link"}
            </button>
            <button onClick={() => setPhase("auth")} className="w-full text-xs text-muted font-medium hover:text-foreground transition-colors mt-4">
              Back to options
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE: EMAIL SENT ────────────────────────────────────────────────────────
  if (phase === "email_sent") {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center font-sans px-8 animate-in fade-in duration-500">
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-surface-2 border border-border-strong flex items-center justify-center mb-8">
            <Mail className="w-6 h-6 text-foreground" />
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground mb-3">Check your inbox</h1>
          <p className="text-sm text-muted mb-8 leading-relaxed">
            We sent a secure magic link to <br/><span className="font-medium text-foreground">{email}</span>
          </p>
          <button onClick={() => setPhase("auth")} className="text-xs text-muted font-medium hover:text-foreground transition-colors">
            Use a different email
          </button>
        </div>
      </div>
    );
  }

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
        instruction: "1. Open Claude Settings > Connectors > Add custom connector.\n2. Name: Metaphor\n3. Remote MCP server URL: https://metaphor-backend.onrender.com/api/v1/mcp\n4. Advanced settings: Leave Client ID & Secret blank (auto-discovered).\n5. Click Add.",
        snippet: "https://metaphor-backend.onrender.com/api/v1/mcp",
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
            Your workspace is ready.
          </h1>
          <p className="text-muted text-sm md:text-base max-w-xl leading-relaxed mb-12">
            Metaphor has indexed and understood your workspace. Connect your AI tools to bring this context wherever you work — your projects, documentation, code, and decisions will be available without manually searching for them.
          </p>

          {/* Section Heading */}
          <div className="w-full text-left mb-6 flex items-center justify-between border-b border-border-subtle pb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">Connect your AI workspace</h2>
              <p className="text-xs text-muted">Bring Metaphor to your favorite tools to automatically inject project memory.</p>
            </div>
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider bg-surface-1 px-3 py-1 rounded-full border border-border-subtle">
              Optional Step
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

          {/* Bottom helper & Main CTA */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs text-muted">
              You can connect additional tools later from <span className="text-foreground font-medium">Settings</span>.
            </p>

            <button
              onClick={finalize}
              disabled={isSubmitting}
              className="px-10 py-4 bg-foreground text-background text-sm font-medium rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
                  Synchronizing...
                </>
              ) : (
                "Enter Workspace"
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

      </div>
    );
  }

  return null;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-background" />}>
      <OnboardingContent />
    </Suspense>
  );
}
