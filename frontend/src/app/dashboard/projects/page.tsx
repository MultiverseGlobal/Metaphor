"use client";

import React, { useEffect, useState } from "react";
import { Folder, Plus, ChevronRight, ChevronDown, Copy, Check, X, ExternalLink, Terminal, Zap } from "lucide-react";
import { ChatGPTIcon, ClaudeIcon, CursorIcon, GeminiIcon, AntigravityIcon } from "@/components/ui/BrandIcons";
import { fetchFromMetaphor } from "@/app/api";

type Project = {
  id?: string;
  title: string;
  name?: string;
  summary?: string;
  status?: string;
  created_at?: string;
  attachedAIs?: string[];
};

const AI_ICON_MAP: Record<string, React.ReactNode> = {
  ChatGPT:     <ChatGPTIcon className="w-4 h-4" />,
  Claude:      <ClaudeIcon  className="w-4 h-4" />,
  Cursor:      <CursorIcon  className="w-4 h-4" />,
  Gemini:      <GeminiIcon  className="w-4 h-4" />,
  Antigravity: <AntigravityIcon className="w-4 h-4" />,
};

const AI_LAUNCH_URL: Record<string, string> = {
  ChatGPT:     "https://chatgpt.com/",
  Claude:      "https://claude.ai/",
  Cursor:      "cursor://",
  Gemini:      "https://gemini.google.com/",
  Antigravity: "https://antigravity.dev/",
};

const ALL_AI_TOOLS = ["ChatGPT", "Claude", "Cursor", "Gemini", "Antigravity"];

function buildActivationPrompt(projectName: string, projectId: string): string {
  return `# Metaphor Session — ${projectName}

You are starting a Metaphor-scoped session for project: **${projectName}**

## On session start — always run:
\`\`\`
get_active_session_context(project_id="${projectId}", limit=5)
\`\`\`
This loads the latest context drops from other AI tools (Claude, Cursor, ChatGPT) working on this project so you start with shared awareness.

## When finishing a significant task — always run:
\`\`\`
sync_chat_drop(
  source_model="<your model name>",
  project_id="${projectId}",
  summary="<what you did, decisions made, files changed>",
  session_title="${projectName} — <brief task description>"
)
\`\`\`
This saves your progress into Metaphor so other tools can pick up exactly where you left off.

## Project context:
\`\`\`
search_context(query="${projectName}")
\`\`\`
Run this to load project-specific documentation, decisions, and architecture into your context window.

---
Project ID: ${projectId}
Powered by Metaphor OS`;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedAI, setSelectedAI] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  // Inline project creation state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAIs, setNewAIs] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { loadProjects(); }, []);

  async function loadProjects() {
    setIsLoading(true);
    // Load from localStorage first for instant render
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("metaphor_projects");
      if (local) {
        try { setProjects(JSON.parse(local)); } catch (e) {}
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
        if (backendProjects.length > 0) setProjects(backendProjects);
      }
    } catch (e) {
      console.warn("Could not fetch projects from backend:", e);
    } finally {
      setIsLoading(false);
    }
  }

  const toggleExpand = (id: string) =>
    setExpandedId(prev => (prev === id ? null : id));

  const handleCopy = async (projectId: string, projectName: string) => {
    const prompt = buildActivationPrompt(projectName, projectId);
    await navigator.clipboard.writeText(prompt);
    setCopied(prev => ({ ...prev, [projectId]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [projectId]: false })), 2000);
  };

  const handleLaunch = (projectId: string, projectName: string, ai: string) => {
    handleCopy(projectId, projectName);
    const url = AI_LAUNCH_URL[ai] || "https://claude.ai/";
    if (url.startsWith("cursor://")) {
      // Cursor doesn't have a reliable deep-link; open the docs instead
      window.open("https://cursor.com/", "_blank");
    } else {
      window.open(url, "_blank");
    }
  };

  const handleCreateProject = async () => {
    const name = newName.trim();
    if (!name) return;
    setIsSaving(true);
    try {
      const res = await fetchFromMetaphor("/graph/nodes", {
        type: "project",
        title: name,
        summary: `Bound to: ${newAIs.join(", ") || "No AI tools yet"}`,
        content: "",
        metadata: { attached_ais: newAIs }
      }, "POST");
      const newProject: Project = {
        id: res?.id,
        title: name,
        attachedAIs: newAIs
      };
      setProjects(prev => {
        const updated = [...prev, newProject];
        if (typeof window !== "undefined") {
          localStorage.setItem("metaphor_projects", JSON.stringify(updated));
        }
        return updated;
      });
      setNewName("");
      setNewAIs([]);
      setShowCreate(false);
      // Expand the newly created project immediately
      if (res?.id) setExpandedId(res.id);
    } catch (e) {
      console.error("Failed to create project:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNewAI = (ai: string) =>
    setNewAIs(prev => prev.includes(ai) ? prev.filter(a => a !== ai) : [...prev, ai]);

  return (
    <div className="relative w-full min-h-full animate-in fade-in duration-200">
      <div className="relative z-10 w-full max-w-3xl mx-auto p-8 pb-16 flex flex-col">

        {/* Header */}
        <div className="mb-12 border-b border-border-subtle/50 pb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Folder className="w-4 h-4 text-muted" />
              <h1 className="text-sm font-semibold text-muted uppercase tracking-widest">Projects</h1>
            </div>
            <button
              onClick={() => { setShowCreate(v => !v); setNewName(""); setNewAIs([]); }}
              className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border-subtle hover:border-border-strong"
            >
              {showCreate ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showCreate ? "Cancel" : "New Project"}
            </button>
          </div>
          <p className="text-2xl font-medium tracking-tight text-foreground leading-snug">
            Your bound projects.
          </p>
          <p className="text-muted text-sm mt-2 font-medium tracking-tight">
            Each project is a context scope. Launch a session to give Claude or Cursor a shared activation prompt.
          </p>
        </div>

        {/* Inline Create Form */}
        {showCreate && (
          <div className="mb-6 p-6 bg-surface-1 border border-border-subtle rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4">New Project</p>

            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && newName.trim()) handleCreateProject(); }}
              placeholder="e.g. Atlas Platform, Metaphor OS, Client Launch…"
              className="w-full bg-transparent text-foreground text-base font-medium placeholder:text-muted focus:outline-none border-b border-border-strong pb-3 mb-6 focus:border-foreground transition-colors"
            />

            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Bind AI Tools</p>
            <div className="flex gap-2 mb-6">
              {ALL_AI_TOOLS.map(ai => {
                const active = newAIs.includes(ai);
                return (
                  <button
                    key={ai}
                    title={ai}
                    onClick={() => toggleNewAI(ai)}
                    className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-150 ${
                      active
                        ? "bg-foreground text-background border-foreground"
                        : "bg-surface-2 text-muted border-border-subtle hover:border-border-strong hover:text-foreground"
                    }`}
                  >
                    {AI_ICON_MAP[ai]}
                    {active && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-foreground border-2 border-background flex items-center justify-center">
                        <Check className="w-1.5 h-1.5 text-background stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleCreateProject}
              disabled={!newName.trim() || isSaving}
              className="w-full py-3 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {isSaving
                ? <><div className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" /> Creating…</>
                : <>Create Project <ChevronRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        )}

        {/* Project List */}
        {isLoading && projects.length === 0 ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 rounded-xl bg-surface-1 border border-border-subtle animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 && !showCreate ? (
          <div className="flex flex-col items-center text-center py-16">
            <div className="w-12 h-12 rounded-2xl bg-surface-1 border border-border-subtle flex items-center justify-center mb-6">
              <Folder className="w-5 h-5 text-muted" />
            </div>
            <h2 className="text-base font-semibold text-foreground tracking-tight mb-2">No projects yet</h2>
            <p className="text-sm text-muted max-w-xs leading-relaxed mb-8">
              Projects give your AI tools a shared context scope. Create your first one to launch a session.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-medium rounded-xl hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" /> Create your first project
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project, idx) => {
              const id = project.id || String(idx);
              const title = project.title || project.name || "Untitled";
              const ais = project.attachedAIs || [];
              const isOpen = expandedId === id;
              const launchAI = selectedAI[id] || ais[0] || "Claude";
              const hasCopied = !!copied[id];

              return (
                <div key={id} className="rounded-xl border border-border-subtle overflow-hidden transition-all duration-200">

                  {/* Row header */}
                  <button
                    onClick={() => toggleExpand(id)}
                    className="w-full flex items-center justify-between p-5 bg-surface-1 hover:bg-surface-2 transition-colors text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg bg-background border border-border-subtle flex items-center justify-center shrink-0">
                        <Folder className="w-4 h-4 text-foreground" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-semibold text-foreground tracking-tight">{title}</span>
                        <div className="flex gap-1.5 items-center">
                          {ais.length > 0 ? ais.map(ai => (
                            <span
                              key={ai}
                              title={ai}
                              className="w-6 h-6 rounded-full bg-surface-2 border border-border-subtle flex items-center justify-center text-foreground"
                            >
                              {AI_ICON_MAP[ai] ?? <span className="text-[9px] font-bold">{ai[0]}</span>}
                            </span>
                          )) : (
                            <span className="text-[11px] text-muted italic">No AI tools bound</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isOpen
                      ? <ChevronDown className="w-4 h-4 text-muted shrink-0" />
                      : <ChevronRight className="w-4 h-4 text-muted shrink-0" />
                    }
                  </button>

                  {/* Expanded: Launch Session panel */}
                  {isOpen && (
                    <div className="border-t border-border-subtle bg-background p-6 animate-in fade-in slide-in-from-top-1 duration-150">

                      {/* Project ID pill */}
                      {project.id && (
                        <div className="mb-6 flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted bg-surface-1 border border-border-subtle px-2 py-1 rounded-md">
                            ID: {project.id}
                          </span>
                          <span className="text-[10px] text-muted">— used in activation prompt below</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-4">
                        <Terminal className="w-3.5 h-3.5 text-muted" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                          Launch Session
                        </p>
                      </div>
                      <p className="text-sm text-muted leading-relaxed mb-6">
                        Copy this activation prompt and paste it into your AI tool at the start of a session.
                        It tells the AI to load this project's shared context and sync back when it finishes.
                      </p>

                      {/* Activation Prompt Preview */}
                      {project.id ? (
                        <>
                          <div className="mb-4 bg-surface-1 border border-border-subtle rounded-xl p-4 font-mono text-[11px] text-muted leading-relaxed max-h-52 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                            {buildActivationPrompt(title, project.id)}
                          </div>

                          {/* AI selector + action row */}
                          <div className="flex items-center gap-3 flex-wrap">
                            {/* AI picker */}
                            <div className="flex gap-1.5">
                              {(ais.length > 0 ? ais : ALL_AI_TOOLS.slice(0, 3)).map(ai => (
                                <button
                                  key={ai}
                                  title={ai}
                                  onClick={() => setSelectedAI(prev => ({ ...prev, [id]: ai }))}
                                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all text-foreground ${
                                    launchAI === ai
                                      ? "bg-foreground text-background border-foreground"
                                      : "bg-surface-1 border-border-subtle hover:border-border-strong"
                                  }`}
                                >
                                  {AI_ICON_MAP[ai] ?? <span className="text-[9px] font-bold">{ai[0]}</span>}
                                </button>
                              ))}
                            </div>

                            {/* Copy prompt */}
                            <button
                              onClick={() => handleCopy(project.id!, title)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border-subtle bg-surface-1 hover:border-border-strong text-xs font-medium text-foreground transition-all"
                            >
                              {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              {hasCopied ? "Copied!" : "Copy Prompt"}
                            </button>

                            {/* Launch in AI */}
                            <button
                              onClick={() => handleLaunch(project.id!, title, launchAI)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-all"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              Launch in {launchAI}
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-muted italic">
                          This project was created locally and hasn't been saved to the backend yet.
                          Re-create it using the form above to get a project ID.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add another project inline */}
            {!showCreate && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-4 p-5 w-full rounded-xl border border-dashed border-border-subtle hover:border-border-strong text-muted hover:text-foreground transition-all duration-200 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-surface-1 border border-border-subtle flex items-center justify-center shrink-0 group-hover:bg-surface-2 transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Add another project</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
