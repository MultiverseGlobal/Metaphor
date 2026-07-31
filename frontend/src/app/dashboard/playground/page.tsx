"use client";

import React, { useState } from "react";
import { Sparkles, Send, Bot, User, ShieldCheck, FileText, Target, Network, CheckCircle2, ChevronRight, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";

type ChatState = "initial" | "generic_response" | "inspecting_context" | "tailored_response";

export default function PlaygroundPage() {
  const [chatState, setChatState] = useState<ChatState>("initial");
  const [prompt, setPrompt] = useState("");

  const handleSend = () => {
    if (!prompt) return;
    setChatState("generic_response");
  };

  const handleInject = () => {
    setChatState("inspecting_context");
  };

  const handleApprove = () => {
    setChatState("tailored_response");
  };

  return (
    <div className="flex w-full h-full bg-background animate-in fade-in duration-500 overflow-hidden">
      
      {/* ── Left: Chat Interface (The "Claude" Simulation) ── */}
      <div className="flex-1 flex flex-col relative bg-surface-1/30">
        
        {/* Chat Header */}
        <header className="h-14 px-6 flex items-center justify-between border-b border-border-subtle bg-surface-1/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-foreground" />
            <span className="text-sm font-semibold text-foreground tracking-tight">Claude 3.5 Sonnet</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-2 text-[10px] font-medium text-muted ml-2">Simulated</span>
          </div>
          {chatState === "generic_response" && (
            <button 
              onClick={handleInject}
              className="px-4 py-1.5 bg-primary text-white rounded-full text-xs font-semibold shadow-md hover:scale-105 transition-all flex items-center gap-2 animate-in fade-in zoom-in"
            >
              <Sparkles className="w-3.5 h-3.5" /> Inject Metaphor Context
            </button>
          )}
        </header>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-32">
          
          {/* User Prompt */}
          {(chatState !== "initial") && (
            <div className="flex justify-end animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="max-w-[70%] bg-surface-2 border border-border-subtle rounded-2xl rounded-tr-sm p-4 text-sm text-foreground shadow-sm">
                Design pricing for Atlas.
              </div>
            </div>
          )}

          {/* Generic Response */}
          {(chatState === "generic_response" || chatState === "inspecting_context") && (
            <div className="flex gap-4 max-w-[85%] animate-in slide-in-from-bottom-2 fade-in duration-500">
              <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0 border border-border-subtle">
                <Bot className="w-4 h-4 text-foreground" />
              </div>
              <div className="space-y-4 text-sm text-foreground leading-relaxed pt-1">
                <p>Designing a pricing model for Atlas depends heavily on your target audience and the core value metric of your software.</p>
                <p>Here are three common approaches you could take:</p>
                <ul className="list-disc pl-5 space-y-2 text-muted">
                  <li><strong>Credit-based pricing:</strong> Charge users per action or API call. Good for AI wrappers.</li>
                  <li><strong>Flat subscription:</strong> Simple $20/mo standard tier.</li>
                  <li><strong>Enterprise customized:</strong> Sales-led motion for large deployments.</li>
                </ul>
                <p>Which of these models aligns best with your goals?</p>
              </div>
            </div>
          )}

          {/* Tailored Response */}
          {chatState === "tailored_response" && (
            <div className="flex gap-4 max-w-[85%] animate-in slide-in-from-bottom-2 fade-in duration-500">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-4 text-sm text-foreground leading-relaxed pt-1">
                <p className="text-primary font-medium flex items-center gap-2 text-xs bg-primary/5 p-2 rounded-lg border border-primary/10 inline-flex">
                  <ShieldCheck className="w-3.5 h-3.5" /> Metaphor Context Injected
                </p>
                <p>I see Atlas is your AI operating system. Based on your recent decisions, here is the exact pricing model you should deploy.</p>
                
                <div className="p-4 bg-surface-1 border border-border-strong rounded-xl my-4 space-y-2">
                  <h4 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-success" /> Aligned with your parameters:
                  </h4>
                  <ul className="space-y-2 text-xs text-muted">
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-border-strong mt-1.5 shrink-0"/> <strong>Credit pricing is rejected.</strong> We will not use token-gating.</li>
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-border-strong mt-1.5 shrink-0"/> <strong>Flat Tiers:</strong> You prefer flat subscription tiers.</li>
                    <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-border-strong mt-1.5 shrink-0"/> <strong>Target ICP:</strong> Founders doing $5k-30k MRR.</li>
                  </ul>
                </div>

                <p><strong>Proposed Model: The Founder Tier</strong><br/>
                Since your ICP is early-stage founders making real revenue, a flat <strong>$49/mo</strong> subscription is the sweet spot. It avoids the friction of credit-counting (which you rejected) and anchors Atlas as a premium, unlimited OS rather than a transactional tool.</p>
                <p>Shall I draft the pricing page copy in your direct, concise style?</p>
              </div>
            </div>
          )}

        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-surface-1/80 via-surface-1/50 to-transparent">
          <div className="relative max-w-3xl mx-auto shadow-lg rounded-2xl">
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={chatState !== "initial"}
              placeholder="Design pricing for Atlas..."
              className="w-full bg-background border border-border-strong rounded-2xl pl-4 pr-12 py-4 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50"
            />
            <button 
              onClick={handleSend}
              disabled={chatState !== "initial"}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-foreground text-background rounded-xl hover:bg-primary transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>


      {/* ── Right: Context Inspector Overlay ── */}
      <div 
        className={`w-96 border-l border-border-subtle bg-background flex flex-col shadow-2xl z-20 ease-in-out duration-500 transform ${
          chatState === "inspecting_context" ? "translate-x-0" : "translate-x-full absolute right-0 h-full hidden"
        }`}
      >
        <div className="p-5 border-b border-border-subtle bg-surface-1/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Context Inspector
            </h2>
            <p className="text-[11px] text-muted mt-1">Review exactly what AI will see.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-2">
              <User className="w-3 h-3" /> Identity Matrix
            </h3>
            <Card noPadding className="bg-surface-1 p-3 space-y-2">
              <div className="text-xs">
                <span className="text-muted">Mission:</span> <span className="text-foreground font-medium">Build MGE</span>
              </div>
              <div className="text-xs">
                <span className="text-muted">Style:</span> <span className="text-foreground font-medium">Direct, Technical</span>
              </div>
            </Card>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted flex items-center gap-2">
              <Target className="w-3 h-3" /> Relevant Projects
            </h3>
            <Card noPadding className="bg-surface-1 overflow-hidden">
              <div className="p-3 border-b border-border-subtle bg-background flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Atlas (OS)</span>
                <span className="text-[10px] font-mono text-success bg-success/10 px-2 py-0.5 rounded">98% Match</span>
              </div>
              
              <div className="p-3 space-y-3 bg-surface-1/50">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-foreground">Decision: Flat Tiers Only</div>
                  <div className="flex items-center gap-2 text-[10px] text-muted">
                    <Check className="w-3 h-3 text-primary" /> Extracted from GitHub Push
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-foreground">Constraint: No Credit Pricing</div>
                  <div className="flex items-center gap-2 text-[10px] text-muted">
                    <Check className="w-3 h-3 text-primary" /> Extracted from Notion Doc
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-foreground">ICP: $5k-$30k MRR Founders</div>
                  <div className="flex items-center gap-2 text-[10px] text-muted">
                    <Check className="w-3 h-3 text-primary" /> Derived from Meeting Notes
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
            <Network className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-primary/80 leading-relaxed">
              Metaphor compressed 484 total nodes into this highly relevant 3-node package in <strong className="text-primary">12ms</strong>.
            </p>
          </div>

        </div>

        <div className="p-5 border-t border-border-subtle bg-surface-1/50">
          <button 
            onClick={handleApprove}
            className="w-full py-3 bg-foreground text-background rounded-xl text-sm font-semibold shadow-md hover:bg-primary transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Approve & Inject Context
          </button>
        </div>
      </div>

    </div>
  );
}
