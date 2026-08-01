"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z"/>
  </svg>
);

const ClaudeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/>
  </svg>
);

const CursorIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12.9265 19.3093C12.8252 19.7828 12.3551 20.0886 11.8762 19.9922L4.03225 18.4116C3.55331 18.3152 3.2476 17.8532 3.34888 17.3798L6.47648 2.76634C6.57776 2.29288 7.04786 1.98711 7.5268 2.08354L21.435 4.88587C21.914 4.9823 22.2197 5.44438 22.1184 5.91784L12.9265 19.3093Z" />
  </svg>
);

const GithubIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className={className}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
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

function ConnectCard({ name, icon, connected, onToggle, children }: { name: string, icon: React.ReactNode, connected: boolean, onToggle: () => void, children?: React.ReactNode }) {
  return (
    <div className={`w-full flex flex-col rounded-xl border transition-all duration-300 ${connected ? 'bg-surface-2 border-foreground' : 'bg-transparent border-border-subtle hover:border-border-strong'}`}>
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${connected ? 'bg-foreground text-background' : 'bg-surface-2 text-muted'}`}>
            {icon}
          </div>
          <span className={`text-sm font-medium ${connected ? 'text-foreground' : 'text-muted'}`}>{name}</span>
        </div>
        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${connected ? 'border-foreground bg-foreground' : 'border-border-strong'}`}>
          {connected && <CheckCircle2 className="w-3 h-3 text-background" />}
        </div>
      </button>
      {connected && children && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-2 fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("auth");
  
  // Email Auth State
  const [email, setEmail] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  
  // Connect State
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [githubRepo, setGithubRepo] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [notionToken, setNotionToken] = useState("");
  
  // Analyzing State
  const [analysisStep, setAnalysisStep] = useState(0);
  
  // Resolving State
  const [resolvingIndex, setResolvingIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Complete State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus input when resolving starts
  useEffect(() => {
    if (phase === "resolving" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase, resolvingIndex]);

  // Handle Analysis Animation & Polling
  useEffect(() => {
    if (phase === "analyzing") {
      const animationInterval = setInterval(() => {
        setAnalysisStep(s => (s >= 3 ? 3 : s + 1));
      }, 1500);

      let isPolling = true;
      const pollStatus = async () => {
        while (isPolling) {
          try {
            const statusRes = await fetchFromMetaphor("/integrations/status", undefined, "GET");
            if (statusRes.has_data || statusRes.status === "completed") {
              isPolling = false;
              clearInterval(animationInterval);
              setPhase("resolving");
              break;
            }
          } catch (e) {
            console.warn("Polling error:", e);
          }
          await new Promise(r => setTimeout(r, 3000));
        }
      };
      
      pollStatus();

      return () => {
        isPolling = false;
        clearInterval(animationInterval);
      };
    }
  }, [phase]);

  // Check if already authenticated on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && phase === "auth") {
        setPhase("connect");
      }
    });
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

  const toggleConnection = (id: string) => {
    setConnections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const submitAmbiguityAnswer = async () => {
    if (!currentAnswer.trim()) return;
    
    const newAnswers = [...answers, currentAnswer.trim()];
    setAnswers(newAnswers);
    
    try {
      await fetchFromMetaphor("/context/lore", { 
        content: `User prefers: ${currentAnswer.trim()} regarding '${AMBIGUITY_QUESTIONS[resolvingIndex]}'` 
      });
    } catch(e) {
      console.error("Failed to save context", e);
    }

    setCurrentAnswer("");
    if (resolvingIndex < AMBIGUITY_QUESTIONS.length - 1) {
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

          <div className="space-y-3 mb-10 text-left">
            <ConnectCard name="Notion" icon={<NotionIcon />} connected={!!connections["notion"]} onToggle={() => toggleConnection("notion")}>
              <div className="space-y-2 mt-1">
                <input 
                  type="text" 
                  placeholder="Notion Integration Token (optional)"
                  value={notionToken}
                  onChange={e => setNotionToken(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border-strong bg-background text-foreground text-xs placeholder:text-muted focus:outline-none focus:border-foreground"
                />
                <p className="text-[10px] text-muted ml-1">A token is optional for this demo. Mock data will be used if omitted.</p>
              </div>
            </ConnectCard>
            
            <ConnectCard name="Google Drive" icon={<GoogleDriveIcon />} connected={!!connections["google"]} onToggle={() => toggleConnection("google")} />
            
            <ConnectCard name="GitHub" icon={<GithubIcon className="opacity-80" />} connected={!!connections["github"]} onToggle={() => toggleConnection("github")}>
              <div className="space-y-2 mt-1">
                <input 
                  type="text" 
                  placeholder="Repository (e.g. yourname/yourrepo)"
                  value={githubRepo}
                  onChange={e => setGithubRepo(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border-strong bg-background text-foreground text-xs placeholder:text-muted focus:outline-none focus:border-foreground"
                />
                <input 
                  type="password" 
                  placeholder="Personal Access Token (optional)"
                  value={githubToken}
                  onChange={e => setGithubToken(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border-strong bg-background text-foreground text-xs placeholder:text-muted focus:outline-none focus:border-foreground"
                />
                <p className="text-[10px] text-muted ml-1">Used for private repositories or avoiding rate limits.</p>
              </div>
            </ConnectCard>
          </div>

          <button
            onClick={startIntegrationSync}
            className={`w-full px-8 py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              connectedCount > 0 
                ? "bg-foreground text-background shadow-md hover:opacity-90" 
                : "bg-surface-2 text-foreground hover:bg-surface-1"
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
      "Connecting to integrations...",
      "Mapping directory structures...",
      "Extracting organizational context...",
      "Building relationship graph..."
    ];

    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center font-sans px-8 animate-in fade-in duration-500">
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          
          <MetaphorLogo size={64} className="mb-10 text-primary animate-pulse" />
          
          <div className="h-8 relative w-full overflow-hidden mb-12">
            {analysisSteps.map((step, idx) => (
              <p 
                key={idx}
                className={`absolute inset-0 w-full text-sm font-medium transition-all duration-500 flex items-center justify-center ${
                  idx === analysisStep 
                    ? "opacity-100 translate-y-0 text-foreground" 
                    : idx < analysisStep 
                      ? "opacity-0 -translate-y-4 text-muted" 
                      : "opacity-0 translate-y-4 text-muted"
                }`}
              >
                {step}
              </p>
            ))}
          </div>

          <div className="w-full grid grid-cols-2 gap-4">
            <div className={`flex flex-col items-center p-4 bg-surface-1 border border-border-subtle rounded-xl transition-opacity duration-700 ${analysisStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-2xl font-light text-foreground mb-1">12</span>
              <span className="text-xs text-muted font-medium">Projects found</span>
            </div>
            <div className={`flex flex-col items-center p-4 bg-surface-1 border border-border-subtle rounded-xl transition-opacity duration-700 ${analysisStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-2xl font-light text-foreground mb-1">148</span>
              <span className="text-xs text-muted font-medium">Documents read</span>
            </div>
            <div className={`flex flex-col items-center p-4 bg-surface-1 border border-border-subtle rounded-xl transition-opacity duration-700 ${analysisStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-2xl font-light text-foreground mb-1">3</span>
              <span className="text-xs text-muted font-medium">Companies</span>
            </div>
            <div className={`flex flex-col items-center p-4 bg-surface-1 border border-border-subtle rounded-xl transition-opacity duration-700 ${analysisStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-2xl font-light text-foreground mb-1">2,410</span>
              <span className="text-xs text-muted font-medium">Nodes created</span>
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
              <p className="text-sm text-muted">We couldn't determine {AMBIGUITY_QUESTIONS.length} specific details.</p>
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
              <span className="text-xs font-bold text-muted uppercase tracking-widest">of {AMBIGUITY_QUESTIONS.length}</span>
            </div>

            <p className="text-3xl font-medium tracking-tight text-foreground mb-8 leading-snug">
              {AMBIGUITY_QUESTIONS[resolvingIndex]}
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
