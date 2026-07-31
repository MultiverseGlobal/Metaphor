import React from "react";
import { Database, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const projects = [
  { id: "PRJ-001", name: "Metaphor Core", status: "Healthy" },
  { id: "PRJ-002", name: "Atlas Portal", status: "Warning" },
  { id: "PRJ-003", name: "Knowledge Ingestion", status: "Healthy" },
  { id: "PRJ-004", name: "Neural Link", status: "Syncing" },
  { id: "PRJ-005", name: "Postgres + pgvector", status: "Offline" },
  { id: "PRJ-006", name: "Redis Cache", status: "Healthy" },
];

export default function DataTableWidget() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="sticky top-0 z-10">
        <Database className="w-4 h-4 text-primary" />
        <CardTitle>Active Topology</CardTitle>
      </CardHeader>
      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
        {projects.map((project) => {
          let variant: "success" | "warning" | "primary" | "danger" = "success";
          let Icon = CheckCircle2;
          
          if (project.status === "Warning") { variant = "warning"; Icon = AlertCircle; }
          if (project.status === "Syncing") { variant = "primary"; Icon = Clock; }
          if (project.status === "Offline") { variant = "danger"; Icon = AlertCircle; }

          return (
            <div key={project.id} className="p-3 bg-surface-2 rounded-lg border border-border-subtle flex items-center justify-between hover:border-border-strong transition-colors">
              <div>
                <p className="text-sm font-medium text-bright">{project.name}</p>
                <p className="text-[10px] font-mono text-muted mt-0.5">{project.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 text-${variant}`} />
                <Badge variant={variant} className="uppercase tracking-wider">{project.status}</Badge>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  );
}
