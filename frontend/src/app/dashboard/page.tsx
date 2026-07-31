"use client";

import React from "react";
import { OmniSearch } from "@/components/search/OmniSearch";
import { ActionCard } from "@/components/ui/Card";
import { Network, BrainCircuit, Activity, Link2 } from "lucide-react";

export default function CognitiveHome() {
  return (
    <div className="w-full max-w-4xl mx-auto px-8 py-20 flex flex-col items-center">
      
      {/* The Greeting */}
      <div className="text-center mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Good morning.</h1>
        <p className="text-muted">Metaphor OS is ready. What are we exploring today?</p>
      </div>

      {/* The Core Interface (Omni-Search) */}
      <div className="w-full mb-16 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <OmniSearch />
      </div>

      {/* Action-Oriented Cards (Not fake metrics) */}
      <div className="w-full animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <h2 className="text-sm font-semibold text-foreground mb-4 pl-1">Suggested Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard 
            icon={<BrainCircuit className="w-4 h-4" />}
            title="Resume Thinking"
            description="Continue your conversation with Atlas Oracle regarding the data ingestion pipeline."
          />
          <ActionCard 
            icon={<Network className="w-4 h-4" />}
            title="Explore Knowledge Graph"
            description="You have 12 new unlinked nodes created since your last session. Review them."
          />
          <ActionCard 
            icon={<Activity className="w-4 h-4" />}
            title="Check Timeline"
            description="Review the chronological stream of system events and agent decisions."
          />
          <ActionCard 
            icon={<Link2 className="w-4 h-4" />}
            title="Discover Connections"
            description="Metaphor has found a potential contradiction in your recent project notes."
          />
        </div>
      </div>

      <div className="mt-20 w-full animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <h2 className="text-sm font-semibold text-foreground mb-4 pl-1">Recent Memory</h2>
        <div className="w-full border border-border-subtle rounded-xl overflow-hidden bg-surface-1">
          <div className="p-4 border-b border-border-subtle hover:bg-surface-hover cursor-pointer flex justify-between items-center transition-colors">
            <span className="text-sm font-medium text-foreground">Drafted system architecture</span>
            <span className="text-xs text-muted">2 hours ago</span>
          </div>
          <div className="p-4 border-b border-border-subtle hover:bg-surface-hover cursor-pointer flex justify-between items-center transition-colors">
            <span className="text-sm font-medium text-foreground">Discussed Postgres integration</span>
            <span className="text-xs text-muted">Yesterday</span>
          </div>
          <div className="p-4 hover:bg-surface-hover cursor-pointer flex justify-between items-center transition-colors">
            <span className="text-sm font-medium text-foreground">Linked "React" to "Bento Grid"</span>
            <span className="text-xs text-muted">Monday</span>
          </div>
        </div>
      </div>

    </div>
  );
}
