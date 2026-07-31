'use client';

import React from 'react';
import Link from 'next/link';
import { Network, Activity, ArrowRight, Zap, Database, Lock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      
      {/* ── Ambient Glows (Themes like Obsidian and Spatial use these, Minimalist hides them via CSS overrides) ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-blue/20 blur-[120px] pointer-events-none" />

      {/* ── Top Navigation Bar ── */}
      <nav className="flex items-center justify-between px-8 py-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)]">
            <Network className="w-4 h-4" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight">Metaphor</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="#architecture" className="nav-link">Architecture</Link>
          <Link href="#ontology" className="nav-link">Ontology</Link>
          <Link href="#manifesto" className="nav-link">Manifesto</Link>
        </div>
        
        <div>
          <Link href="/dashboard" className="btn-tactile primary">
            Enter Workspace <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </nav>

      {/* ── Main Hero Section ── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10 mt-12 mb-20">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface/50 backdrop-blur-md mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Metaphor OS v1.0 Live</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl tracking-tight max-w-5xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Context is <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-blue">Everything.</span>
        </h1>
        
        <p className="text-lg md:text-xl max-w-2xl text-muted-foreground leading-relaxed mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Metaphor transforms fragmented digital exhaust from your tools into a living, queryable knowledge graph. The single source of truth for intelligent agents.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Link href="/dashboard" className="btn-tactile primary text-base px-8 py-4">
            Initialize OS
          </Link>
          <button className="btn-tactile text-base px-8 py-4 bg-surface backdrop-blur-md">
            Read Documentation
          </button>
        </div>

        {/* ── Interactive Prism Teaser ── */}
        <div className="mt-24 w-full max-w-4xl panel p-2 bg-surface/30 backdrop-blur-xl animate-fade-in-up relative" style={{ animationDelay: '0.4s' }}>
          <div className="absolute -top-3 -right-3 w-24 h-24 bg-accent-red/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-3 -left-3 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
          
          <div className="bg-background/80 rounded-[calc(var(--radius)-4px)] p-8 border border-border/50 relative overflow-hidden flex flex-col items-center">
            
            <div className="flex items-center justify-between w-full mb-12 relative z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center shadow-lg"><Activity className="text-accent-red" /></div>
                <span className="text-xs font-mono text-muted-foreground">GitHub</span>
              </div>
              <div className="h-[2px] flex-1 mx-4 bg-gradient-to-r from-border via-primary/50 to-border relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-1/3 bg-primary blur-[2px] animate-[slide_2s_ease-in-out_infinite]" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.3)] z-10">
                  <Network className="w-8 h-8" />
                </div>
                <span className="text-sm font-bold mt-2">Metaphor Graph</span>
              </div>
              <div className="h-[2px] flex-1 mx-4 bg-gradient-to-r from-border via-accent-blue/50 to-border relative overflow-hidden">
                <div className="absolute top-0 right-0 h-full w-1/3 bg-accent-blue blur-[2px] animate-[slide_2s_ease-in-out_infinite_reverse]" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center shadow-lg"><Database className="text-accent-blue" /></div>
                <span className="text-xs font-mono text-muted-foreground">Notion</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center max-w-lg relative z-10">
              Live ingestion pipeline translating unstructured commits and documents into relational entities instantly.
            </p>
          </div>
        </div>

      </main>

      {/* ── Feature Grid ── */}
      <section className="py-24 px-8 bg-surface/50 border-t border-border/50 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="panel p-8 bg-background/50 hover:bg-background transition-colors">
            <Database className="w-8 h-8 text-primary mb-6" />
            <h3 className="font-serif text-2xl font-bold mb-3">Deterministic State</h3>
            <p className="text-muted-foreground leading-relaxed">Entities are strictly typed and version controlled. Hallucinations are impossible at the data layer.</p>
          </div>
          <div className="panel p-8 bg-background/50 hover:bg-background transition-colors">
            <Zap className="w-8 h-8 text-accent-blue mb-6" />
            <h3 className="font-serif text-2xl font-bold mb-3">Universal Adapters</h3>
            <p className="text-muted-foreground leading-relaxed">Mount any data source. Our normalizer standardizes exhaust from GitHub, Slack, Notion, and custom APIs.</p>
          </div>
          <div className="panel p-8 bg-background/50 hover:bg-background transition-colors">
            <Lock className="w-8 h-8 text-accent-red mb-6" />
            <h3 className="font-serif text-2xl font-bold mb-3">Local Control</h3>
            <p className="text-muted-foreground leading-relaxed">Your context OS runs in your own infrastructure. Total privacy for your organization's intellectual property.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground relative z-10 bg-background">
        <span>© 2026 MultiverseGlobal // Metaphor OS</span>
        <div className="flex gap-6 mt-4 md:mt-0 font-medium">
          <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
          <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          <a href="#" className="hover:text-foreground transition-colors">Security</a>
        </div>
      </footer>
      
    </div>
  );
}
