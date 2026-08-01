"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Bot, Building, FolderGit2, Target, Settings2, AlertCircle, Share2, CheckCircle2 } from "lucide-react";
import { fetchFromMetaphor } from "../api";

export default function OnboardingPage() {
  const router = useRouter();
  
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    organization: string;
    projects: string[];
    goals: string[];
    preferences: string[];
    missing_information: string[];
  } | null>(null);

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
    try {
      await fetchFromMetaphor("/context/lore", { content });
      localStorage.setItem("metaphor_onboarded", "true");
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      setIsFinalizing(false);
    }
  };

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden font-sans">
      
      {/* ── Left Side: Input ── */}
      <div className="w-1/2 h-full flex flex-col border-r border-border-subtle bg-background z-10 shadow-[20px_0_40px_rgba(0,0,0,0.05)]">
        
        {/* Header */}
        <div className="px-12 py-12 border-b border-border-subtle">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-foreground shadow-[0_0_8px_rgba(var(--foreground-rgb),0.5)]" />
            <span className="text-sm font-semibold tracking-tight text-foreground">Context Setup</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-foreground mb-4">Build Your Shared Context</h1>
          <p className="text-muted text-sm leading-relaxed max-w-md">
            Every AI you connect will use this to understand your work, projects, and goals.
          </p>
        </div>

        {/* Input Area */}
        <div className="flex-1 p-12 flex flex-col">
          <label className="text-sm font-semibold tracking-tight text-foreground mb-4">What are you currently building?</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="I am building..."
            className="w-full flex-1 bg-surface-1 border border-border-subtle rounded-xl p-6 text-foreground focus:outline-none focus:border-primary transition-colors shadow-inner resize-none text-base leading-relaxed"
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border-subtle bg-background flex justify-end">
           <button 
              onClick={finalize}
              disabled={isFinalizing || !content.trim()}
              className="px-8 py-4 bg-foreground text-background rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isFinalizing ? "Building Graph..." : "Finalize Context"} <ArrowRight className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* ── Right Side: Live Understanding ── */}
      <div className="w-1/2 h-full bg-surface-1 relative overflow-y-auto p-12">
        
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-sm font-mono uppercase tracking-widest text-muted">Live Understanding</h2>
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-xs text-muted animate-pulse">
              <Bot className="w-3 h-3" /> Thinking...
            </div>
          )}
        </div>

        {!analysis && !isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted opacity-50">
            <Share2 className="w-12 h-12 mb-4" />
            <p className="text-sm font-mono uppercase tracking-widest">Awaiting Input...</p>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-500">
            
            {/* Organization */}
            {analysis?.organization && (
              <div>
                <div className="flex items-center gap-2 mb-4 text-foreground">
                  <Building className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-semibold">Organization</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-background border border-border-subtle rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">{analysis.organization}</span>
                </div>
              </div>
            )}

            {/* Projects */}
            {analysis?.projects && analysis.projects.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4 text-foreground">
                  <FolderGit2 className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-semibold">Projects</span>
                </div>
                <div className="space-y-2">
                  {analysis.projects.map((proj, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-3 bg-background border border-border-subtle rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{proj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Goals */}
            {analysis?.goals && analysis.goals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4 text-foreground">
                  <Target className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-semibold">Goals</span>
                </div>
                <div className="space-y-2">
                  {analysis.goals.map((goal, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-3 bg-background border border-border-subtle rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{goal}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences */}
            {analysis?.preferences && analysis.preferences.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4 text-foreground">
                  <Settings2 className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-semibold">Preferences</span>
                </div>
                <div className="space-y-2">
                  {analysis.preferences.map((pref, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-3 bg-background border border-border-subtle rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{pref}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Info */}
            {analysis?.missing_information && analysis.missing_information.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4 text-foreground">
                  <AlertCircle className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-semibold">Missing Information</span>
                </div>
                <div className="space-y-2">
                  {analysis.missing_information.map((info, i) => (
                    <div key={i} className="px-4 py-3 bg-surface-2 border border-border-subtle rounded-lg">
                      <span className="text-sm text-muted">{info}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
