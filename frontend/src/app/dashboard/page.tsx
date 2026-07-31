"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Plug, Database, Sparkles, Server, Folder, FileText, Calendar, Activity, Command } from "lucide-react";
import { Kbd } from "@/components/ui/Kbd";

export default function SynchronizationDashboard() {
  const [stats, setStats] = useState({
    node_count: 0,
    edge_count: 0,
    active_sessions: 0,
    total_events: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const res = await fetch(`${apiUrl}/graph/stats`);
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error("Failed to fetch stats:", e);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="relative w-full min-h-full">
      {/* Ambient Identity: Subtle SVG glowing lines/nodes */}
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
            <h1 className="text-sm font-semibold text-muted uppercase tracking-widest">System Online</h1>
          </div>
          <p className="text-3xl text-foreground font-medium tracking-tight leading-snug mb-4">
            Your knowledge model is synchronized.
          </p>
          <p className="text-muted text-sm font-medium tracking-tight">
            Metaphor is currently maintaining {stats.node_count} nodes across {stats.edge_count} relational dimensions.
          </p>
        </div>

        {/* The Dashboard Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          
          {/* Active Context Buffer */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-widest flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                Context Architecture
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ContextCard 
                label="Graph Nodes" 
                value={`${stats.node_count} Extracted Concepts`} 
                icon={<Activity />} 
                highlight 
              />
              <ContextCard 
                label="Graph Edges" 
                value={`${stats.edge_count} Relational Links`} 
                icon={<Folder />} 
              />
              <ContextCard 
                label="Context Sessions" 
                value={`${stats.active_sessions} Active AI Conversations`} 
                icon={<Server />} 
                alert={stats.active_sessions > 0} 
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
              <IntegrationItem name="Notion" status={`${stats.total_events} Documents Processed`} loading={false} />
              <IntegrationItem name="Google Drive" status="Awaiting connection" inactive />
              <IntegrationItem name="GitHub" status="Awaiting connection" inactive />
            </div>
          </div>

          {/* Recent Syntheses */}
          <div>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Recent System Activity
            </h2>
            <div className="space-y-6 ml-2">
              {stats.node_count > 0 ? (
                <>
                  <TimelineItem text={`Ingested and parsed ${stats.total_events} new Webhook events.`} time="Recently" />
                  <TimelineItem text={`Reflected and generated ${stats.node_count} new concept nodes.`} time="Recently" />
                </>
              ) : (
                <TimelineItem text="System initialized. Waiting for first ingestion event." time="Just now" />
              )}
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

function IntegrationItem({ name, status, loading = false, inactive = false }: { name: string, status: string, loading?: boolean, inactive?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer group ${inactive ? 'opacity-50 hover:bg-surface-2 hover:opacity-100' : 'hover:bg-surface-2'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${loading ? 'bg-warning animate-pulse' : inactive ? 'bg-muted' : 'bg-success'}`}></div>
        <span className={`text-sm font-medium tracking-tight transition-colors ${inactive ? 'text-muted' : 'text-foreground group-hover:text-primary'}`}>{name}</span>
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
