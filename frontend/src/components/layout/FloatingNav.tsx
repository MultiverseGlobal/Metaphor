import React from "react";
import { useMetaphor, MetaphorView } from "../../context/MetaphorContext";
import { EcosystemSwitcher } from "../ui/EcosystemSwitcher";
import { AtlasWaypointLogo } from "./AppLayout";
import {
  Activity,
  Clock,
  Network,
  Layers,
  Plug,
  Search,
  ChevronDown,
  RefreshCw,
  Globe,
  ShieldCheck,
  Sun,
  Moon
} from "lucide-react";

interface FloatingNavProps {
  toggleCommandPalette: () => void;
  activeWorkspace: string;
  setActiveWorkspace: (workspace: string) => void;
  activeView: MetaphorView;
  setActiveView: (view: MetaphorView) => void;
}

export function FloatingNav({
  toggleCommandPalette,
  activeWorkspace,
  setActiveWorkspace,
  activeView,
  setActiveView
}: FloatingNavProps) {
  const workspaces = ['Core Enterprise', 'Personal Workspace', 'Research Lab', 'Client Alpha'];
  
  // Try to toggle theme
  const toggleTheme = () => {
    if (typeof document !== 'undefined') {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('metaphor_theme', nextTheme);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-12 z-50 bg-background/85 backdrop-blur-xl border-b border-border/50 select-none">
      <div className="h-full w-full px-4 flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
        
        {/* ── Left: Brand & Active Workspace Context ──────────────────── */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => setActiveView('context')}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer shrink-0"
            title="Return to Context Stream"
          >
            <AtlasWaypointLogo size={20} />
            <div className="text-left hidden sm:block">
              <span className="font-serif font-bold text-xs tracking-tight text-foreground block leading-none group-hover:text-primary transition-colors">
                METAPHOR
              </span>
              <span className="block text-[8px] uppercase tracking-wider text-muted-foreground mt-0.5">Context OS</span>
            </div>
          </button>

          {/* Workspace Switcher */}
          <div className="relative group hidden md:block">
            <button className="flex items-center space-x-1.5 px-2 py-1 rounded-md border border-border/50 bg-muted/20 hover:bg-muted/50 text-xs font-medium text-foreground transition-all cursor-pointer">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>{activeWorkspace}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-48 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl py-1 hidden group-hover:block z-50">
              {workspaces.map(ws => (
                <button
                  key={ws}
                  onClick={() => setActiveWorkspace(ws)}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                    activeWorkspace === ws ? 'text-primary font-semibold bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {ws}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Center: Main Navigation Switcher ──────────────────────── */}
        <nav className="flex items-center p-0.5 rounded-xl bg-muted/40 border border-border/40 backdrop-blur-md shrink-0">
          
          <button
            onClick={() => setActiveView('context')}
            title="Context Stream"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
              activeView === 'context'
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:inline">Context</span>
          </button>

          <button
            onClick={() => setActiveView('timeline')}
            title="Progression Log"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
              activeView === 'timeline'
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:inline">Timeline</span>
          </button>

          <button
            onClick={() => setActiveView('knowledge')}
            title="Ontology Graph"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
              activeView === 'knowledge'
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Network className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:inline">Graph</span>
          </button>

          <button
            onClick={() => setActiveView('explore')}
            title="Layer Explorer"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
              activeView === 'explore'
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:inline">Explore</span>
          </button>

          <button
            onClick={() => setActiveView('connectors')}
            title="Connectors"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
              activeView === 'connectors'
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Plug className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:inline">Connectors</span>
          </button>

        </nav>

        {/* ── Right: Telemetry, Shortcuts & Ecosystem ────────────────── */}
        <div className="flex items-center gap-2 shrink-0">
          
          <button
            onClick={async () => {
              try {
                const { fetchFromMetaphor } = await import('@/app/api');
                await fetchFromMetaphor('/sync/run-pull', { provider: 'github' }, 'POST');
                alert("Triggered manual sync pull from GitHub.");
              } catch (e) {
                alert("Sync failed: " + e);
              }
            }}
            className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer text-[11px]"
            title="Trigger manual sync pull"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>

          {/* System Active Telemetry */}
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border border-border/50 bg-muted/20 cursor-help"
            title="Living Context OS Active"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse" />
            <span className="text-muted-foreground hidden lg:inline font-sans font-medium">
              System Active
            </span>
          </div>

          {/* Command Palette Launcher */}
          <button
            onClick={toggleCommandPalette}
            title="Open Command Palette (⌘K)"
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/40 text-[11px] font-mono cursor-pointer transition-colors"
          >
            <Search className="w-3 h-3" />
            <span>⌘K</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle Theme"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <Sun className="w-3.5 h-3.5 dark:hidden" />
            <Moon className="w-3.5 h-3.5 hidden dark:block" />
          </button>

          <div className="w-px h-4 bg-border/50 mx-0.5 shrink-0" />

          {/* Ecosystem Switcher */}
          <div className="flex items-center">
            <EcosystemSwitcher />
          </div>
        </div>

      </div>
    </header>
  );
}
