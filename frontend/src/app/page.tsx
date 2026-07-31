'use client';

import React from 'react';
import Link from 'next/link';
import { Network, Activity, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden relative">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent-cyan/15 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik02MCAwTDYwIDYwTDAgNjBMMCAwTDYwIDBaIiBmaWxsPSJub25lIi8+CjxjaXJjbGUgY3g9IjMiIGN5PSIzIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+Cjwvc3ZnPg==')] opacity-60 pointer-events-none" />

      {/* Navigation Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md bg-foreground flex items-center justify-center">
            <Network className="w-5 h-5 text-background" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">Metaphor</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Platform</Link>
          <Link href="#architecture" className="hover:text-foreground transition-colors">Architecture</Link>
          <Link href="#security" className="hover:text-foreground transition-colors">Security</Link>
        </div>
        <div>
          <Link href="/dashboard" className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)] flex items-center gap-2 group">
            Launch OS <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 text-center">
        <div className="animate-fade-in-up flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-semibold mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>METAPHOR ENGINE V2.0 LIVE</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter max-w-5xl leading-[1.05] mb-6">
            Context is <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-cyan">Everything.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed font-light">
            Metaphor is the Context Operating System for intelligent applications. We transform fragmented data streams into a unified, structured knowledge graph.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/dashboard" className="px-8 py-4 rounded-xl bg-foreground text-background text-sm font-bold hover:bg-foreground/90 transition-all flex items-center gap-2">
              <Activity className="w-4 h-4" /> Enter Workspace
            </Link>
            <button className="px-8 py-4 rounded-xl bg-surface/50 border border-border text-foreground text-sm font-bold hover:bg-surface-hover transition-all backdrop-blur-sm">
              Read the Docs
            </button>
          </div>
        </div>

        {/* Interactive Teaser Element - The Prism */}
        <div className="mt-20 w-full max-w-5xl relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="glass-panel w-full h-[400px] md:h-[500px] flex items-center justify-center relative overflow-hidden group">
            {/* Inner Glow corresponding to the interaction */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="relative w-full h-full">
                  {/* Central Node */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-2xl bg-card border border-border shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] flex items-center justify-center z-20 animate-float">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Network className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  {/* Satellite Nodes */}
                  <SatelliteNode top="20%" left="30%" icon={<Clock className="w-4 h-4 text-accent-cyan" />} label="Timeline Data" delay="0s" />
                  <SatelliteNode top="30%" right="25%" icon={<Activity className="w-4 h-4 text-emerald-400" />} label="Live Events" delay="2s" />
                  <SatelliteNode bottom="25%" left="25%" icon={<ShieldCheck className="w-4 h-4 text-primary" />} label="Auth Context" delay="1s" />
                  <SatelliteNode bottom="20%" right="30%" icon={<Network className="w-4 h-4 text-purple-400" />} label="Graph Relations" delay="3s" />
                  
                  {/* Connection Lines (SVG) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ opacity: 0.3 }}>
                    <line x1="30%" y1="20%" x2="50%" y2="50%" stroke="url(#cyan-grad)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse-cyan" />
                    <line x1="75%" y1="30%" x2="50%" y2="50%" stroke="url(#emerald-grad)" strokeWidth="1.5" />
                    <line x1="25%" y1="75%" x2="50%" y2="50%" stroke="url(#blue-grad)" strokeWidth="1.5" />
                    <line x1="70%" y1="80%" x2="50%" y2="50%" stroke="url(#purple-grad)" strokeWidth="1.5" strokeDasharray="4 4" />
                    <defs>
                      <linearGradient id="cyan-grad"><stop offset="0%" stopColor="hsl(var(--accent-cyan))"/><stop offset="100%" stopColor="transparent"/></linearGradient>
                      <linearGradient id="emerald-grad"><stop offset="0%" stopColor="#34d399"/><stop offset="100%" stopColor="transparent"/></linearGradient>
                      <linearGradient id="blue-grad"><stop offset="0%" stopColor="hsl(var(--primary))"/><stop offset="100%" stopColor="transparent"/></linearGradient>
                      <linearGradient id="purple-grad"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="transparent"/></linearGradient>
                    </defs>
                  </svg>
               </div>
            </div>

            {/* Bottom Gradient Fade to merge with page bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-background/50 backdrop-blur-sm py-6 mt-20">
        <div className="container flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span>© 2026 Metaphor Context Engine</span>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">GitHub</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SatelliteNode({ top, left, right, bottom, icon, label, delay }: any) {
  return (
    <div 
      className="absolute bg-surface border border-border px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg animate-float z-20"
      style={{ top, left, right, bottom, animationDelay: delay }}
    >
      {icon}
      <span className="text-[10px] font-mono font-semibold text-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}
