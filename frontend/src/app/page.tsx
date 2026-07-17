"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Compass, 
  Sun, 
  Moon, 
  BookOpen, 
  Settings, 
  Globe,
  Database,
  HelpCircle,
  GitBranch,
  CircleDot
} from "lucide-react";

export default function LandingPage() {
  const [theme, setTheme] = useState<"theme-clean" | "theme-paper" | "theme-dark">("theme-clean");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = (localStorage.getItem("atlas.theme") as any) || "theme-clean";
      setTheme(stored);
    }
  }, []);

  const cycleTheme = () => {
    let nextTheme: typeof theme = "theme-clean";
    if (theme === "theme-clean") nextTheme = "theme-paper";
    else if (theme === "theme-paper") nextTheme = "theme-dark";
    
    setTheme(nextTheme);
    localStorage.setItem("atlas.theme", nextTheme);
    document.documentElement.className = nextTheme;
    if (nextTheme === "theme-dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col relative transition-colors duration-300 font-sans">
      
      {/* Navigation Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[var(--card-border)] relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-[var(--accent-gold)] flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-gold)]" />
          </div>
          <span className="text-lg font-bold font-serif tracking-tight">
            Atlas
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={cycleTheme}
            className="p-2 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--card-hover-border)] transition-all cursor-pointer text-xs flex items-center gap-1.5"
            title="Cycle Theme"
          >
            {theme === "theme-clean" && <Sun size={14} className="text-amber-500" />}
            {theme === "theme-paper" && <BookOpen size={14} className="text-amber-800" />}
            {theme === "theme-dark" && <Moon size={14} className="text-amber-300" />}
            <span className="capitalize font-mono text-[10px] font-semibold">
              {theme.replace("theme-", "")}
            </span>
          </button>

          <Link 
            href="/login" 
            className="atlas-btn-primary flex items-center gap-1.5"
          >
            Launch Console <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 flex flex-col justify-center relative z-10 py-16 md:py-24 text-center">
        
        {/* Top Tagline */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-gold-bg)] border border-[var(--card-border)] text-[var(--accent-gold)] text-xs font-mono font-bold uppercase tracking-wider">
            <CircleDot size={12} className="animate-pulse" />
            <span>Strategic Reasoning Engine</span>
          </div>
        </div>
        
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold tracking-tight leading-[1.15] mb-8 text-[var(--foreground)]">
          Where are you <br />
          <span className="italic text-[var(--accent-gold)]">trying to get?</span>
        </h1>
        
        {/* Description */}
        <p className="text-[var(--foreground)]/80 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-10">
          Atlas turns your GitHub, Stripe, Notion, Linear, and Slack activity into one map: the constraint slowing you down, the evidence behind it, and the next move.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link 
            href="/login" 
            className="atlas-btn-primary text-sm px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-sm font-semibold"
          >
            Launch Console <ArrowRight size={16} />
          </Link>
          <a 
            href="#features" 
            className="atlas-btn-secondary text-sm px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 font-semibold"
          >
            Explore Map Framework
          </a>
        </div>
        
        {/* Preview Container (Atlas Scale Visual Mockup) */}
        <div className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 md:p-8 text-left shadow-sm relative overflow-hidden transition-all duration-300">
          
          {/* Mock Header */}
          <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
            </div>
            <span className="text-[10px] text-[var(--muted)] font-mono">dashboard_preview.json</span>
          </div>
          
          {/* Vertical Goal Timeline Mockup */}
          <div className="relative pl-8 border-l border-[var(--timeline-line)] space-y-8">
            
            {/* Goal Node */}
            <div className="relative">
              {/* Dot icon */}
              <div className="absolute -left-[40px] top-1 h-[16px] w-[16px] rounded-full border-2 border-[var(--accent-gold)] bg-[var(--card-bg)] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
              </div>
              
              <span className="text-[10px] font-mono text-[var(--accent-gold)] uppercase tracking-wider font-bold block mb-1">Goal</span>
              <h3 className="text-lg font-serif font-medium text-[var(--foreground)]">Ship the beta of my SaaS by end of month</h3>
            </div>

            {/* Constraint Node */}
            <div className="relative">
              {/* Dot icon */}
              <div className="absolute -left-[40px] top-1 h-[16px] w-[16px] rounded-full border-2 border-red-500 bg-[var(--card-bg)] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              </div>
              
              <span className="text-[10px] font-mono text-red-500 uppercase tracking-wider font-bold block mb-1">Constraint · Blocking</span>
              <h3 className="text-lg font-serif font-medium text-[var(--foreground)]">No GitHub commits have been made in the last 14 days</h3>
              
              <div className="mt-3 bg-[var(--muted-bg)] border border-[var(--card-border)] rounded-lg p-4 font-serif text-sm italic text-[var(--foreground)]/90 leading-relaxed">
                "The founder's goal of shipping the SaaS beta by the end of the month is at risk due to the pause in GitHub commits. With no recent integration activity logs, it is unclear what progress has been made..."
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Features Grid */}
      <section id="features" className="w-full border-t border-[var(--card-border)] py-16 bg-[var(--card-bg)] relative z-10 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--foreground)]">
              Map and align your operations
            </h2>
            <p className="text-[var(--muted)] text-sm leading-relaxed">
              Atlas isolates constraints using structural, semantic, and temporal dimensions to provide immediate action steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="border border-[var(--card-border)] rounded-xl p-6 text-left hover:border-[var(--card-hover-border)] transition-all bg-[var(--background)]">
              <div className="h-9 w-9 rounded-lg bg-[var(--accent-gold-bg)] text-[var(--accent-gold)] flex items-center justify-center mb-4">
                <Compass size={18} />
              </div>
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">Strategy Mapping</h3>
              <p className="text-[var(--muted)] text-xs leading-relaxed">
                Connect raw activity streams from developer repositories, tools, and notes into visual strategy maps.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border border-[var(--card-border)] rounded-xl p-6 text-left hover:border-[var(--card-hover-border)] transition-all bg-[var(--background)]">
              <div className="h-9 w-9 rounded-lg bg-[var(--accent-gold-bg)] text-[var(--accent-gold)] flex items-center justify-center mb-4">
                <Database size={18} />
              </div>
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">Constraint Audits</h3>
              <p className="text-[var(--muted)] text-xs leading-relaxed">
                Automatically diagnose operational blocks, budget issues, or development pauses using semantic model evaluation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border border-[var(--card-border)] rounded-xl p-6 text-left hover:border-[var(--card-hover-border)] transition-all bg-[var(--background)]">
              <div className="h-9 w-9 rounded-lg bg-[var(--accent-gold-bg)] text-[var(--accent-gold)] flex items-center justify-center mb-4">
                <GitBranch size={18} />
              </div>
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">Campaign Roadmaps</h3>
              <p className="text-[var(--muted)] text-xs leading-relaxed">
                Transform diagnoses into step-by-step milestone checklists to resume momentum and reach your objective.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--card-border)] bg-[var(--background)] py-8 relative z-10 text-[var(--muted)] text-xs font-mono text-center transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6">
          <p>© 2026 Atlas Strategist. Built to see what's next.</p>
        </div>
      </footer>

    </div>
  );
}
