"use client";

import React from "react";
import { GitBranch as Github, FileText, Calendar, Box, Database, HardDrive, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function IntegrationsPage() {
  const integrations = [
    {
      name: "GitHub",
      category: "Code & Projects",
      status: "connected",
      lastSync: "10 mins ago",
      icon: <Github className="w-5 h-5" />,
      description: "Syncs commits, issues, and PRs as Operations Nodes."
    },
    {
      name: "Notion",
      category: "Knowledge Base",
      status: "connected",
      lastSync: "1 hour ago",
      icon: <FileText className="w-5 h-5" />,
      description: "Extracts decisions, constraints, and project scopes."
    },
    {
      name: "Google Drive",
      category: "Documents",
      status: "disconnected",
      lastSync: "Never",
      icon: <HardDrive className="w-5 h-5" />,
      description: "Indexes PDFs, Docs, and unstructured data chunks."
    },
    {
      name: "Linear",
      category: "Operations",
      status: "disconnected",
      lastSync: "Never",
      icon: <Box className="w-5 h-5" />,
      description: "Maps task progression to active goals."
    },
    {
      name: "Google Calendar",
      category: "Timeline",
      status: "connected",
      lastSync: "2 mins ago",
      icon: <Calendar className="w-5 h-5" />,
      description: "Builds the temporal graph and participant nodes."
    }
  ];

  return (
    <div className="max-w-4xl animate-in">
      <header className="mb-12">
        <h1 className="text-2xl text-foreground font-medium mb-2">Integrations</h1>
        <p className="text-muted text-sm leading-relaxed max-w-xl">
          Connect your existing tools. Metaphor uses background webhooks to passively ingest events, extract nodes, and update your Core Data Model.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration, idx) => (
          <Card key={idx} className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${integration.status === 'connected' ? 'bg-surface-2 text-foreground' : 'bg-surface-1 text-muted border border-subtle'}`}>
                  {integration.icon}
                </div>
                <div>
                  <h3 className="text-base font-medium text-foreground">{integration.name}</h3>
                  <span className="text-xs text-muted">{integration.category}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs font-medium">
                {integration.status === "connected" ? (
                  <span className="flex items-center gap-1 text-green-500/80">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted">
                    <XCircle className="w-3.5 h-3.5" />
                    Connect
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-muted leading-relaxed mb-6 flex-grow">
              {integration.description}
            </p>
            
            {integration.status === "connected" && (
              <div className="pt-4 border-t border-subtle text-xs text-muted">
                Last webhhook received: {integration.lastSync}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
