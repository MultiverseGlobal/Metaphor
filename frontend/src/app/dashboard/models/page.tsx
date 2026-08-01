"use client";

import React from "react";
import { Brain, Code, PenTool, Hash, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function ContextModelsPage() {
  const models = [
    {
      name: "Global Identity",
      description: "Your default context model. Applies to all generalized queries.",
      icon: <Brain className="w-5 h-5 text-foreground" />,
      nodes: 142,
      lastSync: "Just now",
      isDefault: true,
    },
    {
      name: "Software Engineering",
      description: "Strict technical context. Heavily weighted towards codebase constraints and architectural decisions.",
      icon: <Code className="w-5 h-5 text-muted" />,
      nodes: 384,
      lastSync: "2 hours ago",
      isDefault: false,
    },
    {
      name: "Writing & Content",
      description: "Optimized for drafting. Focuses on style preferences and banned terminology.",
      icon: <PenTool className="w-5 h-5 text-muted" />,
      nodes: 56,
      lastSync: "1 day ago",
      isDefault: false,
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in duration-150">
      <header className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-2xl text-foreground font-medium mb-2">Context Models</h1>
          <p className="text-muted text-sm leading-relaxed max-w-xl">
            Context Models allow you to partition your Knowledge Graph. Downstream AIs can request specific models to filter out irrelevant noise.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          New Model
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((model, idx) => (
          <Card key={idx} className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="p-2 bg-surface-2 rounded-md">
                {model.icon}
              </div>
              {model.isDefault && (
                <span className="text-[10px] uppercase tracking-wider font-semibold bg-surface-2 text-foreground px-2 py-1 rounded">
                  Default
                </span>
              )}
            </div>
            
            <h3 className="text-base font-medium text-foreground mb-2">{model.name}</h3>
            <p className="text-sm text-muted leading-relaxed mb-8 flex-grow">
              {model.description}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-subtle text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                {model.nodes} Nodes
              </span>
              <span>Synced {model.lastSync}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
