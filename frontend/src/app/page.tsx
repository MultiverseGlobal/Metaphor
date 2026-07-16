"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Activity, 
  GitBranch,
  Network
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
      
      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"
      />

      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-900/50 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Network className="text-slate-950 stroke-[2.5]" size={18} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Metaphor
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-slate-200 transition-colors">Features</a>
          <a href="#architecture" className="hover:text-slate-200 transition-colors">Architecture</a>
          <a href="#api" className="hover:text-slate-200 transition-colors">API Docs</a>
        </nav>

        <div>
          <Link 
            href="/login" 
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-300 flex items-center gap-1.5 cursor-pointer text-slate-200"
          >
            Launch Console <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 flex flex-col justify-center relative z-10 py-16 md:py-24">
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Text */}
          <div className="lg:col-span-7 flex flex-col text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-900/50 text-violet-300 text-xs font-medium w-fit">
              <Sparkles size={12} className="text-violet-400" />
              <span>Context Engine for Agentic Teams</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Continuous World <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400">
                Modeling for AI
              </span>
            </h1>
            
            <p className="text-slate-400 text-base md:text-lg max-w-xl leading-relaxed">
              Metaphor is a Context-as-a-Service engine. It continuously reflects on raw logs, calendar entries, Notion updates, and commits to build a unified relational graph. Serve rich, structured context to your AI agents automatically.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="/login" 
                className="px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-cyan-500 text-slate-950 hover:opacity-95 transition-all text-sm shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                Enter Sandbox Console <ArrowRight size={16} />
              </Link>
              <a 
                href="#features" 
                className="px-6 py-3.5 rounded-xl font-bold bg-slate-900/60 border border-slate-800 text-slate-300 hover:bg-slate-800/80 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Learn More
              </a>
            </div>
          </div>
          
          {/* Hero Right Visual (Interactive/Mock Graph) */}
          <div className="lg:col-span-5 relative w-full aspect-square md:aspect-[4/3] lg:aspect-square flex items-center justify-center">
            
            {/* Visual Panel mimicking timbal.ai style */}
            <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-2xl">
              
              {/* Header style */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-[10px] text-slate-500 font-mono">metaphor-graph-viewer.json</span>
              </div>
              
              {/* Animated Mock Node Network */}
              <div className="relative h-64 border border-slate-950 bg-slate-950/80 rounded-xl overflow-hidden p-4 flex flex-col justify-between">
                
                {/* Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path d="M 90,50 L 220,100" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1.5" strokeDasharray="4" />
                  <path d="M 320,80 L 220,100" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="2" />
                  <path d="M 220,100 L 150,180" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2.5" />
                  <path d="M 150,180 L 290,195" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1.5" strokeDasharray="4" />
                </svg>

                {/* Node 1 */}
                <div className="absolute top-6 left-6 px-3 py-2 rounded-lg bg-slate-900 border border-violet-500/30 text-left flex flex-col scale-90 hover:scale-95 transition-transform cursor-default">
                  <span className="text-[8px] text-violet-400 font-bold uppercase tracking-wider">Project</span>
                  <span className="text-xs font-semibold text-white">Metaphor</span>
                </div>

                {/* Node 2 */}
                <div className="absolute top-10 right-8 px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/30 text-left flex flex-col scale-90 hover:scale-95 transition-transform cursor-default">
                  <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-wider">Idea</span>
                  <span className="text-xs font-semibold text-white">Context API</span>
                </div>

                {/* Node 3 */}
                <div className="absolute top-24 left-[35%] px-4 py-2.5 rounded-xl bg-slate-900/90 border border-violet-500 shadow-lg shadow-violet-500/10 text-left flex flex-col hover:scale-105 transition-transform cursor-default">
                  <span className="text-[9px] text-violet-400 font-bold uppercase tracking-wider">Decision</span>
                  <span className="text-xs font-semibold text-white">OAuth Decoupling</span>
                </div>

                {/* Node 4 */}
                <div className="absolute bottom-8 left-8 px-3 py-2 rounded-lg bg-slate-900 border border-emerald-500/30 text-left flex flex-col scale-90 hover:scale-95 transition-transform cursor-default">
                  <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">Commit</span>
                  <span className="text-xs font-semibold text-white">fix: decouple keys</span>
                </div>

                {/* Node 5 */}
                <div className="absolute bottom-6 right-6 px-3 py-2 rounded-lg bg-slate-900 border border-violet-500/30 text-left flex flex-col scale-90 hover:scale-95 transition-transform cursor-default">
                  <span className="text-[8px] text-violet-400 font-bold uppercase tracking-wider">Person</span>
                  <span className="text-xs font-semibold text-white">Benjamin</span>
                </div>

              </div>

              {/* Feed Console */}
              <div className="mt-4 text-[10px] font-mono text-left bg-slate-950 p-3 rounded-lg border border-slate-900 text-slate-400 overflow-hidden h-20 relative">
                <div className="animate-pulse flex items-center gap-1.5 text-cyan-400 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Real-time ingestion active...</span>
                </div>
                <div className="space-y-0.5">
                  <p>&gt; Ingested Notion page "Value-based Pricing"</p>
                  <p>&gt; Extracted link: Project(Atlas) -&gt; Decision(Local Postgres)</p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* Features Section */}
      <section id="features" className="w-full bg-slate-950 border-t border-slate-900/60 py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          
          <div className="space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white">
              Structured Dimensional Context
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              We model and connect knowledge across three distinct axes to provide AI agents with a comprehensive mental map of your operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 text-left hover:border-slate-700/80 transition-all duration-300 backdrop-blur-sm relative group">
              <div className="h-10 w-10 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Structural Dimension</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Tracks organizational hierarchy, ownership, and containment. Understands which projects contain which documents, designs, and decisions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 text-left hover:border-slate-700/80 transition-all duration-300 backdrop-blur-sm relative group">
              <div className="h-10 w-10 rounded-xl bg-cyan-600/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Semantic Dimension</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connects thematic and conceptual relationships. Discovers associations, user goals, and related research pages across disparate source tools.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 text-left hover:border-slate-700/80 transition-all duration-300 backdrop-blur-sm relative group">
              <div className="h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GitBranch size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Temporal Dimension</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Maps causality and progression. Tracks how a client request caused a brainstorming session, leading to a design decision, ending in a git commit.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Integration Banner */}
      <section id="architecture" className="w-full bg-slate-950 border-t border-slate-900/60 py-16 relative z-10 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-left space-y-2 max-w-lg">
            <h3 className="text-xl font-bold text-white">Out-of-the-box Integrations</h3>
            <p className="text-xs leading-relaxed">
              Metaphor automatically listens to events and pages from GitHub, Notion, Google Drive, Google Calendar, and more to synthesize context without manual note-taking.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs font-semibold text-slate-300">GitHub</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs font-semibold text-slate-300">Notion</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs font-semibold text-slate-300">Google Workspace</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/60 py-8 relative z-10 text-slate-500 text-xs font-mono text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p>© 2026 Metaphor. Built for the next generation of Agentic Workforces.</p>
        </div>
      </footer>

    </div>
  );
}
