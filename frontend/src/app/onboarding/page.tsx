"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Bot, Building, FolderGit2, Target, Settings2, AlertCircle, CheckCircle2 } from "lucide-react";
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
    <div className="min-h-screen w-full bg-background flex flex-col items-center font-sans py-24 px-8 overflow-y-auto">
      
      <div className="w-full max-w-3xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="mb-12 border-b border-border-subtle pb-8">
          <h1 className="text-3xl font-light tracking-tight text-foreground mb-4">Build Your Shared Context</h1>
          <p className="text-muted text-sm leading-relaxed">
            Every AI you connect will use this to understand your work, projects, and goals.
          </p>
        </div>

        {/* Input Area */}
        <div className="mb-12">
          <label className="block text-sm font-semibold tracking-tight text-foreground mb-6">
            What are you currently building?
          </label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="I am working on..."
            className="w-full min-h-[160px] bg-transparent border-none p-0 text-foreground focus:outline-none focus:ring-0 text-xl font-light leading-relaxed placeholder:text-muted/40 resize-y"
            autoFocus
          />
        </div>

        {/* Live Understanding Divider */}
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px bg-border-subtle flex-1" />
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted">
            {isAnalyzing ? (
              <><Bot className="w-4 h-4 animate-pulse text-primary" /> Thinking...</>
            ) : (
              "Live Understanding"
            )}
          </div>
          <div className="h-px bg-border-subtle flex-1" />
        </div>

        {/* Live Understanding Rendering */}
        <div className="min-h-[200px] mb-12 transition-all duration-500">
          {!analysis && !isAnalyzing ? (
             <div className="text-center text-muted opacity-40 py-12 text-sm italic">
                Start typing above...
             </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              {/* Organization */}
              {analysis?.organization && (
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex items-center gap-2 w-48 shrink-0 pt-1 text-muted">
                    <Building className="w-4 h-4" />
                    <span className="text-sm font-medium">Organization</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span className="text-base text-foreground font-medium">{analysis.organization}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Projects */}
              {analysis?.projects && analysis.projects.length > 0 && (
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
              {analysis?.goals && analysis.goals.length > 0 && (
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
              {analysis?.preferences && analysis.preferences.length > 0 && (
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

              {/* Missing Info */}
              {analysis?.missing_information && analysis.missing_information.length > 0 && (
                <div className="flex flex-col md:flex-row md:items-start gap-4 pt-6 mt-6 border-t border-border-subtle">
                  <div className="flex items-center gap-2 w-48 shrink-0 pt-1 text-muted">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Missing Info</span>
                  </div>
                  <div className="flex-1 space-y-3">
                    {analysis.missing_information.map((info, i) => (
                      <div key={i} className="text-sm text-muted">
                        • {info}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Finalize Button */}
        <div className="flex justify-end pt-8 border-t border-border-subtle">
           <button 
              onClick={finalize}
              disabled={isFinalizing || !content.trim()}
              className="px-8 py-3 bg-foreground text-background rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
            >
              {isFinalizing ? "Constructing Graph..." : "Finalize Context"} <ArrowRight className="w-4 h-4" />
            </button>
        </div>

      </div>
    </div>
  );
}
