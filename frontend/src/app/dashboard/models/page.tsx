"use client";

import React, { useEffect, useState } from "react";
import { Brain, Code, PenTool, Hash, Plus, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { fetchFromMetaphor } from "@/app/api";

type ModelItem = {
  id: string;
  name: string;
  description: string;
  nodes: number;
  isDefault: boolean;
  lastSync: string;
};

export default function ContextModelsPage() {
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const data = await fetchFromMetaphor("/context/models");
      setModels(data);
    } catch (e) {
      console.error("Failed to load context models", e);
    } finally {
      setLoading(false);
    }
  };

  const getModelIcon = (id: string) => {
    switch (id) {
      case "global": return <Brain className="w-5 h-5 text-foreground" />;
      case "engineering": return <Code className="w-5 h-5 text-primary" />;
      default: return <PenTool className="w-5 h-5 text-muted" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in duration-150">
      <header className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-2xl text-foreground font-medium mb-2">Context Models</h1>
          <p className="text-muted text-sm leading-relaxed max-w-xl">
            Context Models allow you to partition your Knowledge Graph. Downstream AIs can request specific models to filter out irrelevant noise.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadModels} className="p-2 text-muted hover:text-foreground bg-surface-1 border border-border-subtle rounded-lg">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            New Model
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((model) => (
          <Card key={model.id} className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="p-2 bg-surface-2 rounded-md">
                {getModelIcon(model.id)}
              </div>
              {model.isDefault && (
                <span className="text-[10px] uppercase tracking-wider font-semibold bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                  Default
                </span>
              )}
            </div>
            
            <h3 className="text-base font-medium text-foreground mb-2">{model.name}</h3>
            <p className="text-sm text-muted leading-relaxed mb-8 flex-grow">
              {model.description}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-border-subtle text-xs text-muted">
              <span className="flex items-center gap-1.5 font-mono">
                <Hash className="w-3.5 h-3.5 text-primary" />
                {model.nodes} Nodes Partitioned
              </span>
              <span>Synced {model.lastSync}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
