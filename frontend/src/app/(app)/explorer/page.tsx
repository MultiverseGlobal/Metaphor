"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Send, Network, ShieldCheck, Database, Target, Search, Clock, FileText, CheckCircle2, AlertTriangle, ArrowRightLeft, Maximize2 } from "lucide-react";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";
import { fetchFromMetaphor } from "@/app/api";

type EvidenceItem = {
  id: string;
  source: string;
  span: string;
  entities: string[];
  validTime: string;
  confidence: number;
  reason: string;
  status: "grounded" | "stale" | "conflict";
};

type ContextPack = {
  partition: string;
  includedCount: number;
  excludedCount: number;
  tokenEstimate: string;
  freshness: string;
  status: "healthy" | "warning";
};

export default function ExplorerPage() {
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState<"empty" | "planning" | "retrieving" | "complete">("empty");
  
  const [answer, setAnswer] = useState("");
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [contextPack, setContextPack] = useState<ContextPack | null>(null);

  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  const handleAsk = () => {
    if (!prompt.trim()) return;
    
    setPhase("planning");
    
    // Simulate Retrieval Plan
    setTimeout(() => {
      setPhase("retrieving");
      
      // Simulate Evidence Gathering & Context Pack Assembly
      setTimeout(() => {
        setPhase("complete");
        setAnswer("Based on the engineering graph, the Layer 0 Event Bus was merged yesterday. It replaces the old RabbitMQ cluster with NATS JetStream for durable at-least-once delivery, resolving the intermittent timeout issues reported in INC-104.");
        
        setEvidence([
          {
            id: "ev-1",
            source: "GitHub: PR #1042",
            span: "Merge pull request #1042 from core/nats-jetstream... Replaces RabbitMQ with NATS JetStream.",
            entities: ["Layer 0 Event Bus", "RabbitMQ", "NATS JetStream"],
            validTime: "2026-09-17T14:30:00Z",
            confidence: 0.98,
            reason: "Lexical match & Entity relationship (Event Bus)",
            status: "grounded"
          },
          {
            id: "ev-2",
            source: "Notion: Arch Decision Record 42",
            span: "We will migrate to NATS JetStream to guarantee at-least-once delivery and solve INC-104.",
            entities: ["INC-104", "NATS JetStream"],
            validTime: "2026-09-10T09:00:00Z",
            confidence: 0.95,
            reason: "Semantic similarity & Temporal relevance",
            status: "grounded"
          },
          {
            id: "ev-3",
            source: "Slack: #eng-core",
            span: "RabbitMQ is still active in staging.",
            entities: ["RabbitMQ", "Staging"],
            validTime: "2026-09-18T08:15:00Z",
            confidence: 0.72,
            reason: "Entity correlation (RabbitMQ)",
            status: "conflict"
          }
        ]);

        setContextPack({
          partition: "Engineering",
          includedCount: 3,
          excludedCount: 12,
          tokenEstimate: "~450 tokens",
          freshness: "1 hour ago",
          status: "warning" // Due to the conflict
        });

      }, 1500);
    }, 800);
  };

  return (
    <div className="flex w-full h-full bg-background overflow-hidden relative">
      
      {/* ── Spatial Background (Higgsfield Gen) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/spatial_background.jpg" 
          alt="Spatial Background" 
          className="w-full h-full object-cover opacity-[0.10] mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/90 to-background" />
      </div>

      {/* ── Main Column: Answer & Context Pack ── */}
      <div className="flex-1 flex flex-col relative border-r border-border-subtle overflow-y-auto custom-scrollbar pb-32 z-10">
        
        {/* Header */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-border-subtle bg-surface-1/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold tracking-tight">Explorer</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-surface-2 border border-border-subtle text-[10px] font-mono text-muted uppercase tracking-wider">Partition: Engineering</span>
          </div>
        </header>

        {phase === "empty" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 mb-6 rounded-2xl bg-surface-1 border border-border-subtle flex items-center justify-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
              <MetaphorLogo size={28} className="text-foreground relative z-10" />
            </div>
            <h2 className="text-2xl font-display text-foreground mb-2">What do you need to remember?</h2>
            <p className="text-sm text-muted max-w-md text-center mb-10 leading-relaxed">
              Metaphor will traverse your knowledge graph, fetch verified evidence, and assemble a grounded context pack.
            </p>

            <div className="w-full max-w-2xl bg-surface-1 border border-border-strong rounded-2xl shadow-card p-2 flex items-center gap-2 transition-all focus-within:border-primary focus-within:shadow-glow">
              <input
                type="text"
                autoFocus
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                placeholder="e.g., Why did we choose NATS over RabbitMQ?"
                className="flex-1 bg-transparent border-none text-sm text-foreground px-4 py-3 focus:outline-none placeholder:text-muted"
              />
              <button
                onClick={handleAsk}
                disabled={!prompt.trim()}
                className="p-3 bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-2xl">
              {["Summarize the latest architecture decisions", "Who owns the billing microservice?", "Find notes on the Q3 Roadmap"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  className="px-4 py-2 rounded-full border border-border-subtle bg-surface-1 text-xs text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase !== "empty" && (
          <div className="p-8 max-w-4xl mx-auto w-full space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
            
            {/* The Query */}
            <div className="text-xl font-display text-foreground border-l-2 border-primary pl-4 py-1">
              {prompt}
            </div>

            {/* Retrieval Plan Stage */}
            {(phase === "planning" || phase === "retrieving") && (
              <div className="p-6 rounded-2xl bg-surface-1 border border-border-subtle shadow-sm space-y-4">
                <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
                  <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
                  {phase === "planning" ? "Formulating Retrieval Plan..." : "Traversing Knowledge Graph..."}
                </div>
                
                {phase === "retrieving" && (
                  <div className="pl-7 space-y-2 text-xs font-mono text-muted animate-in fade-in duration-300">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-success" /> Temporal scope: Last 30 days</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-success" /> Vector expansion: NATS, RabbitMQ, Message Broker</div>
                    <div className="flex items-center gap-2 text-primary/80"><Network className="w-3 h-3" /> Extracting 1-hop relationships from 14 source nodes...</div>
                  </div>
                )}
              </div>
            )}

            {/* Complete Stage */}
            {phase === "complete" && (
              <>
                {/* The Grounded Answer */}
                <div className="prose document-body">
                  <p>{answer}</p>
                </div>

                {/* Context Pack Assembly UI */}
                <div className="mt-12">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-muted mb-4">Generated Context Pack</h3>
                  <div className="rounded-2xl border border-border-subtle bg-surface-1 shadow-card overflow-hidden">
                    <div className="p-5 border-b border-border-subtle flex flex-wrap gap-4 items-center justify-between bg-surface-2/30">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted uppercase font-mono tracking-wider mb-1">Partition</span>
                          <span className="text-xs font-semibold">{contextPack?.partition}</span>
                        </div>
                        <div className="w-px h-6 bg-border-subtle" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted uppercase font-mono tracking-wider mb-1">Evidence</span>
                          <span className="text-xs font-semibold">{contextPack?.includedCount} included ({contextPack?.excludedCount} filtered)</span>
                        </div>
                        <div className="w-px h-6 bg-border-subtle" />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted uppercase font-mono tracking-wider mb-1">Budget Estimate</span>
                          <span className="text-xs font-semibold text-primary">{contextPack?.tokenEstimate}</span>
                        </div>
                      </div>
                      
                      <button className="px-4 py-2 bg-foreground text-background text-xs font-semibold rounded-lg hover:opacity-90 flex items-center gap-2 cursor-pointer shadow-md">
                        <Maximize2 className="w-3.5 h-3.5" />
                        Send to MCP Client
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        )}
      </div>

      {/* ── Right Rail: Evidence & Provenance ── */}
      {phase === "complete" && (
        <div className="w-96 bg-surface-1/50 border-l border-border-subtle flex flex-col animate-in slide-in-from-right duration-500">
          <div className="h-16 px-6 border-b border-border-subtle flex items-center justify-between sticky top-0 bg-surface-1/80 backdrop-blur-md z-10">
            <h3 className="text-xs font-mono uppercase tracking-widest text-muted flex items-center gap-2">
              <Database className="w-4 h-4" /> Provenance Rail
            </h3>
            <span className="pds-status-badge active">Grounded</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {evidence.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedEvidence(item.id === selectedEvidence?.id ? null : item)}
                className={`interactive-card p-4 rounded-xl border cursor-pointer transition-colors ${
                  selectedEvidence?.id === item.id 
                    ? "bg-surface-2 border-primary shadow-md" 
                    : "bg-background border-border-subtle hover:border-border-mid"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-muted" />
                    <span className="text-xs font-semibold truncate max-w-[180px]">{item.source}</span>
                  </div>
                  {item.status === "grounded" && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                  {item.status === "conflict" && <AlertTriangle className="w-3.5 h-3.5 text-danger" />}
                </div>

                <p className="text-[11px] text-muted leading-relaxed line-clamp-3 mb-3 border-l-2 border-border-strong pl-2 italic">
                  "{item.span}"
                </p>

                {selectedEvidence?.id === item.id && (
                  <div className="mt-4 pt-3 border-t border-border-subtle space-y-3 animate-in slide-in-from-top-1 fade-in duration-200">
                    <div>
                      <span className="pds-label">Why is this here?</span>
                      <p className="text-[11px] text-foreground">{item.reason}</p>
                    </div>
                    <div>
                      <span className="pds-label">Extracted Entities</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.entities.map(e => (
                          <span key={e} className="px-1.5 py-0.5 rounded bg-surface-3 text-[9px] font-mono border border-border-subtle">{e}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-[10px] text-muted">
                        <Clock className="w-3 h-3" /> Valid: {new Date(item.validTime).toLocaleDateString()}
                      </div>
                      <span className="text-[10px] font-mono text-primary font-semibold">{(item.confidence * 100).toFixed(0)}% Conf</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
