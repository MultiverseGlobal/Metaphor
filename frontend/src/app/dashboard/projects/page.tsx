"use client";

import React, { useEffect, useState } from "react";
import { Folder, Plus, CheckCircle2, ChevronRight, ArrowRight } from "lucide-react";
import { fetchFromMetaphor } from "@/app/api";
import { useRouter } from "next/navigation";

type Project = {
  id?: string;
  title: string;
  name?: string;
  summary?: string;
  status?: string;
  created_at?: string;
  attachedAIs?: string[];
};

function AIBadge({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-2 border border-border-subtle text-foreground tracking-tight">
      {label}
    </span>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("metaphor_projects");
        if (local) {
          try {
            const parsed: Project[] = JSON.parse(local);
            setProjects(parsed);
          } catch (e) {}
        }
      }

      try {
        const res = await fetchFromMetaphor("/graph/nodes?type=project", undefined, "GET");
        if (res?.nodes && Array.isArray(res.nodes)) {
          const backendProjects: Project[] = res.nodes.map((n: any) => {
            const aiBound = n.summary?.startsWith("Bound to: ")
              ? n.summary.replace("Bound to: ", "").split(", ").filter(Boolean)
              : [];
            return {
              id: n.id,
              title: n.title,
              summary: n.summary,
              status: n.status,
              created_at: n.created_at,
              attachedAIs: aiBound.filter((a: string) => a !== "No AI tools yet"),
            };
          });
          if (backendProjects.length > 0) {
            setProjects(backendProjects);
          }
        }
      } catch (e) {
        console.warn("Could not fetch projects from backend:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadProjects();
  }, []);

  return (
    <div className="relative w-full min-h-full animate-in fade-in duration-200">
      <div className="relative z-10 w-full max-w-3xl mx-auto p-8 pb-16 flex flex-col">

        <div className="mb-12 border-b border-border-subtle/50 pb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Folder className="w-4 h-4 text-muted" />
              <h1 className="text-sm font-semibold text-muted uppercase tracking-widest">Projects</h1>
            </div>
            <button
              onClick={() => router.push("/onboarding")}
              className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border-subtle hover:border-border-strong"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Project
            </button>
          </div>
          <p className="text-2xl font-medium tracking-tight text-foreground leading-snug">
            Your bound projects.
          </p>
          <p className="text-muted text-sm mt-2 font-medium tracking-tight">
            Each project has its own context scope. AI tools bound to a project receive focused, relevant knowledge.
          </p>
        </div>

        {isLoading && projects.length === 0 ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 rounded-xl bg-surface-1 border border-border-subtle animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <div className="w-12 h-12 rounded-2xl bg-surface-1 border border-border-subtle flex items-center justify-center mb-6">
              <Folder className="w-5 h-5 text-muted" />
            </div>
            <h2 className="text-base font-semibold text-foreground tracking-tight mb-2">No projects yet</h2>
            <p className="text-sm text-muted max-w-xs leading-relaxed mb-8">
              Projects give your AI tools focused context. Create your first one to get started.
            </p>
            <button
              onClick={() => router.push("/onboarding")}
              className="flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-medium rounded-xl hover:opacity-90 transition-all"
            >
              Go to The Binding Phase <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project, idx) => (
              <div
                key={project.id || idx}
                className="group flex items-center justify-between p-5 rounded-xl border border-border-subtle hover:border-border-strong bg-surface-1 hover:bg-surface-2 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-background border border-border-subtle flex items-center justify-center shrink-0 mt-0.5">
                    <Folder className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-foreground tracking-tight">
                      {project.title || project.name}
                    </span>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {(project.attachedAIs && project.attachedAIs.length > 0) ? (
                        project.attachedAIs.map(ai => (
                          <AIBadge key={ai} label={ai} />
                        ))
                      ) : (
                        <span className="text-[11px] text-muted italic">No AI tools bound yet</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
                  <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}

            <div
              onClick={() => router.push("/onboarding")}
              className="flex items-center gap-4 p-5 rounded-xl border border-dashed border-border-subtle hover:border-border-strong text-muted hover:text-foreground transition-all duration-200 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-surface-1 border border-border-subtle flex items-center justify-center shrink-0 group-hover:bg-surface-2 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Add another project</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
