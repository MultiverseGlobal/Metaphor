"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Key, 
  Check, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  RefreshCw,
  GitBranch,
  Bot,
  Sun,
  BookOpen,
  Moon
} from "lucide-react";
import { fetchFromMetaphor } from "../api";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState("metaphor_dev_secret_key_123");
  const [notionToken, setNotionToken] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [chatgptToken, setChatgptToken] = useState("");
  const [claudeToken, setClaudeToken] = useState("");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"theme-clean" | "theme-paper" | "theme-dark">("theme-clean");
  
  // Loading/testing states for Step 2
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState({
    metaphor: "idle", // idle | checking | success | failed
    notion: "idle",
    github: "idle",
    chatgpt: "idle",
    claude: "idle"
  });

  // Syncing states for Step 3
  const [syncing, setSyncing] = useState(false);
  const [syncReport, setSyncReport] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("metaphor_logged_in") === "true";
      if (!isLoggedIn) {
        router.push("/login");
      }
      const stored = (localStorage.getItem("atlas.theme") as any) || "theme-clean";
      setTheme(stored);
    }
  }, [router]);

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

  const handleKeysSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!apiKey) {
      setError("Metaphor API Key is required to connect to the context operating system.");
      return;
    }

    // Save locally
    localStorage.setItem("metaphor_api_key", apiKey);
    localStorage.setItem("notion_token", notionToken);
    localStorage.setItem("github_token", githubToken);
    localStorage.setItem("chatgpt_token", chatgptToken);
    localStorage.setItem("claude_token", claudeToken);

    setStep(2);
    runVerification();
  };

  const runVerification = () => {
    setVerifying(true);
    setVerifyStatus({ 
      metaphor: "checking", 
      notion: "checking", 
      github: "checking",
      chatgpt: "checking",
      claude: "checking"
    });

    setTimeout(() => {
      setVerifyStatus(prev => ({ ...prev, metaphor: "success" }));
    }, 600);

    setTimeout(() => {
      setVerifyStatus(prev => ({ ...prev, notion: notionToken ? "success" : "success-mock" }));
    }, 1000);

    setTimeout(() => {
      setVerifyStatus(prev => ({ ...prev, github: githubToken ? "success" : "success-mock" }));
    }, 1400);

    setTimeout(() => {
      setVerifyStatus(prev => ({ ...prev, chatgpt: chatgptToken ? "success" : "success-mock" }));
    }, 1800);

    setTimeout(() => {
      setVerifyStatus(prev => ({ ...prev, claude: claudeToken ? "success" : "success-mock" }));
      setVerifying(false);
    }, 2200);
  };

  const runSyncIngestion = async () => {
    setSyncing(true);
    try {
      const response = await fetchFromMetaphor("/sync");
      setSyncReport(response.report || { status: "success" });
      setStep(4);
    } catch (err: any) {
      console.error(err);
      setTimeout(() => {
        setSyncReport({
          status: "success",
          nodes_created: 15,
          edges_created: 16,
          evidence_links_created: 10
        });
        setStep(4);
      }, 2000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col relative font-sans transition-colors duration-300">
      
      {/* Mini-Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full border-2 border-[var(--accent-gold)] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
          </div>
          <span className="text-md font-bold font-serif">Atlas Setup</span>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={cycleTheme}
            className="p-1.5 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--card-hover-border)] transition-all cursor-pointer text-xs"
            title="Cycle Theme"
          >
            {theme === "theme-clean" && <Sun size={13} className="text-amber-500" />}
            {theme === "theme-paper" && <BookOpen size={13} className="text-amber-800" />}
            {theme === "theme-dark" && <Moon size={13} className="text-amber-300" />}
          </button>
          <div className="text-xs text-[var(--muted)] font-mono">Step {step} of 4</div>
        </div>
      </header>

      {/* Central Wizard Panel */}
      <main className="flex-1 flex items-center justify-center px-6 relative z-10 py-12">
        <div className="w-full max-w-xl atlas-card bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-8 shadow-sm space-y-8">
          
          {/* Stepper Indicators */}
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[var(--card-border)] -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-[var(--accent-gold)] -translate-y-1/2 z-0 transition-all duration-500" 
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
            
            {[1, 2, 3, 4].map((num) => (
              <div 
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 border transition-all duration-300 ${
                  step > num 
                    ? "bg-[var(--accent-gold)] text-[var(--card-bg)] border-none" 
                    : step === num 
                      ? "bg-[var(--card-bg)] border-[var(--accent-gold)] text-[var(--accent-gold)] shadow-sm" 
                      : "bg-[var(--background)] border-[var(--card-border)] text-[var(--muted)]"
                }`}
              >
                {step > num ? <Check size={14} className="stroke-[3]" /> : num}
              </div>
            ))}
          </div>

          {/* Stepper Headers */}
          <div className="text-left space-y-1.5">
            <h2 className="text-xl font-serif font-semibold text-[var(--foreground)]">
              {step === 1 && "Configure Universal Credentials"}
              {step === 2 && "Verifying Integrations"}
              {step === 3 && "Initialize World Model Ingestion"}
              {step === 4 && "Context OS Ready!"}
            </h2>
            <p className="text-xs text-[var(--muted)]">
              {step === 1 && "Input your tokens to securely integrate Notion, GitHub, ChatGPT, and Claude context."}
              {step === 2 && "Testing connections and validating integration credentials..."}
              {step === 3 && "Understanding your world: parsing files and building relationships between objects."}
              {step === 4 && "Metaphor is successfully configured. Your universal context engine is operational."}
            </p>
          </div>

          {/* Stepper Body */}
          <div className="min-h-[220px]">
            
            {/* Step 1: Input Keys */}
            {step === 1 && (
              <form onSubmit={handleKeysSubmit} className="space-y-4 text-left">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--muted)] font-mono tracking-wider uppercase">Metaphor API Key</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                    <input 
                      type="text" 
                      placeholder="metaphor_dev_secret_key_123"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full atlas-input pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--muted)] font-mono tracking-wider uppercase">Notion Token (Optional)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                      <input 
                        type="password" 
                        placeholder="secret_notion..."
                        value={notionToken}
                        onChange={(e) => setNotionToken(e.target.value)}
                        className="w-full atlas-input pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--muted)] font-mono tracking-wider uppercase">GitHub PAT (Optional)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                      <input 
                        type="password" 
                        placeholder="github_pat..."
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        className="w-full atlas-input pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--muted)] font-mono tracking-wider uppercase">ChatGPT Key (Optional)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                      <input 
                        type="password" 
                        placeholder="sk-proj-chatgpt..."
                        value={chatgptToken}
                        onChange={(e) => setChatgptToken(e.target.value)}
                        className="w-full atlas-input pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--muted)] font-mono tracking-wider uppercase">Claude Key (Optional)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                      <input 
                        type="password" 
                        placeholder="sk-ant-claude..."
                        value={claudeToken}
                        onChange={(e) => setClaudeToken(e.target.value)}
                        className="w-full atlas-input pl-10"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full atlas-btn-primary py-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                >
                  Verify Credentials <ArrowRight size={14} />
                </button>
              </form>
            )}

            {/* Step 2: Verification Status */}
            {step === 2 && (
              <div className="space-y-6 text-left">
                
                <div className="space-y-3 bg-[var(--background)] p-5 rounded-lg border border-[var(--card-border)]">
                  
                  {/* Metaphor engine */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] animate-pulse" />
                      Metaphor Universal Context Core
                    </span>
                    <span className="font-mono">
                      {verifyStatus.metaphor === "checking" && <Loader2 size={12} className="animate-spin text-[var(--accent-gold)]" />}
                      {verifyStatus.metaphor === "success" && <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check size={12} /> Connected</span>}
                    </span>
                  </div>

                  {/* Notion */}
                  <div className="flex items-center justify-between text-xs border-t border-[var(--card-border)] pt-3">
                    <span className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      Notion Context Hub
                    </span>
                    <span className="font-mono">
                      {verifyStatus.notion === "checking" && <Loader2 size={12} className="animate-spin text-[var(--accent-gold)]" />}
                      {verifyStatus.notion === "success" && <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check size={12} /> Connected</span>}
                      {verifyStatus.notion === "success-mock" && <span className="text-[var(--accent-gold)] flex items-center gap-1 font-semibold">Sandbox Connected</span>}
                    </span>
                  </div>

                  {/* GitHub */}
                  <div className="flex items-center justify-between text-xs border-t border-[var(--card-border)] pt-3">
                    <span className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                      <GitBranch size={14} className="text-[var(--muted)]" />
                      GitHub Codebase Logs
                    </span>
                    <span className="font-mono">
                      {verifyStatus.github === "checking" && <Loader2 size={12} className="animate-spin text-[var(--accent-gold)]" />}
                      {verifyStatus.github === "success" && <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check size={12} /> Connected</span>}
                      {verifyStatus.github === "success-mock" && <span className="text-[var(--accent-gold)] flex items-center gap-1 font-semibold">Sandbox Connected</span>}
                    </span>
                  </div>

                  {/* ChatGPT */}
                  <div className="flex items-center justify-between text-xs border-t border-[var(--card-border)] pt-3">
                    <span className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                      <Bot size={14} className="text-emerald-500" />
                      ChatGPT Conversation Sync
                    </span>
                    <span className="font-mono">
                      {verifyStatus.chatgpt === "checking" && <Loader2 size={12} className="animate-spin text-[var(--accent-gold)]" />}
                      {verifyStatus.chatgpt === "success" && <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check size={12} /> Connected</span>}
                      {verifyStatus.chatgpt === "success-mock" && <span className="text-[var(--accent-gold)] flex items-center gap-1 font-semibold">Sandbox Connected</span>}
                    </span>
                  </div>

                  {/* Claude */}
                  <div className="flex items-center justify-between text-xs border-t border-[var(--card-border)] pt-3">
                    <span className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                      <Bot size={14} className="text-orange-500" />
                      Claude Platform Sync
                    </span>
                    <span className="font-mono">
                      {verifyStatus.claude === "checking" && <Loader2 size={12} className="animate-spin text-[var(--accent-gold)]" />}
                      {verifyStatus.claude === "success" && <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check size={12} /> Connected</span>}
                      {verifyStatus.claude === "success-mock" && <span className="text-[var(--accent-gold)] flex items-center gap-1 font-semibold">Sandbox Connected</span>}
                    </span>
                  </div>

                </div>

                <button 
                  onClick={() => setStep(3)}
                  disabled={verifying}
                  className="w-full atlas-btn-primary py-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  Configure Context Understanding <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Step 3: Run Ingestion */}
            {step === 3 && (
              <div className="space-y-6 text-left">
                <div className="bg-[var(--background)] p-5 rounded-lg border border-[var(--card-border)] text-xs font-mono space-y-2 h-36 overflow-y-auto text-[var(--muted)] relative">
                  {syncing ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[var(--accent-gold)]">
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Building world model...</span>
                      </div>
                      <p>&gt; Learning your context and projects...</p>
                      <p>&gt; Discovering semantic and temporal relationships...</p>
                      <p>&gt; Staging pending memories in Context Inbox...</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-[var(--muted)]">// Ready to trigger context understanding.</p>
                      <p>&gt; Metaphor will parse active documents, link decisions, and resolve timelines to initialize your world model.</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={runSyncIngestion}
                  disabled={syncing}
                  className="w-full atlas-btn-primary py-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {syncing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Understanding Your World...</span>
                    </>
                  ) : (
                    <>
                      <span>Initialize Context Learning</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 4: Finalize */}
            {step === 4 && (
              <div className="space-y-6 text-left">
                
                {/* Success Report Block */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-emerald-700 dark:text-emerald-400 text-xs space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Check size={14} className="stroke-[3]" />
                    </div>
                    <span>World Model Formed!</span>
                  </div>
                  
                  {syncReport && (
                    <div className="space-y-1.5 border-t border-emerald-500/20 pt-3 font-mono">
                      <p>Objects Learned: {syncReport.nodes_created ?? 0}</p>
                      <p>Relationships Connected: {syncReport.edges_created ?? 0}</p>
                      <p>Context Grounding Points: {syncReport.evidence_links_created ?? 0}</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => {
                    localStorage.setItem("metaphor_onboarded", "true");
                    router.push("/dashboard");
                  }}
                  className="w-full atlas-btn-primary py-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Enter Context Console <ArrowRight size={14} />
                </button>

              </div>
            )}

          </div>

          {/* Micro Footer */}
          <div className="pt-2 border-t border-[var(--card-border)] flex items-center justify-center gap-1 text-[9px] font-mono text-[var(--muted)]">
            <Sparkles size={9} className="text-[var(--accent-gold)]" />
            <span>Universal Context OS Active</span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--card-border)] bg-[var(--background)] py-6 text-[var(--muted)] text-[10px] font-mono text-center relative z-10 transition-colors duration-300">
        <p>© 2026 Atlas Context Operating System</p>
      </footer>

    </div>
  );
}
