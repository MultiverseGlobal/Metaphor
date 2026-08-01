"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import { fetchFromMetaphor } from "../api";

const ChatGPTIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
    <path d="M7.757 16.243a6 6 0 118.486-8.486M9 9l6 6M15 9l-6 6" />
  </svg>
);

const ClaudeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <circle cx="15.5" cy="8.5" r="1.5" />
    <path d="M9 15c1.5 1 4.5 1 6 0" />
  </svg>
);

const CursorIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
    <path d="M12 2L2 22l10-4 10 4L12 2z" />
    <path d="M12 2v16" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "intro" | "interview" | "complete";

interface Answer {
  question: string;
  answer: string;
}

interface Analysis {
  organization: string;
  projects: string[];
  goals: string[];
  preferences: string[];
  categories: {
    mission: number;
    projects: number;
    goals: number;
    preferences: number;
    constraints: number;
  };
  overall_confidence: number;
  reflection: string;
  next_question: string;
}

// ─── Confidence Bar ────────────────────────────────────────────────────────────

function ConfidenceBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-muted capitalize">{label}</span>
        <span className="text-xs font-mono text-foreground">{value}%</span>
      </div>
      <div className="h-1 w-full bg-surface-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("What are you currently working on?");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === "interview" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase, analysis]);

  const submitAnswer = async () => {
    if (!currentAnswer.trim() || isProcessing) return;

    const newAnswers: Answer[] = [...answers, { question: currentQuestion, answer: currentAnswer.trim() }];
    setAnswers(newAnswers);
    setCurrentAnswer("");
    setIsProcessing(true);

    try {
      const result: Analysis = await fetchFromMetaphor("/context/analyze-draft", { answers: newAnswers });
      setAnalysis(result);

      // End interview when confidence is high enough
      if (result.overall_confidence >= 80) {
        setPhase("complete");
      } else {
        setCurrentQuestion(result.next_question);
      }
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  };

  const finalize = async () => {
    if (!analysis || isFinalizing) return;
    setIsFinalizing(true);
    setError(null);
    // Reconstruct raw text from answers for the graph
    const content = answers.map(a => `${a.question}\n${a.answer}`).join("\n\n");
    try {
      await fetchFromMetaphor("/context/lore", { content });
      localStorage.setItem("metaphor_onboarded", "true");
      router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
      setIsFinalizing(false);
    }
  };

  // ── PHASE: INTRO ────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center font-sans px-8 animate-in fade-in duration-700">
        <div className="w-full max-w-xl flex flex-col items-center text-center">

          <div className="w-3 h-3 rounded-full bg-foreground mb-12 shadow-[0_0_16px_rgba(0,0,0,0.2)]" />

          <h1 className="text-4xl font-light tracking-tight text-foreground mb-6 leading-[1.2]">
            Your AI tools are about to<br />share the same understanding of you.
          </h1>
          <p className="text-muted text-base leading-relaxed mb-16 max-w-sm">
            This takes 2–3 minutes. When you're done, every AI you connect will know your work, your projects, and your goals.
          </p>

          {/* Connected AIs */}
          <div className="flex items-center gap-6 mb-16">
            {[
              { name: "ChatGPT", icon: <ChatGPTIcon /> },
              { name: "Claude", icon: <ClaudeIcon /> },
              { name: "Cursor", icon: <CursorIcon /> }
            ].map((ai) => (
              <div key={ai.name} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-border-subtle flex items-center justify-center">
                  {ai.icon}
                </div>
                <span className="text-xs font-medium text-muted">{ai.name}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase("interview")}
            className="px-8 py-4 bg-foreground text-background rounded-xl text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            Begin <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── PHASE: COMPLETE ─────────────────────────────────────────────────────────
  if (phase === "complete" && analysis) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center font-sans px-8 animate-in fade-in duration-700">
        <div className="w-full max-w-xl flex flex-col">

          <div className="mb-12">
            <p className="text-xs font-mono uppercase tracking-widest text-muted mb-4">Complete</p>
            <h1 className="text-3xl font-light tracking-tight text-foreground mb-4">Your AI now understands you.</h1>
            <p className="text-muted text-sm">Every AI you connect will begin from this shared context.</p>
          </div>

          {/* Summary */}
          <div className="space-y-4 mb-12 border-t border-border-subtle pt-8">
            {analysis.organization && (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                <span className="text-sm text-foreground">Organization: <span className="font-medium">{analysis.organization}</span></span>
              </div>
            )}
            {analysis.projects.length > 0 && (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                <span className="text-sm text-foreground">Projects: <span className="font-medium">{analysis.projects.join(", ")}</span></span>
              </div>
            )}
            {analysis.goals.length > 0 && (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                <span className="text-sm text-foreground">Goals: <span className="font-medium">{analysis.goals.join(", ")}</span></span>
              </div>
            )}
            {analysis.preferences.length > 0 && (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                <span className="text-sm text-foreground">Preferences noted</span>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          <button
            onClick={finalize}
            disabled={isFinalizing}
            className="w-full px-8 py-4 bg-foreground text-background rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isFinalizing ? "Building your knowledge graph..." : "Connect Claude →"}
          </button>
        </div>
      </div>
    );
  }

  // ── PHASE: INTERVIEW ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-background flex font-sans">

      {/* ── Left: Interview ── */}
      <div className="flex-1 flex flex-col justify-center px-16 max-w-2xl">

        {/* Past answers */}
        {answers.length > 0 && (
          <div className="mb-12 space-y-6">
            {answers.map((a, i) => (
              <div key={i} className="opacity-40">
                <p className="text-xs text-muted mb-1">{a.question}</p>
                <p className="text-base text-foreground font-light">{a.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reflection from previous answer */}
        {analysis?.reflection && !isProcessing && (
          <div className="mb-8 flex items-start gap-3 animate-in fade-in duration-500">
            <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-background" />
            </div>
            <p className="text-sm text-muted italic">{analysis.reflection}</p>
          </div>
        )}

        {/* Current question */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-2xl font-light tracking-tight text-foreground mb-6">{currentQuestion}</p>

          <div className="flex items-center gap-4 border-b border-border-strong pb-3">
            <input
              ref={inputRef}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitAnswer(); }}
              placeholder="Type your answer..."
              disabled={isProcessing}
              className="flex-1 bg-transparent text-foreground text-lg font-light placeholder:text-muted/40 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={submitAnswer}
              disabled={!currentAnswer.trim() || isProcessing}
              className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-30 shrink-0"
            >
              {isProcessing ? (
                <div className="w-3 h-3 border border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                <ChevronRight className="w-4 h-4 text-background" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted mt-3">Press Enter to continue</p>
        </div>
      </div>

      {/* ── Right: Live Model ── */}
      <div className="w-72 border-l border-border-subtle flex flex-col justify-center px-10 shrink-0">

        <div className="mb-8">
          <p className="text-xs font-mono uppercase tracking-widest text-muted mb-2">Your Context</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-light text-foreground">{analysis?.overall_confidence ?? 0}</span>
            <span className="text-muted text-sm mb-1.5">% understood</span>
          </div>
        </div>

        {/* Category bars */}
        <div className="space-y-5">
          {(["mission", "projects", "goals", "preferences", "constraints"] as const).map((cat) => (
            <ConfidenceBar
              key={cat}
              label={cat}
              value={analysis?.categories?.[cat] ?? 0}
            />
          ))}
        </div>

        {/* Entity chips */}
        {analysis && (
          <div className="mt-10 space-y-3 border-t border-border-subtle pt-8">
            {analysis.organization && (
              <div className="text-xs text-muted">
                <span className="font-medium text-foreground block mb-0.5">Organization</span>
                {analysis.organization}
              </div>
            )}
            {analysis.projects.length > 0 && (
              <div className="text-xs text-muted">
                <span className="font-medium text-foreground block mb-0.5">Projects</span>
                {analysis.projects.join(", ")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
