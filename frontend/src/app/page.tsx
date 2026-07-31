"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Database, Brain, Sparkles, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary-dim selection:text-foreground">
      
      {/* ── Top Navigation Bar ── */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full z-50">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-foreground shadow-[0_0_12px_rgba(var(--foreground-rgb),0.5)]" />
          <span className="text-sm font-semibold tracking-tight text-foreground">Metaphor OS</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          <Link href="#architecture" className="hover:text-foreground transition-colors duration-200">Architecture</Link>
          <Link href="#ontology" className="hover:text-foreground transition-colors duration-200">The Node Model</Link>
          <Link href="#manifesto" className="hover:text-foreground transition-colors duration-200">Manifesto</Link>
        </div>
        
        <div>
          <Link href="/onboarding" className="group flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-80 transition-opacity">
            Initialize
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-start text-center pt-32 px-6">
        
        {/* ── Typography-Driven Hero ── */}
        <div className="max-w-4xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <p className="text-sm font-mono tracking-widest text-muted uppercase mb-8 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Universal Context Engine
          </p>

          <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter text-foreground leading-[1.1] mb-8">
            Every AI should know you <br />
            <span className="text-muted">the way you know yourself.</span>
          </h1>
          
          <p className="text-lg md:text-xl max-w-2xl text-muted leading-relaxed mb-16">
            Metaphor is the context layer between you and every AI. It passively learns from your data sources (Notion, Drive, Calendar) and injects that shared understanding into your AI Consumers (Claude, ChatGPT, Cursor).
          </p>

          <div className="flex items-center gap-6">
            <Link 
              href="/onboarding" 
              className="px-8 py-4 bg-foreground text-background text-sm font-medium rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(var(--foreground-rgb),0.2)]"
            >
              Build Your World Model
            </Link>
          </div>
        </div>

        {/* ── CSS-Based "How it Works" Visualizer ── */}
        <div className="w-full max-w-5xl mt-40 mb-32 animate-in fade-in duration-1000 delay-500">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 relative">
            
            {/* Input Prompt */}
            <div className="w-64 p-6 bg-surface-1 border border-border-subtle rounded-2xl shadow-sm z-10 flex flex-col text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted mb-3">Raw Prompt</span>
              <p className="text-sm text-foreground">"Write the Atlas pricing page."</p>
            </div>

            {/* Connection Line */}
            <div className="hidden md:block w-16 h-[1px] bg-border-subtle relative">
              <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-primary -translate-y-1/2 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
            </div>

            {/* Metaphor Graph Box */}
            <div className="w-80 p-8 bg-surface-1 border border-border-strong rounded-3xl shadow-lg relative overflow-hidden z-20">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <Brain className="w-8 h-8 text-foreground mb-4" />
                <h3 className="text-base font-semibold text-foreground mb-1">Metaphor Graph</h3>
                <p className="text-xs text-muted mb-6">Assembling Context Package</p>
                
                {/* Simulated Node Retrieval */}
                <div className="w-full space-y-2 text-left">
                  <div className="flex items-center gap-2 text-xs text-muted bg-surface-2 px-3 py-2 rounded-md">
                    <Check className="w-3 h-3 text-success" /> + Identity: William
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted bg-surface-2 px-3 py-2 rounded-md">
                    <Check className="w-3 h-3 text-success" /> + Project: Atlas
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted bg-surface-2 px-3 py-2 rounded-md">
                    <Check className="w-3 h-3 text-success" /> + Constraint: Token pricing
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Line */}
            <div className="hidden md:block w-16 h-[1px] bg-border-subtle relative">
              <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-primary -translate-y-1/2 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: "1s" }} />
            </div>

            {/* Output Prompt */}
            <div className="w-80 p-6 bg-surface-1 border border-border-subtle rounded-2xl shadow-sm z-10 flex flex-col text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted mb-3 flex justify-between">
                <span>Injected Prompt</span>
                <span className="text-primary font-mono">169:1 Compression</span>
              </span>
              <p className="text-sm text-foreground leading-relaxed">
                <span className="text-muted">System: User is William building Atlas. Tone is direct. Constraint: Use logarithmic vector pricing.</span> <br/><br/>
                "Write the Atlas pricing page."
              </p>
            </div>
            
          </div>
        </div>

        {/* ── Feature Stack (Typography Driven) ── */}
        <section className="w-full max-w-6xl mx-auto py-24 text-left grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 px-8 border-t border-border-subtle">
          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">Passive Ingestion.</h3>
            <p className="text-base text-muted leading-relaxed">
              Metaphor connects to GitHub, Notion, and Google Drive. It reads webhooks in the background, summarizing commits and documents into relational entities instantly.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">Autonomous Writing.</h3>
            <p className="text-base text-muted leading-relaxed">
              Through the Model Context Protocol (MCP), external AIs like Claude can actively write new decisions back to your knowledge graph during a conversation.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">Conflict Resolution.</h3>
            <p className="text-base text-muted leading-relaxed">
              People change their minds. Metaphor uses time-decaying confidence scores and 'supersedes' relationships to ensure AIs only access your current reality, not 3-year-old opinions.
            </p>
          </div>
        </section>

      </main>

      {/* ── Minimal Footer ── */}
      <footer className="w-full py-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center px-8 text-xs text-muted font-medium">
        <span>© 2026 Multiverse Global. All rights reserved.</span>
        <div className="flex gap-8 mt-4 md:mt-0">
          <Link href="#" className="hover:text-foreground transition-colors">Documentation</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Security</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
        </div>
      </footer>
      
    </div>
  );
}
