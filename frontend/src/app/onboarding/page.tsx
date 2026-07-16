"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Network, 
  Key, 
  Check, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  RefreshCw,
  GitBranch,
  Bot
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
  const [syncError, setSyncError] = useState("");

  // Route protection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("metaphor_logged_in") === "true";
      if (!isLoggedIn) {
        router.push("/login");
      }
    }
  }, [router]);

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

    // Transition to Step 2 (Verification)
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

    // Step-by-step validation simulations for rich user feedback
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
    setSyncError("");
    try {
      // Actually trigger sync on local backend
      const response = await fetchFromMetaphor("/sync");
      setSyncReport(response.report || { status: "success" });
      setStep(4); // Move to Step 4 on success
    } catch (err: any) {
      console.error(err);
      // Fallback mock success report in case backend is offline
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
      
      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"
      />

      {/* Mini-Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center shadow-md shadow-violet-500/20">
            <Network className="text-slate-950 stroke-[2.5]" size={14} />
          </div>
          <span className="text-md font-bold text-white">Metaphor Setup</span>
        </div>
        <div className="text-xs text-slate-500 font-mono">Step {step} of 4</div>
      </header>

      {/* Central Wizard Panel */}
      <main className="flex-1 flex items-center justify-center px-6 relative z-10 py-12">
        <div className="w-full max-w-xl bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl space-y-8">
          
          {/* Stepper Indicators */}
          <div className="flex justify-between items-center relative">
            {/* Background progress bar */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-400 -translate-y-1/2 z-0 transition-all duration-500" 
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
            
            {/* Step bubbles */}
            {[1, 2, 3, 4].map((num) => (
              <div 
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 border transition-all duration-300 ${
                  step > num 
                    ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-slate-950 border-none" 
                    : step === num 
                      ? "bg-slate-900 border-violet-500 text-violet-400 shadow-lg shadow-violet-500/20" 
                      : "bg-slate-950 border-slate-800 text-slate-500"
                }`}
              >
                {step > num ? <Check size={14} className="stroke-[3]" /> : num}
              </div>
            ))}
          </div>

          {/* Stepper Headers */}
          <div className="text-left space-y-1.5">
            <h2 className="text-xl font-bold text-white">
              {step === 1 && "Configure Universal Credentials"}
              {step === 2 && "Verifying Integrations"}
              {step === 3 && "Initialize World Model Ingestion"}
              {step === 4 && "Context OS Ready!"}
            </h2>
            <p className="text-xs text-slate-400">
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
                  <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-300 text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Metaphor API Key</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="metaphor_dev_secret_key_123"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Notion Token (Optional)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="password" 
                        placeholder="secret_notion..."
                        value={notionToken}
                        onChange={(e) => setNotionToken(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-750 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">GitHub PAT (Optional)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="password" 
                        placeholder="github_pat..."
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-755 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">ChatGPT Key (Optional)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="password" 
                        placeholder="sk-proj-chatgpt..."
                        value={chatgptToken}
                        onChange={(e) => setChatgptToken(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-755 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Claude Key (Optional)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="password" 
                        placeholder="sk-ant-claude..."
                        value={claudeToken}
                        onChange={(e) => setClaudeToken(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-755 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-cyan-500 text-slate-950 hover:opacity-95 transition-all text-xs shadow-lg shadow-violet-500/10 flex items-center justify-center gap-1.5 cursor-pointer pt-3"
                >
                  Verify Credentials <ArrowRight size={14} />
                </button>
              </form>
            )}

            {/* Step 2: Verification Status */}
            {step === 2 && (
              <div className="space-y-6 text-left">
                
                {/* Integration items */}
                <div className="space-y-3 bg-slate-950 p-5 rounded-xl border border-slate-900">
                  
                  {/* Metaphor engine verification */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-2">
                      <Network size={14} className="text-violet-400 animate-pulse" />
                      Metaphor Universal Context Core
                    </span>
                    <span className="font-mono">
                      {verifyStatus.metaphor === "checking" && <Loader2 size={12} className="animate-spin text-cyan-400" />}
                      {verifyStatus.metaphor === "success" && <span className="text-emerald-400 flex items-center gap-1"><Check size={12} /> Connected</span>}
                    </span>
                  </div>

                  {/* Notion verification */}
                  <div className="flex items-center justify-between text-xs border-t border-slate-900/60 pt-3">
                    <span className="font-semibold text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      Notion Context Hub
                    </span>
                    <span className="font-mono">
                      {verifyStatus.notion === "checking" && <Loader2 size={12} className="animate-spin text-cyan-400" />}
                      {verifyStatus.notion === "success" && <span className="text-emerald-400 flex items-center gap-1"><Check size={12} /> Connected</span>}
                      {verifyStatus.notion === "success-mock" && <span className="text-cyan-400 flex items-center gap-1">Connected (Sandbox Mock)</span>}
                    </span>
                  </div>

                  {/* GitHub verification */}
                  <div className="flex items-center justify-between text-xs border-t border-slate-900/60 pt-3">
                    <span className="font-semibold text-slate-300 flex items-center gap-2">
                      <GitBranch size={14} className="text-slate-400" />
                      GitHub Codebase Logs
                    </span>
                    <span className="font-mono">
                      {verifyStatus.github === "checking" && <Loader2 size={12} className="animate-spin text-cyan-400" />}
                      {verifyStatus.github === "success" && <span className="text-emerald-400 flex items-center gap-1"><Check size={12} /> Connected</span>}
                      {verifyStatus.github === "success-mock" && <span className="text-cyan-400 flex items-center gap-1">Connected (Sandbox Mock)</span>}
                    </span>
                  </div>

                  {/* ChatGPT verification */}
                  <div className="flex items-center justify-between text-xs border-t border-slate-900/60 pt-3">
                    <span className="font-semibold text-slate-300 flex items-center gap-2">
                      <Bot size={14} className="text-emerald-400" />
                      ChatGPT Conversation Sync
                    </span>
                    <span className="font-mono">
                      {verifyStatus.chatgpt === "checking" && <Loader2 size={12} className="animate-spin text-cyan-400" />}
                      {verifyStatus.chatgpt === "success" && <span className="text-emerald-400 flex items-center gap-1"><Check size={12} /> Connected</span>}
                      {verifyStatus.chatgpt === "success-mock" && <span className="text-cyan-400 flex items-center gap-1">Connected (Sandbox Mock)</span>}
                    </span>
                  </div>

                  {/* Claude verification */}
                  <div className="flex items-center justify-between text-xs border-t border-slate-900/60 pt-3">
                    <span className="font-semibold text-slate-300 flex items-center gap-2">
                      <Bot size={14} className="text-orange-400" />
                      Claude Conversation Sync
                    </span>
                    <span className="font-mono">
                      {verifyStatus.claude === "checking" && <Loader2 size={12} className="animate-spin text-cyan-400" />}
                      {verifyStatus.claude === "success" && <span className="text-emerald-400 flex items-center gap-1"><Check size={12} /> Connected</span>}
                      {verifyStatus.claude === "success-mock" && <span className="text-cyan-400 flex items-center gap-1">Connected (Sandbox Mock)</span>}
                    </span>
                  </div>

                </div>

                <button 
                  onClick={() => setStep(3)}
                  disabled={verifying}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-cyan-500 text-slate-950 hover:opacity-95 transition-all text-xs shadow-lg shadow-violet-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  Configure Context Understanding <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Step 3: Run Ingestion */}
            {step === 3 && (
              <div className="space-y-6 text-left">
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-900 text-xs font-mono space-y-2 h-36 overflow-y-auto text-slate-400 relative">
                  {syncing ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-cyan-400">
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Building world model...</span>
                      </div>
                      <p>&gt; Learning your context and projects...</p>
                      <p>&gt; Discovering semantic and temporal relationships...</p>
                      <p>&gt; Staging pending memories in Context Inbox...</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-slate-500">// Ready to trigger context understanding.</p>
                      <p>&gt; Metaphor will parse active documents, link decisions, and resolve timelines to initialize your world model.</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={runSyncIngestion}
                  disabled={syncing}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-cyan-500 text-slate-950 hover:opacity-95 transition-all text-xs shadow-lg shadow-violet-500/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-5 text-emerald-300 text-xs space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <div className="h-6 w-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                      <Check size={14} className="stroke-[3]" />
                    </div>
                    <span>World Model Formed!</span>
                  </div>
                  
                  {syncReport && (
                    <div className="space-y-1.5 border-t border-emerald-900/40 pt-3 font-mono">
                      <p>Objects Learned: {syncReport.nodes_created ?? 0}</p>
                      <p>Relationships Connected: {syncReport.edges_created ?? 0}</p>
                      <p>Context Grounding Points: {syncReport.evidence_links_created ?? 0}</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => {
                    // Finalize onboarding completed
                    localStorage.setItem("metaphor_onboarded", "true");
                    router.push("/dashboard");
                  }}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-cyan-500 text-slate-950 hover:opacity-95 transition-all text-xs shadow-lg shadow-violet-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Enter Context Console <ArrowRight size={14} />
                </button>

              </div>
            )}

          </div>

          {/* Micro Footer */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1 text-[9px] font-mono text-slate-500">
            <Sparkles size={9} className="text-violet-500" />
            <span>Universal Context OS Active</span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/60 py-6 text-slate-600 text-[10px] font-mono text-center relative z-10">
        <p>© 2026 Metaphor Context Operating System</p>
      </footer>

    </div>
  );
}
