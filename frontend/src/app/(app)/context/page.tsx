"use client";

import React, { useState } from "react";
import { Search, ArrowRightLeft, Shield, GitCommit, Target, Database, Maximize2, ChevronRight, FileText } from "lucide-react";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";

type Insight = {
  id: string;
  text: string;
  type: "fact" | "decision" | "constraint";
  sourceType: string;
  sourceName: string;
  reason: string;
};

export default function ContextEnvironment() {
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState<"empty" | "retrieving" | "complete">("empty");
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const mockInsights: Insight[] = [
    {
      id: "i1",
      text: "Orion is currently the primary product focus.",
      type: "fact",
      sourceType: "Project",
      sourceName: "Orion",
      reason: "High priority status across 4 active workspaces",
    },
    {
      id: "i2",
      text: "Notification architecture is shifting from RabbitMQ to NATS JetStream.",
      type: "decision",
      sourceType: "Decision Record",
      sourceName: "ADR-42",
      reason: "Approved by Engineering Lead to resolve INC-104",
    },
    {
      id: "i3",
      text: "Deployment must occur before Q4 freeze.",
      type: "constraint",
      sourceType: "Task",
      sourceName: "Q4 Roadmap",
      reason: "Hard deadline set in company timeline",
    }
  ];

  const handleAsk = () => {
    if (!prompt.trim()) return;
    setPhase("retrieving");
    
    setTimeout(() => {
      setPhase("complete");
    }, 1500);
  };

  return (
    <div className="flex w-full h-full bg-transparent overflow-hidden relative animate-in fade-in duration-500">
      
      <div className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar z-10 pt-16">
        
        {phase === "empty" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-3xl mx-auto w-full mb-32">
            <h1 className="text-4xl font-display text-foreground mb-8 tracking-tight">Explore your context...</h1>
            
            <div className="w-full bg-surface-1/80 backdrop-blur-md border border-border-strong rounded-2xl shadow-lg p-2 flex items-center gap-2 transition-all focus-within:border-primary">
              <Search className="w-5 h-5 text-muted ml-3" />
              <input
                type="text"
                autoFocus
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                placeholder="e.g., What should I know about Orion right now?"
                className="flex-1 bg-transparent border-none text-base text-foreground px-2 py-3 focus:outline-none placeholder:text-muted/60 font-sans"
              />
              <button
                onClick={handleAsk}
                disabled={!prompt.trim()}
                className="p-3 bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              {["What changed in Orion?", "decisions about authentication", "why did we choose NATS?"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  className="px-4 py-2 rounded-full border border-border-subtle bg-surface-1/50 backdrop-blur-sm text-sm text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer shadow-sm"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "retrieving" && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-mono uppercase tracking-widest text-muted animate-pulse">Resolving Context...</p>
          </div>
        )}

        {phase === "complete" && (
          <div className="p-8 md:p-12 max-w-5xl mx-auto w-full space-y-12 animate-in slide-in-from-bottom-4 fade-in duration-700 pb-32">
            
            {/* The Query */}
            <div className="flex flex-col mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-muted mb-2">Query</span>
              <h1 className="text-3xl font-display text-foreground border-l-2 border-primary pl-4 py-1">
                {prompt}
              </h1>
            </div>

            {/* Structured Context Package */}
            <div className="bg-surface-1/60 backdrop-blur-md border border-border-subtle rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border-subtle bg-surface-2/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MetaphorLogo size={18} className="text-primary" />
                  <span className="font-semibold text-foreground text-sm">Context Package</span>
                </div>
                <button className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 bg-foreground text-background rounded-lg hover:opacity-90 flex items-center gap-2 cursor-pointer shadow-md">
                  <Maximize2 className="w-3 h-3" />
                  Send to Client
                </button>
              </div>

              <div className="p-6 md:p-10 space-y-10">
                
                {/* Synthesis */}
                <section>
                  <h2 className="text-xs font-mono uppercase tracking-widest text-muted mb-4 border-b border-border-subtle pb-2">Synthesis</h2>
                  <div className="prose document-body max-w-none text-foreground leading-relaxed">
                    Based on recent activity across the workspace, the Notification architecture for Orion is the primary focus. A major architectural shift from RabbitMQ to NATS JetStream was approved to resolve persistent delivery issues. This must be completed prior to the upcoming Q4 freeze.
                  </div>
                </section>

                {/* Derived Insights & Provenance */}
                <section>
                  <h2 className="text-xs font-mono uppercase tracking-widest text-muted mb-4 border-b border-border-subtle pb-2">Derived Context</h2>
                  
                  <div className="space-y-4">
                    {mockInsights.map((insight) => (
                      <div key={insight.id} className="pds-card p-4 transition-all hover:border-border-mid">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {insight.type === "fact" && <Database className="w-4 h-4 text-info" />}
                            {insight.type === "decision" && <Shield className="w-4 h-4 text-primary" />}
                            {insight.type === "constraint" && <Target className="w-4 h-4 text-warning" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold bg-surface-2 px-1.5 py-0.5 rounded">
                                {insight.type}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-foreground mb-3">{insight.text}</p>
                            
                            <button 
                              onClick={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
                              className="text-[11px] font-mono text-muted hover:text-foreground flex items-center gap-1 bg-surface-2/50 px-2 py-1 rounded-md transition-colors"
                            >
                              [Why?]
                            </button>

                            {/* Provenance Expansion */}
                            {expandedInsight === insight.id && (
                              <div className="mt-4 p-4 rounded-xl bg-surface-2/60 border border-border-subtle animate-in slide-in-from-top-2 fade-in duration-200">
                                <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">Supported By</h4>
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-xs text-muted block mb-0.5">{insight.sourceType}</span>
                                    <span className="text-sm font-medium flex items-center gap-2">
                                      <FileText className="w-3.5 h-3.5" />
                                      {insight.sourceName}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-xs text-muted block mb-0.5">Reasoning</span>
                                    <span className="text-sm italic border-l-2 border-border-strong pl-2 block text-foreground/80">
                                      "{insight.reason}"
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Raw Evidence Links */}
                <section>
                  <h2 className="text-xs font-mono uppercase tracking-widest text-muted mb-4 border-b border-border-subtle pb-2">Related Evidence</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {["GitHub: PR #1042", "Notion: Arch Decision Record 42", "Slack: #eng-core", "Jira: INC-104"].map((doc) => (
                      <div key={doc} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle hover:bg-surface-2/50 transition-colors cursor-pointer group">
                        <span className="text-sm text-foreground group-hover:text-primary transition-colors">{doc}</span>
                        <ChevronRight className="w-4 h-4 text-muted group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    ))}
                  </div>
                </section>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
