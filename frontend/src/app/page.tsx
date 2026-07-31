'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      
      {/* ── Top Navigation Bar (Structural) ── */}
      <nav className="grid-section flex items-center justify-between px-6 py-4 bg-background">
        <div className="flex items-center gap-6">
          <div className="font-serif text-3xl font-bold tracking-tighter leading-none">M</div>
          <span className="mono text-xs uppercase tracking-widest hidden sm:block">Context Engine</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="#architecture" className="nav-link">Architecture</Link>
          <Link href="#ontology" className="nav-link">Ontology</Link>
          <Link href="#manifesto" className="nav-link">Manifesto</Link>
        </div>
        
        <div>
          <Link href="/dashboard" className="btn-tactile primary">
            Initialize
          </Link>
        </div>
      </nav>

      {/* ── Main Hero Section (Asymmetrical Editorial) ── */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 bg-background">
        
        {/* Left Column: Dense Typography & Manifesto */}
        <div className="md:col-span-8 col-border p-8 md:p-16 flex flex-col justify-between">
          <div className="reveal is-visible mb-16">
            <span className="tag blue mb-6">Vol. 01 — Context OS</span>
            <h1 className="text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tighter mb-8">
              Death to<br/>the silo.
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl text-muted-foreground leading-relaxed">
              Metaphor is a structural knowledge engine. We do not generate text. We parse fragmented digital exhaust and forge absolute, queryable truth.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 reveal is-visible" style={{ transitionDelay: '0.1s' }}>
            <Link href="/dashboard" className="btn-tactile primary text-lg">
              [ Mount Directory ]
            </Link>
            <button className="btn-tactile text-lg">
              Read Specification
            </button>
          </div>
        </div>

        {/* Right Column: Utilitarian Data Visualization */}
        <div className="md:col-span-4 p-8 flex flex-col justify-between bg-surface relative overflow-hidden">
          {/* Schematic Background Pattern */}
          <div className="absolute inset-0 opacity-10" 
               style={{ backgroundImage: 'repeating-linear-gradient(45deg, var(--foreground) 0, var(--foreground) 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} 
          />
          
          <div className="relative z-10 space-y-12">
            <div>
              <h3 className="mono text-xs uppercase tracking-widest mb-4 border-b-2 border-border pb-2">System Status</h3>
              <ul className="space-y-3 mono text-sm">
                <li className="flex justify-between"><span>Core Engine</span> <span className="tag filled">Online</span></li>
                <li className="flex justify-between"><span>Graph DB</span> <span className="tag filled">Syncing</span></li>
                <li className="flex justify-between"><span>Ingestion Pipeline</span> <span className="tag filled">Active</span></li>
              </ul>
            </div>

            <div>
              <h3 className="mono text-xs uppercase tracking-widest mb-4 border-b-2 border-border pb-2">Live Telemetry</h3>
              <div className="panel p-4 bg-background">
                <pre className="mono text-xs leading-relaxed text-muted-foreground">
{`> Initializing Metaphor...
> Parsing 1,402 commits
> Resolving entities
[====================] 100%
> 42 Conflicts detected
> Requesting clarification
> Awaiting user input...`}
                </pre>
                <div className="mt-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-accent-red animate-pulse block" />
                  <span className="mono text-xs font-bold text-accent-red uppercase">Input Required</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 mt-12 text-right">
            <span className="font-serif text-6xl opacity-20 font-bold leading-none">M—OS</span>
          </div>
        </div>

      </main>

      {/* ── Sub-Feature Section (3 Column Grid) ── */}
      <section className="grid-section grid grid-cols-1 md:grid-cols-3">
        <div className="p-8 col-border hover:bg-surface transition-colors cursor-crosshair">
          <h3 className="font-serif text-2xl mb-4">Deterministic</h3>
          <p className="text-muted-foreground text-sm">No hallucinations. Every entity in the graph is strictly typed, sourced, and version-controlled. If it isn't true, it doesn't map.</p>
        </div>
        <div className="p-8 col-border hover:bg-surface transition-colors cursor-crosshair">
          <h3 className="font-serif text-2xl mb-4">Extensible</h3>
          <p className="text-muted-foreground text-sm">Mount GitHub, Slack, Notion, or your own bespoke exhaust pipelines. The ontology bends to your infrastructure.</p>
        </div>
        <div className="p-8 hover:bg-surface transition-colors cursor-crosshair">
          <h3 className="font-serif text-2xl mb-4">Tactile</h3>
          <p className="text-muted-foreground text-sm">A user interface built for engineers, not marketers. High density, low latency. Command palette driven.</p>
        </div>
      </section>

      {/* ── Brutalist Footer ── */}
      <footer className="p-6 flex flex-col md:flex-row justify-between items-center mono text-xs uppercase tracking-wider bg-background">
        <span>© 2026 Metaphor Engine</span>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a href="#" className="hover:underline">Documentation</a>
          <a href="#" className="hover:underline">GitHub</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
      </footer>
      
    </div>
  );
}
