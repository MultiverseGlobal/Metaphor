"use client";

import React, { useEffect, useState } from "react";
import { GitBranch as Github, FileText, Calendar, Box, HardDrive, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { fetchFromMetaphor } from "../../api";

type IntegrationState = {
  provider: string;
  status: string;
  events_processed: number;
  last_sync: string | null;
};

const PROVIDER_METADATA: Record<string, { name: string; category: string; description: string; icon: React.ReactNode }> = {
  github: {
    name: "GitHub",
    category: "Code & Projects",
    description: "Syncs commits, issues, and PRs as Operations Nodes.",
    icon: <Github className="w-5 h-5" />
  },
  notion: {
    name: "Notion",
    category: "Knowledge Base",
    description: "Extracts decisions, constraints, and project scopes.",
    icon: <FileText className="w-5 h-5" />
  },
  gcal: {
    name: "Google Calendar",
    category: "Timeline",
    description: "Builds the temporal graph and participant nodes.",
    icon: <Calendar className="w-5 h-5" />
  },
  gmail: {
    name: "Gmail",
    category: "Communications",
    description: "Indexes email context, project updates, and decisions.",
    icon: <HardDrive className="w-5 h-5" />
  },
  linear: {
    name: "Linear",
    category: "Operations",
    description: "Maps task progression to active goals.",
    icon: <Box className="w-5 h-5" />
  }
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationState[]>([]);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const data = await fetchFromMetaphor("/integrations");
      setIntegrations(data);
    } catch (e) {
      console.error("Failed to load integrations", e);
    }
  };

  const handleSync = async (provider: string) => {
    setSyncing(prev => ({ ...prev, [provider]: true }));
    try {
      await fetchFromMetaphor(`/integrations/${provider}/sync`, undefined, "POST");
      await loadIntegrations();
    } catch (e) {
      console.error(`Failed to sync ${provider}:`, e);
    } finally {
      setSyncing(prev => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in duration-150">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-foreground font-medium mb-2">Integrations</h1>
          <p className="text-muted text-sm leading-relaxed max-w-xl">
            Connect your existing tools. Metaphor uses background webhooks to passively ingest events, extract nodes, and update your Core Data Model.
          </p>
        </div>
        <button onClick={loadIntegrations} className="p-2 text-muted hover:text-foreground bg-surface-1 border border-border-subtle rounded-lg">
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((item) => {
          const meta = PROVIDER_METADATA[item.provider] || {
            name: item.provider.toUpperCase(),
            category: "Data Source",
            description: "Passive integration data stream.",
            icon: <Box className="w-5 h-5" />
          };

          const isConnected = item.status === "connected" || item.events_processed > 0;
          const isSyncing = syncing[item.provider];

          return (
            <Card key={item.provider} className="flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${isConnected ? 'bg-surface-2 text-foreground' : 'bg-surface-1 text-muted border border-border-subtle'}`}>
                    {meta.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-foreground">{meta.name}</h3>
                    <span className="text-xs text-muted">{meta.category}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {isConnected ? (
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted">
                      <XCircle className="w-3.5 h-3.5" />
                      Ready
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-muted leading-relaxed mb-6 flex-grow">
                {meta.description}
              </p>
              
              <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-muted">
                <span>{item.events_processed} events processed</span>
                {['notion', 'gmail', 'gcal'].includes(item.provider) && (
                  <button 
                    onClick={() => handleSync(item.provider)}
                    disabled={isSyncing}
                    className="px-3 py-1 bg-surface-2 border border-border-subtle hover:border-primary rounded text-xs font-medium text-foreground disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSyncing && <div className="w-3 h-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />}
                    {isSyncing ? "Syncing..." : "Sync Now"}
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
