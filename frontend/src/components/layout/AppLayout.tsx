// Layer 6: UI - App Layout Shell - AppLayout.tsx
'use client';

import React from 'react';
import { useMetaphor, MetaphorView } from '../../context/MetaphorContext';
import { CommandPalette } from '../command/CommandPalette';
import { GlobalContextInspector } from '../inspector/GlobalContextInspector';
import { 
  Activity, 
  Clock, 
  Network, 
  Layers, 
  Plug, 
  Search, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck,
  User,
  Zap,
  Globe
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { 
    activeWorkspace, 
    setActiveWorkspace, 
    activeView, 
    setActiveView, 
    toggleCommandPalette,
    addSimulatedEvent
  } = useMetaphor();

  const workspaces = ['Core Enterprise', 'Personal Workspace', 'Research Lab', 'Client Alpha'];

  const navItems: { id: MetaphorView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'context', label: 'Context', icon: Activity },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'knowledge', label: 'Knowledge', icon: Network },
    { id: 'explore', label: 'Explore', icon: Layers },
    { id: 'connectors', label: 'Connectors', icon: Plug }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-root)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent-blue)] selection:text-white">
      
      {/* TOP MISSION CONTROL HEADER */}
      <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between">
        
        {/* Left Branding & Workspace Selector */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveView('context')}>
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-blue)] text-white flex items-center justify-center font-extrabold tracking-tighter text-base shadow-lg shadow-[var(--accent-blue-glow)]">
              M
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block leading-none">METAPHOR</span>
              <span className="text-[9px] font-mono text-[var(--text-muted)] tracking-widest uppercase">Context OS</span>
            </div>
          </div>

          {/* Workspace Switcher */}
          <div className="relative group">
            <button className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-white/3 hover:bg-white/10 text-xs font-medium text-[var(--text-secondary)] hover:text-white transition-colors">
              <Globe className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
              <span>{activeWorkspace}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>
            <div className="absolute top-full left-0 mt-1 w-48 metaphor-glass bg-[var(--bg-surface-solid)] border border-[var(--border-strong)] rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
              {workspaces.map(ws => (
                <button
                  key={ws}
                  onClick={() => setActiveWorkspace(ws)}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    activeWorkspace === ws ? 'text-[var(--accent-blue)] font-semibold bg-white/5' : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {ws}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Universal Command Palette Trigger */}
        <div className="flex-1 max-w-md mx-6">
          <button
            onClick={toggleCommandPalette}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-white/4 hover:bg-white/8 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-all shadow-inner group"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-[var(--accent-blue)] group-hover:scale-110 transition-transform" />
              <span>Type a command or search entities...</span>
            </div>
            <kbd className="metaphor-badge text-[9px] font-mono">⌘K</kbd>
          </button>
        </div>

        {/* Right System Health & Pulse Controls */}
        <div className="flex items-center space-x-4">
          
          {/* Real-time Event Simulator Trigger */}
          <button
            onClick={() => addSimulatedEvent('github')}
            className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-white/3 hover:bg-[var(--accent-blue-glow)] hover:border-[var(--accent-blue)] text-[11px] font-mono text-[var(--text-secondary)] hover:text-white transition-colors"
            title="Inject real-time living event into Layer 0 stream"
          >
            <Zap className="w-3 h-3 text-[var(--accent-amber)] animate-pulse" />
            <span>Simulate Stream</span>
          </button>

          {/* Living Ingestion Status */}
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[var(--text-secondary)] px-2.5 py-1 rounded-lg bg-white/3 border border-[var(--border-subtle)]">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-emerald)] animate-pulse" />
            <span className="hidden md:inline">SYSTEM ACTIVE</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-xs font-bold text-white shadow-md">
            K
          </div>
        </div>

      </header>

      {/* MAIN CONTAINER: SIDEBAR + CONTENT VIEW */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COMPACT SIDEBAR */}
        <aside className="w-16 md:w-52 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-md flex flex-col justify-between p-2 shrink-0">
          
          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="hidden md:block px-3 py-2 text-[10px] font-mono text-[var(--text-muted)] tracking-wider uppercase">
              Navigation Hub
            </div>

            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-[var(--accent-blue-glow)] text-[var(--accent-blue)] border border-[var(--border-accent)] font-semibold' 
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--accent-blue)]' : 'text-[var(--text-muted)]'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* System Footer Note */}
          <div className="hidden md:block p-3 metaphor-glass bg-white/2 border border-[var(--border-subtle)] rounded-xl text-[10px] text-[var(--text-muted)] space-y-1">
            <div className="flex items-center space-x-1 text-[var(--accent-cyan)] font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Living Nervous System</span>
            </div>
            <p className="leading-tight">Continuously indexing connected services.</p>
          </div>

        </aside>

        {/* CENTER VIEWPORT AREA */}
        <main className="flex-1 overflow-y-auto relative p-4 md:p-6">
          {children}
        </main>

      </div>

      {/* GLOBAL MODALS & INSPECTOR PANELS */}
      <CommandPalette />
      <GlobalContextInspector />

    </div>
  );
};
