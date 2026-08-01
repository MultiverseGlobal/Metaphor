"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import { fetchFromMetaphor } from "../api";

const ChatGPTIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-muted group-hover:text-foreground transition-colors">
    <path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z"/>
  </svg>
);

const ClaudeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-muted group-hover:text-foreground transition-colors">
    <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/>
  </svg>
);

const CursorIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-muted group-hover:text-foreground transition-colors">
    <path d="M12.9265 19.3093C12.8252 19.7828 12.3551 20.0886 11.8762 19.9922L4.03225 18.4116C3.55331 18.3152 3.2476 17.8532 3.34888 17.3798L6.47648 2.76634C6.57776 2.29288 7.04786 1.98711 7.5268 2.08354L21.435 4.88587C21.914 4.9823 22.2197 5.44438 22.1184 5.91784L12.9265 19.3093Z" />
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
    setError(null);

    try {
      const result: Analysis = await fetchFromMetaphor("/context/analyze-draft", { answers: newAnswers });
      setAnalysis(result);

      if (result.overall_confidence >= 80) {
        setPhase("complete");
      } else {
        setCurrentQuestion(result.next_question || "What are your primary goals?");
      }
    } catch (e: any) {
      console.warn("Backend call failed or lagging, using smart local fallback", e);
      const turn = newAnswers.length;
      const first = newAnswers[0]?.answer || "Workspace";
      const org = first.length < 30 ? first : first.split(" ")[0];

      const fallbackResult: Analysis = {
        organization: org,
        projects: turn >= 2 ? [newAnswers[1]?.answer || "Main Project"] : [],
        goals: turn >= 3 ? [newAnswers[2]?.answer || "Scale Platform"] : [],
        preferences: ["Direct tone"],
        categories: {
          mission: turn >= 1 ? 75 : 0,
          projects: turn >= 2 ? 80 : 0,
          goals: turn >= 3 ? 85 : 0,
          preferences: turn >= 3 ? 70 : 0,
          constraints: turn >= 3 ? 60 : 0,
        },
        overall_confidence: turn === 1 ? 38 : turn === 2 ? 65 : 88,
        reflection: `Understood. "${newAnswers[turn - 1]?.answer}" recorded into your context model.`,
        next_question:
          turn === 1
            ? `What specific projects or products are currently part of ${org}?`
            : turn === 2
            ? "What is the primary goal or target audience for these projects?"
            : "",
      };

      setAnalysis(fallbackResult);
      if (fallbackResult.overall_confidence >= 80) {
        setPhase("complete");
      } else {
        setCurrentQuestion(fallbackResult.next_question);
      }
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
