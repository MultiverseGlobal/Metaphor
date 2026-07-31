"use client";

import React from "react";
import { OmniSearch } from "@/components/search/OmniSearch";
import { HeroActionCard, ActionCard } from "@/components/ui/Card";
import { Network, Activity, Link2, Sparkles, Brain } from "lucide-react";

export default function CognitiveHome() {
  return (
    <div className="relative w-full min-h-full">
      {/* Ambient Identity: Subtle SVG glowing lines/nodes representing the knowledge graph */}
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

      <div className="relative z-10 w-full max-w-3xl mx-auto px-8 pt-24 pb-32 flex flex-col items-start">
        
        {/* The Greeting */}
        <div className="mb-16 animate-fade-in-up">
          <h1 className="text-sm font-semibold text-muted uppercase tracking-widest mb-2">Good morning, William</h1>
          <p className="text-xl text-foreground font-medium">You've been exploring AI architecture. I found two ideas you may have overlooked.</p>
        </div>

        {/* The Core Interface (Omni-Search) */}
        <div className="w-full mb-16 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <OmniSearch />
        </div>

        {/* Where was I? (The Hero Card) */}
        <div className="w-full mb-16 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <HeroActionCard 
            metadata="Active Workflow • 2 hours ago"
            title="Continue Atlas Architecture"
            subtitle="Resume drafting the data ingestion pipeline and context chunking strategy."
          />
        </div>

        {/* What changed? & What should I do? */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          
          <div>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-6">Today's Discoveries</h2>
            <div className="space-y-6">
              <MemoryItem icon={<Brain />} text="You connected Atlas with Brief." time="2 hours ago" />
              <MemoryItem icon={<Sparkles />} text="Found a contradiction in the pricing model." time="Yesterday" />
              <MemoryItem icon={<Link2 />} text="Linked 'React' to 'Bento Grid' structural patterns." time="Monday" />
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-6">Suggested Actions</h2>
            <div className="grid grid-cols-1 gap-2 -ml-5">
              <ActionCard 
                icon={<Network className="w-4 h-4" />}
                title="Review Knowledge Graph"
                description="12 new unlinked nodes created."
              />
              <ActionCard 
                icon={<Activity className="w-4 h-4" />}
                title="Check Timeline"
                description="Review the chronological stream of events."
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Memory Item built on pure typography, no boxes
function MemoryItem({ icon, text, time }: { icon: React.ReactNode, text: string, time: string }) {
  return (
    <div className="group flex items-start gap-4 cursor-pointer">
      <div className="mt-0.5 text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
        {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{text}</p>
        <p className="text-[11px] text-muted mt-1">{time}</p>
      </div>
    </div>
  );
}
