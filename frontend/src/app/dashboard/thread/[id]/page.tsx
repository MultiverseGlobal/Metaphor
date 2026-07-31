"use client";

import React from "react";
import { MessageBlock } from "@/components/thread/MessageBlock";
import { ThreadInput } from "@/components/thread/ThreadInput";
import { Share, MoreHorizontal } from "lucide-react";

export default function CognitiveThreadPage({ params }: { params: { id: string } }) {
  const MOCK_SOURCES = [
    { title: "Atlas Architecture Overview", sourceName: "Metaphor Doc", time: "Oct 12" },
    { title: "Data Ingestion Pipeline v2", sourceName: "Notion", time: "Oct 14" },
    { title: "Pricing Model Contradictions", sourceName: "Memory", time: "Yesterday" }
  ];

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Thread Header */}
      <div className="sticky top-0 z-20 w-full h-14 bg-background/80 backdrop-blur-xl border-b border-border-subtle flex items-center justify-between px-6">
        <div className="flex items-center gap-3 text-sm font-medium">
          <span className="text-muted">Thread</span>
          <span className="text-border-strong">/</span>
          <span className="text-foreground tracking-tight">Atlas Architecture Context</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-muted hover:text-foreground hover:bg-surface-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            <Share className="w-4 h-4" />
          </button>
          <button className="p-2 text-muted hover:text-foreground hover:bg-surface-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The Conversation Stream */}
      <div className="flex-1 overflow-y-auto w-full pb-32">
        <MessageBlock 
          role="user" 
          content="I am resuming work on Atlas. What were the key contradictions we found yesterday regarding the pricing model and the new vector ingestion pipeline?" 
        />
        <MessageBlock 
          role="ai" 
          content={`Welcome back, William. 
          
Based on your previous notes and the system architecture documents, there are two primary contradictions you need to resolve:

First, the pricing model assumes a flat rate for token ingestion. However, the new \`VectorPipelineV2\` explicitly introduces a dynamic batching process that scales logarithmically. If you charge a flat rate, high-volume ingestion will destroy your margins within the first month.

Second, you noted in Notion that "Atlas should never store raw strings," but the current fallback mechanism in the parser temporarily caches raw strings to Redis before the embedding model spins up.

I recommend we fix the pricing tiers first, as that impacts the business model immediately. Should we pull up the pricing matrix?`}
          sources={MOCK_SOURCES}
        />
        <MessageBlock 
          role="user" 
          content="Yes, pull up the pricing matrix. Let's see how much we lose if someone ingests 10 million vectors." 
        />
        <MessageBlock 
          role="ai" 
          content={`Pulling the pricing matrix. Give me a moment to simulate the new ingestion loads based on your logarithmic scaling model...`}
        />
      </div>

      {/* Sticky Input Palette */}
      <div className="sticky bottom-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-6">
        <ThreadInput />
      </div>

    </div>
  );
}
