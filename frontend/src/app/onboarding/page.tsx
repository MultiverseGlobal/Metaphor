"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, ChevronRight, Link2, Database, LayoutTemplate, Briefcase, Zap } from "lucide-react";
import { fetchFromMetaphor } from "../api";

// ─── Icons ─────────────────────�const NotionIcon = () => (
  <img src="/icons/notion.svg" width="20" height="20" alt="Notion" />
);

const GoogleIcon = () => (
  <img src="/icons/google.svg" width="20" height="20" alt="Google" />
);

const SlackIcon = () => (
  <img src="/icons/slack.svg" width="20" height="20" alt="Slack" />
);27 2.527 0 0 1-2.523-2.523 2.526 2.526 0 0 1 2.523-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
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

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "connect" | "analyzing" | "resolving" | "complete";

const AMBIGUITY_QUESTIONS = [
  "What is your current highest priority?",
  "Is there anything your AI should *never* do or suggest?",
  "How would you describe your preferred communication style?"
];

// ─── Connect Phase Component ──────────────────────────────────────────────────

function ConnectCard({ name, icon, connected, onToggle }: { name: string, icon: React.ReactNode, connected: boolean, onToggle: () => void }) {
  return (
    <button 
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${connected ? 'bg-surface-2 border-foreground' : 'bg-transparent border-border-subtle hover:border-border-strong'}`}
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
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("connect");
  
  // Connect State
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  
  // Analyzing State
  const [analysisStep, setAnalysisStep] = useState(0);
  
  // Resolving State
  const [resolvingIndex, setResolvingIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when resolving starts
  useEffect(() => {
    if (phase === "resolving" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase, resolvingIndex]);

  // Handle Analysis Animation
  useEffect(() => {
    if (phase === "analyzing") {
      const interval = setInterval(() => {
        setAnalysisStep(s => {
          if (s >= 3) {
            clearInterval(interval);
            setTimeout(() => setPhase("resolving"), 800);
            return s;
          }
          return s + 1;
        });
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const toggleConnection = (id: string) => {
    setConnections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const submitAmbiguityAnswer = () => {
    if (!currentAnswer.trim()) return;
    setCurrentAnswer("");
    if (resolvingIndex < AMBIGUITY_QUESTIONS.length - 1) {
      setResolvingIndex(prev => prev + 1);
    } else {
      setPhase("complete");
    }
  };

  const finalize = async () => {
    try {
      localStorage.setItem("metaphor_onboarded", "true");
      router.push("/dashboard");
    } catch (e: any) {
      console.error(e);
    }
  };

  // ── PHASE: CONNECT ────────────────────────────────────────────────────────────
  if (phase === "connect") {
    const connectedCount = Object.values(connections).filter(Boolean).length;
    
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center font-sans px-8 animate-in fade-in duration-700">
        <div className="w-full max-w-md flex flex-col">

          <div className="mb-12 text-center">
            <h1 className="text-3xl font-light tracking-tight text-foreground mb-4">
              Connect your knowledge.
            </h1>
            <p className="text-muted text-sm leading-relaxed">
              Metaphor builds your context engine by reading what you've already written. 
              The more you connect, the smarter it gets.
            </p>
          </div>

          <div className="space-y-4 mb-12">
            <ConnectCard name="Notion" icon={<NotionIcon />} connected={!!connections["notion"]} onToggle={() => toggleConnection("notion")} />
            <ConnectCard name="Google Workspace" icon={<GoogleIcon />} connected={!!connections["google"]} onToggle={() => toggleConnection("google")} />
            <ConnectCard name="Slack" icon={<SlackIcon />} connected={!!connections["slack"]} onToggle={() => toggleConnection("slack")} />
          </div>

          <button
            onClick={() => setPhase("analyzing")}
            className={`w-full px-8 py-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              connectedCount > 0 
                ? "bg-foreground text-background hover:opacity-90" 
                : "bg-surface-2 text-foreground hover:bg-surface-1"
            }`}
          >
            {connectedCount > 0 ? `Import & Analyze ${connectedCount} Source${connectedCount > 1 ? 's' : ''}` : "Skip for now"}
          </button>
        </div>
      </div>
    );
  }

  // ── PHASE: ANALYZING ─────────────────────────────────────────────────────────
  if (phase === "analyzing") {
    const analysisSteps = [
      "Reading workspaces and documents...",
      "Extracting core projects and goals...",
      "Building relationship graph...",
      "Identifying missing context..."
    ];

    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center font-sans px-8 animate-in fade-in duration-500">
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          
          <div className="w-12 h-12 rounded-full border-2 border-surface-2 border-t-foreground animate-spin mb-10" />
          
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
            <div className={`flex flex-col items-center p-4 bg-surface-1 rounded-xl transition-opacity duration-700 ${analysisStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-2xl font-light text-foreground mb-1">12</span>
              <span className="text-xs text-muted font-medium">Projects found</span>
            </div>
            <div className={`flex flex-col items-center p-4 bg-surface-1 rounded-xl transition-opacity duration-700 ${analysisStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-2xl font-light text-foreground mb-1">28</span>
              <span className="text-xs text-muted font-medium">Documents read</span>
            </div>
            <div className={`flex flex-col items-center p-4 bg-surface-1 rounded-xl transition-opacity duration-700 ${analysisStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-2xl font-light text-foreground mb-1">4</span>
              <span className="text-xs text-muted font-medium">Companies</span>
            </div>
            <div className={`flex flex-col items-center p-4 bg-surface-1 rounded-xl transition-opacity duration-700 ${analysisStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-2xl font-light text-foreground mb-1">7</span>
              <span className="text-xs text-muted font-medium">Goals extracted</span>
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
        <div className="w-[400px] border-r border-border-subtle bg-surface-1 flex flex-col p-10 justify-center">
          <div className="mb-10">
            <h2 className="text-lg font-medium text-foreground mb-2">We found most of your context.</h2>
            <p className="text-sm text-muted">Metaphor has successfully mapped your workspace structure.</p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted mb-3">Organization</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
                  <Database className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">Multiverse Global</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted mb-3">Core Projects</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
                    <LayoutTemplate className="w-4 h-4 text-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Atlas Platform</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Metaphor OS</span>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-border-subtle">
              <p className="text-xs font-mono uppercase tracking-widest text-muted mb-3">Missing Context</p>
              <p className="text-sm text-muted">We couldn't infer {AMBIGUITY_QUESTIONS.length} strategic details from your documents.</p>
            </div>
          </div>
        </div>

        {/* ── Right: Ambiguity Resolution ── */}
        <div className="flex-1 flex flex-col justify-center px-16 max-w-2xl">
          <div className="mb-8 animate-in slide-in-from-bottom-2 duration-500">
            
            <div className="flex items-center gap-2 mb-6">
              <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-medium">
                {resolvingIndex + 1}
              </span>
              <span className="text-xs font-medium text-muted uppercase tracking-widest">of {AMBIGUITY_QUESTIONS.length}</span>
            </div>

            <p className="text-2xl font-light tracking-tight text-foreground mb-8 leading-snug">
              {AMBIGUITY_QUESTIONS[resolvingIndex]}
            </p>

            <div className="flex items-center gap-4 border-b border-border-strong pb-3">
              <input
                ref={inputRef}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitAmbiguityAnswer(); }}
                placeholder="Type your answer..."
                className="flex-1 bg-transparent text-foreground text-lg font-light placeholder:text-muted/40 focus:outline-none"
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

          <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-8">
            <CheckCircle2 className="w-8 h-8 text-foreground" />
          </div>

          <h1 className="text-3xl font-light tracking-tight text-foreground mb-4">
            Your shared context is ready.
          </h1>
          <p className="text-muted text-sm mb-16 max-w-md">
            Metaphor has mapped your entire digital workspace and resolved all ambiguities. You can now connect your AI tools.
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
            className="text-sm font-medium text-muted hover:text-foreground transition-colors underline underline-offset-4"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}
