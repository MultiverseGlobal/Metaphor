"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Bot, Building, FolderGit2, Target, Settings2, CheckCircle2 } from "lucide-react";
import { fetchFromMetaphor } from "../api";

export default function OnboardingPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    organization: string;
    projects: string[];
    goals: string[];
    preferences: string[];
    confidence: number;
    next_question: string;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  // Debounce the analysis
  useEffect(() => {
    if (!content.trim()) {
      setAnalysis(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const res = await fetchFromMetaphor("/context/analyze-draft", { content });
        setAnalysis(res);
      } catch (e) {
        console.error("Live understanding failed", e);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [content]);

  const [isFinalizing, setIsFinalizing] = useState(false);
  
  const finalize = async () => {
    if (!content.trim()) return;
    setIsFinalizing(true);
    setError(null);
    try {
      await fetchFromMetaphor("/context/lore", { content });
      localStorage.setItem("metaphor_onboarded", "true");
      router.push("/dashboard");
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Something went wrong. Please try again.");
      setIsFinalizing(false);
    }
  };

  const getFinalizeText = () => {
    if (isFinalizing) return "Building shared context...";
    if (!analysis) return "Finalize Context";
    if (analysis.confidence < 50) return "Construct Initial Graph";
    if (analysis.confidence < 80) return "Finalize Context";
    return "Finalize Comprehensive Context";
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center font-sans py-24 px-8 overflow-y-auto">
      
      <div className="w-full max-w-3xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="mb-12 border-b border-border-subtle pb-8">
          <h1 className="text-3xl font-light tracking-tight text-foreground mb-4">Build Your Shared Context</h1>
          <p className="text-muted text-sm leading-relaxed">
            Every AI you connect will begin with the same understanding of your work.
          </p>
        </div>

        {/* Canvas / Input Area */}
        <div className="mb-4">
          <textarea 
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            placeholder="What are you currently building?"
            className="w-full min-h-[160px] bg-transparent border-none p-0 text-foreground focus:outline-none focus:ring-0 text-xl font-light leading-relaxed placeholder:text-muted/40 resize-none overflow-hidden"
            autoFocus
          />
        </div>

        {/* Intelligence Block */}
        {content.trim() && (
          <div className="mt-8 border-t border-border-subtle pt-12 transition-all duration-500 min-h-[300px]">
            <div className="flex items-center gap-3 mb-8">
              <Bot className={`w-4 h-4 ${isAnalyzing ? 'animate-pulse text-primary' : 'text-muted'}`} />
              <span className="text-sm font-mono uppercase tracking-widest text-muted">
                {isAnalyzing ? "Understanding..." : "Live Context"}
              </span>
              
              {analysis && !isAnalyzing && (
                <div className="ml-auto flex items-center gap-2">
                   <div className="h-2 w-24 bg-surface-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000 ease-out" 
                        style={{ width: `${analysis.confidence}%` }}
                      />
                   </div>
                   <span className="text-sm font-mono text-primary font-medium">
                     {analysis.confidence}% Confidence
                   </span>
                </div>
              )}
            </div>

            {/* Extracted Entities */}
            {analysis && !isAnalyzing && (
              <div className="space-y-6 animate-in fade-in duration-500 mb-12">
                
                {/* Organization */}
                {analysis.organization && (
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex items-center gap-2 w-48 shrink-0 pt-1 text-muted">
                      <Building className="w-4 h-4" />
                      <span className="text-sm font-medium">Organization</span>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span className="text-base text-foreground font-medium">{analysis.organization}</span>
                    </div>
                  </div>
                )}

                {/* Projects */}
                {analysis.projects && analysis.projects.length > 0 && (
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex items-center gap-2 w-48 shrink-0 pt-1 text-muted">
                      <FolderGit2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Projects</span>
                    </div>
                    <div className="flex-1 space-y-4">
                      {analysis.projects.map((proj, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span className="text-base text-foreground font-medium">{proj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Goals */}
                {analysis.goals && analysis.goals.length > 0 && (
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex items-center gap-2 w-48 shrink-0 pt-1 text-muted">
                      <Target className="w-4 h-4" />
                      <span className="text-sm font-medium">Goals</span>
                    </div>
                    <div className="flex-1 space-y-4">
                      {analysis.goals.map((goal, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span className="text-base text-foreground font-medium">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preferences */}
                {analysis.preferences && analysis.preferences.length > 0 && (
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex items-center gap-2 w-48 shrink-0 pt-1 text-muted">
                      <Settings2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Preferences</span>
                    </div>
                    <div className="flex-1 space-y-4">
                      {analysis.preferences.map((pref, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span className="text-base text-foreground font-medium">{pref}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Empty State if Nothing Detected Yet */}
                {!analysis.organization && analysis.projects.length === 0 && analysis.goals.length === 0 && analysis.preferences.length === 0 && (
                   <div className="text-muted text-sm italic py-4">
                     Analyzing text for entities...
                   </div>
                )}
              </div>
            )}

            {/* Next Question Nudge */}
            {analysis?.next_question && !isAnalyzing && (
              <div className="p-6 bg-surface-2 rounded-xl border border-border-subtle border-l-4 border-l-primary animate-in fade-in slide-in-from-left-4 mt-8">
                <span className="text-xs font-bold uppercase tracking-wider text-muted mb-2 block">Follow-up Generated</span>
                <p className="text-foreground text-lg leading-relaxed">{analysis.next_question}</p>
                <p className="text-xs text-muted mt-4">↳ Press Enter above and keep writing.</p>
              </div>
            )}
          </div>
        )}

        {/* Finalize Button */}
        <div className="flex flex-col items-end gap-3 pt-8 mt-12 border-t border-border-subtle">
           {error && (
             <p className="text-sm text-red-500 text-right">{error}</p>
           )}
           <button 
              onClick={finalize}
              disabled={isFinalizing || !content.trim()}
              className="px-8 py-3 bg-foreground text-background rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
            >
              {getFinalizeText()} <ArrowRight className="w-4 h-4" />
            </button>
        </div>

      </div>
    </div>
  );
}
