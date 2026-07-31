import React from "react";
import { Database, CheckCircle2, AlertCircle, Clock } from "lucide-react";

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
    <div className="w-full h-full bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-2 mb-4 sticky top-0">
        <Database className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Active Topology</span>
      </div>
      <div className="flex-1 space-y-2">
        {projects.map((project) => (
          <div key={project.id} className="p-3 bg-background/40 rounded-lg border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div>
              <p className="text-sm font-semibold text-foreground">{project.name}</p>
              <p className="text-[10px] font-mono text-muted-foreground">{project.id}</p>
            </div>
            <div className="flex items-center gap-1.5">
              {project.status === "Healthy" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {project.status === "Warning" && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
              {project.status === "Syncing" && <Clock className="w-3.5 h-3.5 text-blue-400" />}
              {project.status === "Offline" && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{project.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
