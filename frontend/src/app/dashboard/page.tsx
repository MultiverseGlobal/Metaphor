"use client";

import React from "react";
import { CheckCircle2, Plug, Database, Sparkles, Server, Folder, FileText, Calendar, Activity, Command } from "lucide-react";
import { Kbd } from "@/components/ui/Kbd";

export default function SynchronizationDashboard() {
  return (
    <div className="relative w-full min-h-full">
      {/* Ambient Identity: Subtle SVG glowing lines/nodes representing the active context mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="1.5" fill="currentColor" />
              <path d="M50 50 L150 150 M50 50 L-50 150 M50 50 L150 -50 M50 50 L-50 -50" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-8 pt-24 pb-32 flex flex-col items-start">
        
        {/* Core Positioning & Greeting */}
        <div className="mb-16 animate-fade-in-up w-full border-b border-border-subtle/50 pb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <h1 className="text-sm font-semibold text-muted uppercase tracking-widest">Good evening, William</h1>
          </div>
          <p className="text-3xl text-foreground font-medium tracking-tight leading-snug mb-4">
            Your knowledge model is synchronized.
          </p>
          <p className="text-muted text-sm font-medium tracking-tight">
            Metaphor is the universal context engine that gives every AI and application the knowledge it needs to understand you, your work, and your goals.
          </p>
        </div>

        {/* The Dashboard Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          
          {/* Active Context Buffer (What is currently loaded) */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-widest flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                Active Context Buffer
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted uppercase">Clear Buffer</span>
                <Kbd>⌘⌫</Kbd>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ContextCard 
                label="Primary Objective" 
                value="Design the Universal Context Engine" 
                icon={<Activity />} 
                highlight 
              />
              <ContextCard 
                label="Active Project" 
                value="Atlas Architecture" 
                icon={<Folder />} 
              />
              <ContextCard 
                label="Loaded Constraint" 
                value="Do not store raw strings in Redis" 
                icon={<Server />} 
                alert 
              />
            </div>
          </div>

          {/* Connected Intelligence (Integrations) */}
          <div>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
              <Plug className="w-3.5 h-3.5" />
              Connected Sources
            </h2>
            <div className="bg-surface-1 border border-border-subtle rounded-xl p-2 space-y-1">
              <IntegrationItem name="ChatGPT Plus" status="Synchronized" />
              <IntegrationItem name="Claude Pro" status="Synchronized" />
              <IntegrationItem name="Cursor IDE" status="Synchronized" />
              <IntegrationItem name="GitHub" status="Indexing (94%)" loading />
              <IntegrationItem name="Notion" status="Synchronized" />
            </div>
          </div>

          {/* Recent Syntheses (What the engine just did) */}
          <div>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Recent Syntheses
            </h2>
            <div className="space-y-6 ml-2">
              <TimelineItem text="Mapped VectorPipelineV2 to Atlas pricing constraints." time="12 mins ago" />
              <TimelineItem text="Extracted 'Context Engine' pivot from Claude session." time="2 hours ago" />
              <TimelineItem text="Synced 14 new Notion architecture documents." time="5 hours ago" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// UI Primitives for the Dashboard

function ContextCard({ label, value, icon, highlight = false, alert = false }: { label: string, value: string, icon: React.ReactNode, highlight?: boolean, alert?: boolean }) {
  return (
    <div 
      className={`group p-5 rounded-xl border transition-all duration-300 hover:-translate-y-[2px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
        highlight ? 'bg-primary/5 border-primary/20' : 
        alert ? 'bg-orange-500/5 border-orange-500/20' : 
        'bg-surface-1 border-border-subtle/50 hover:border-border-strong'
      }`}
      tabIndex={0}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 ${
        highlight ? 'bg-primary/10 text-primary' : 
        alert ? 'bg-orange-500/10 text-orange-500' : 
        'bg-surface-2 text-muted group-hover:text-foreground'
      } transition-colors`}>
        {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })}
      </div>
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1.5">{label}</p>
      <p className="text-sm font-medium text-foreground tracking-tight leading-snug">{value}</p>
    </div>
  );
}

function IntegrationItem({ name, status, loading = false }: { name: string, status: string, loading?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${loading ? 'bg-warning animate-pulse' : 'bg-success'}`}></div>
        <span className="text-sm font-medium text-foreground tracking-tight group-hover:text-primary transition-colors">{name}</span>
      </div>
      <span className="text-xs font-medium text-muted">{status}</span>
    </div>
  );
}

function TimelineItem({ text, time }: { text: string, time: string }) {
  return (
    <div className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:w-2 before:h-2 before:rounded-full before:border-2 before:border-primary/50 before:bg-background">
      <p className="text-sm font-medium text-foreground tracking-tight leading-relaxed">{text}</p>
      <p className="text-[11px] text-muted mt-1">{time}</p>
    </div>
  );
}
