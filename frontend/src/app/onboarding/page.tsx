"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

import { ArrowRight, CheckCircle2, ChevronRight, Database, LayoutTemplate, Zap, Mail } from "lucide-react";
import { fetchFromMetaphor } from "@/app/api";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";
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

const ChatGPTIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="opacity-80">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7947.7947 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.771.771 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.3643l2.0153-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3974-.667zm2.0106-3.0231l-.1419-.0852-4.7735-2.7818a.7758.7758 0 0 0-.7854 0L9.409 9.2297V6.8974a.071.071 0 0 1 .0332-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.6577zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805-4.783 2.7582a.771.771 0 0 0-.3927.6813v6.7226zm1.1041-1.8105l2.6019-1.5009 2.6019 1.5009v3.0018l-2.6019 1.5009-2.6019-1.5009z"/>
  </svg>
);

const ClaudeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="opacity-80">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7947.7947 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.771.771 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.3643l2.0153-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3974-.667zm2.0106-3.0231l-.1419-.0852-4.7735-2.7818a.7758.7758 0 0 0-.7854 0L9.409 9.2297V6.8974a.071.071 0 0 1 .0332-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.6577zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805-4.783 2.7582a.771.771 0 0 0-.3927.6813v6.7226zm1.1041-1.8105l2.6019-1.5009 2.6019 1.5009v3.0018l-2.6019 1.5009-2.6019-1.5009z"/>
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className={className}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const CursorIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12.9265 19.3093C12.8252 19.7828 12.3551 20.0886 11.8762 19.9922L4.03225 18.4116C3.55331 18.3152 3.2476 17.8532 3.34888 17.3798L6.47648 2.76634C6.57776 2.29288 7.04786 1.98711 7.5268 2.08354L21.435 4.88587C21.914 4.9823 22.2197 5.44438 22.1184 5.91784L12.9265 19.3093Z" />
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

  // Check URL query parameters for OAuth success redirect (e.g. ?success=notion)
  useEffect(() => {
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
    }
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
      // Smooth percentage ticker up to 92% (reserves final 100% for transition)
      const progressInterval = setInterval(() => {
        setProgressPercent(p => {
          if (p >= 92) return 92;
          const next = p + Math.floor(Math.random() * 8) + 4;
          return next > 92 ? 92 : next;
        });
      }, 600);

      const animationInterval = setInterval(() => {
        setAnalysisStep(s => (s >= 3 ? 3 : s + 1));
      }, 2000);

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

            if ((statusRes && (statusRes.has_data || statusRes.status === "completed")) || attempts >= 4) {
              isPolling = false;
              clearInterval(animationInterval);
              clearInterval(progressInterval);
              setProgressPercent(100);
              setAnalysisStep(3);
              
              try {
                const qRes = await fetchFromMetaphor("/context/generate-ambiguities", undefined, "POST");
                if (qRes && qRes.questions && qRes.questions.length > 0) {
                  setQuestions(qRes.questions);
                }
              } catch(e) {
                console.warn("Failed to generate ambiguities:", e);
              }

              setTimeout(() => {
                setPhase("resolving");
              }, 600);
              break;
            }
          } catch (e) {
            console.warn("Polling error:", e);
          }
          await new Promise(r => setTimeout(r, 2500));
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

  // Check for session and OAuth redirects
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setPhase(prev => (prev === "auth" || prev === "email_auth" || prev === "email_sent" ? "connect" : prev));
      }
    });

    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    if (success) {
      setConnections(prev => ({ ...prev, [success]: true }));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleEmailAuth = async () => {
    if (!email) return;
    setIsEmailLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    setIsEmailLoading(false);
    if (error) {
      alert("Error sending magic link: " + error.message);
    } else {
      setPhase("email_sent");
    }
  };

  const supabase = createClient();

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })
    if (error) {
      console.error(error)
      alert("Error logging in: " + error.message)
    }
  };

  const toggleConnection = async (id: string) => {
    if (connections[id]) {
      setConnections(prev => ({ ...prev, [id]: false }));
      return;
    }
    
    setConnecting(id);
    
    try {
      const res = await fetchFromMetaphor(`/integrations/${id}/authorize`, undefined, "GET");
      if (res && res.url) {
        window.location.href = res.url;
      } else {
        setConnecting(null);
      }
    } catch (e: any) {
      console.error(`Failed to start ${id} OAuth flow:`, e);
      alert(`Error starting ${id} integration: ${e.message || e}`);
      setConnecting(null);
    }
  };

  const submitAmbiguityAnswer = async () => {
    if (!currentAnswer.trim()) return;
    
    const newAnswers = [...answers, currentAnswer.trim()];
    setAnswers(newAnswers);
    
    try {
      await fetchFromMetaphor("/context/lore", { 
        content: `User prefers: ${currentAnswer.trim()} regarding '${questions[resolvingIndex]}'` 
      });
    } catch(e) {
      console.error("Failed to save context", e);
    }

    setCurrentAnswer("");
    if (resolvingIndex < questions.length - 1) {
      setResolvingIndex(prev => prev + 1);
    } else {
      setPhase("complete");
    }
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

  // ── PHASE: AUTH (WORKSPACE CREATION) ─────────────────────────────────────────
  if (phase === "auth") {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center font-sans px-8 animate-in fade-in duration-700">
        <div className="w-full max-w-sm flex flex-col items-center">
          
          <MetaphorLogo size={48} className="mb-10 text-foreground" />

          <div className="mb-12 text-center w-full">
            <h1 className="text-3xl font-medium tracking-tight text-foreground mb-4">
              Create your private workspace
            </h1>
          </div>

          <div className="space-y-4 w-full">
            <AuthButton icon={<GoogleLogo />} label="Continue with Google" onClick={() => handleOAuthLogin('google')} />
            <AuthButton icon={<GithubIcon className="opacity-80" />} label="Continue with GitHub" onClick={() => handleOAuthLogin('github')} />
            <AuthButton icon={<AppleIcon />} label="Continue with Apple" onClick={() => handleOAuthLogin('apple')} />
            
            <div className="py-2 flex items-center gap-4 w-full">
              <div className="flex-1 border-t border-border-subtle"></div>
              <span className="text-xs text-muted font-medium">or</span>
              <div className="flex-1 border-t border-border-subtle"></div>
            </div>

            <AuthButton icon={<Mail className="w-5 h-5 text-foreground opacity-80" />} label="Continue with Email" onClick={() => setPhase("email_auth")} />
          </div>

          <p className="mt-10 text-xs text-muted max-w-[280px] text-center leading-relaxed">
            By creating a workspace, you agree to our Terms of Service and Privacy Policy. Data is encrypted and stored locally-first.
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

    const displayEvents = Math.max(stats.total_events, Math.floor(progressPercent * 1.8));
    const displayEdges = Math.max(stats.edge_count, Math.floor(progressPercent * 1.2));
    const displaySessions = Math.max(stats.active_sessions, progressPercent > 10 ? 1 : 0);
    const displayNodes = Math.max(stats.node_count, Math.floor(progressPercent * 0.9));

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

          {/* Dynamic Activity Metrics */}
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center p-3.5 bg-surface-1 border border-border-subtle rounded-xl">
              <span className="text-xl font-light text-foreground mb-0.5 font-mono">{displayEvents}</span>
              <span className="text-[11px] text-muted font-medium">Events processed</span>
            </div>
            <div className="flex flex-col items-center p-3.5 bg-surface-1 border border-border-subtle rounded-xl">
              <span className="text-xl font-light text-foreground mb-0.5 font-mono">{displayEdges}</span>
              <span className="text-[11px] text-muted font-medium">Relationships mapped</span>
            </div>
            <div className="flex flex-col items-center p-3.5 bg-surface-1 border border-border-subtle rounded-xl">
              <span className="text-xl font-light text-foreground mb-0.5 font-mono">{displaySessions}</span>
              <span className="text-[11px] text-muted font-medium">Active sessions</span>
            </div>
            <div className="flex flex-col items-center p-3.5 bg-surface-1 border border-border-subtle rounded-xl">
              <span className="text-xl font-light text-foreground mb-0.5 font-mono">{displayNodes}</span>
              <span className="text-[11px] text-muted font-medium">Nodes created</span>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── PHASE: RESOLVING ────────────────────────────────────────────────────────
  if (phase === "resolving") {
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
          <div className="mb-8 animate-in slide-in-from-bottom-2 duration-500">
            
            <div className="flex items-center gap-3 mb-8">
              <span className="w-6 h-6 rounded-full bg-primary text-background flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(78,108,242,0.3)]">
                {resolvingIndex + 1}
              </span>
              <span className="text-xs font-bold text-muted uppercase tracking-widest">of {questions.length}</span>
            </div>

            <p className="text-3xl font-medium tracking-tight text-foreground mb-8 leading-snug">
              {questions[resolvingIndex]}
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
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center font-sans px-8 animate-in fade-in duration-700">
        <div className="w-full max-w-xl flex flex-col text-center items-center">

          <MetaphorLogo size={48} className="mb-8 text-foreground" />

          <h1 className="text-3xl font-medium tracking-tight text-foreground mb-4">
            Your workspace is ready.
          </h1>
          <p className="text-muted text-sm mb-16 max-w-md">
            Metaphor has mapped your entire digital workspace. You can now inject this understanding into your AI consumers.
          </p>

          <div className="flex items-center gap-6 mb-16 w-full justify-center">
            {[
              { name: "ChatGPT", icon: <ChatGPTIcon /> },
              { name: "Claude", icon: <ClaudeIcon /> },
              { name: "Cursor", icon: <CursorIcon /> }
            ].map((ai) => (
              <div key={ai.name} className="flex flex-col items-center gap-3">
                <button className="w-16 h-16 rounded-2xl bg-surface-1 border border-border-subtle hover:border-border-strong hover:bg-surface-2 transition-all flex items-center justify-center">
                  <div className="text-muted">{ai.icon}</div>
                </button>
                <span className="text-xs font-medium text-foreground">Connect {ai.name}</span>
              </div>
            ))}
          </div>

          <button
            onClick={finalize}
            disabled={isSubmitting}
            className="px-8 py-4 bg-foreground text-background text-sm font-medium rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm flex items-center gap-2"
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
