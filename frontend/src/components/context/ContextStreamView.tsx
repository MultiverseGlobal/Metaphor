// Layer 6: UI - Context Awareness Stream - ContextStreamView.tsx
'use client';

import React from 'react';
import { useMetaphor } from '../../context/MetaphorContext';
import { 
  Activity, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  User, 
  FolderGit2, 
  Zap, 
  CheckCircle2, 
  GitCommit, 
  CreditCard, 
  FileText, 
  Video, 
  Mail, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export const ContextStreamView: React.FC = () => {
  const { events, entities, inspectEntity, setActiveView, insights } = useMetaphor();

  // Living Snapshot Chain Items
  const snapshotSequence = [
    { label: 'You', detail: 'Active in Core Enterprise', color: 'text-white', bg: 'bg-[var(--accent-blue)]' },
    { label: 'Primary Context', detail: 'Project Metaphor Core Engine', color: 'text-[var(--accent-blue)]', bg: 'bg-[var(--accent-blue-glow)]' },
    { label: 'Upcoming', detail: 'Architecture Sync with David in 40m', color: 'text-[var(--accent-purple)]', bg: 'bg-purple-500/10' },
    { label: 'Recent Code', detail: 'Layer 0 Event Bus merged', color: 'text-[var(--accent-emerald)]', bg: 'bg-emerald-500/10' },
    { label: 'Communication', detail: 'David R. replied to Spec', color: 'text-[var(--accent-cyan)]', bg: 'bg-cyan-500/10' }
  ];

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'github': return GitCommit;
      case 'stripe': return CreditCard;
      case 'notion': return FileText;
      case 'calendar': return Video;
      case 'gmail': return Mail;
      default: return Zap;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      
      {/* 1. LIVING AWARENESS SEQUENCE BAR */}
      <div className="metaphor-glass p-4 border border-[var(--border-strong)] bg-[var(--bg-surface)]">
        <div className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-3.5 h-3.5 text-[var(--accent-blue)] animate-pulse" />
            <span>Living System Snapshot</span>
          </div>
          <span className="text-[var(--accent-emerald)] font-mono">Real-time Awareness</span>
        </div>

        {/* Fluid Awareness Sequence Chain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
          {snapshotSequence.map((item, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-xl border border-[var(--border-subtle)] ${item.bg} flex flex-col justify-between space-y-1 transition-all hover:scale-[1.02]`}
            >
              <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-tight">{item.label}</div>
              <div className={`text-xs font-semibold ${item.color} leading-tight line-clamp-2`}>{item.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. QUIET EMBEDDED AI CONTEXT OBSERVATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <div 
            key={insight.id} 
            className="metaphor-glass p-4 border border-[var(--border-accent)] bg-gradient-to-r from-[rgba(0,102,255,0.08)] to-[rgba(6,182,212,0.08)] rounded-xl flex items-start space-x-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-blue-glow)] flex items-center justify-center text-[var(--accent-cyan)] shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white">{insight.title}</h4>
                <span className="text-[10px] font-mono text-[var(--accent-emerald)]">{(insight.confidence * 100).toFixed(0)}% Confidence</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">{insight.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. RECENT CONTEXT STREAM */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[var(--accent-blue)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Ingested Context Stream</h3>
          </div>
          <button 
            onClick={() => setActiveView('timeline')}
            className="text-xs text-[var(--accent-blue)] hover:underline flex items-center"
          >
            View Full Timeline <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>

        <div className="space-y-2">
          {events.map((evt) => {
            const SourceIcon = getSourceIcon(evt.source);
            return (
              <div 
                key={evt.id} 
                onClick={() => inspectEntity(evt)}
                className="metaphor-glass p-4 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-xl flex items-start justify-between cursor-pointer transition-all hover:bg-[var(--bg-surface-hover)] group"
              >
                <div className="flex items-start space-x-3.5 pr-4">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-cyan)] shrink-0 mt-0.5 group-hover:border-[var(--accent-blue)] transition-colors">
                    <SourceIcon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-white group-hover:text-[var(--accent-blue)] transition-colors">{evt.title}</span>
                      <span className="metaphor-badge text-[9px]">{evt.source}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{evt.summary}</p>
                    
                    {evt.aiContextObservation && (
                      <div className="text-[11px] text-[var(--accent-cyan)] flex items-center space-x-1 pt-1">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span>{evt.aiContextObservation}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2 shrink-0">
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">{evt.timestamp}</span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ACTIVE KNOWLEDGE NODES MATRIX */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Living Knowledge Network Snapshot</h3>
          <button 
            onClick={() => setActiveView('knowledge')}
            className="text-xs text-[var(--accent-blue)] hover:underline flex items-center"
          >
            Explore Graph Network <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {entities.slice(0, 4).map(ent => (
            <div 
              key={ent.id}
              onClick={() => inspectEntity(ent)}
              className="metaphor-glass p-3.5 border border-[var(--border-subtle)] hover:border-[var(--border-accent)] rounded-xl cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="metaphor-badge text-[9px]">{ent.type}</span>
                <span className="text-[10px] font-mono text-[var(--accent-emerald)]">{ent.impactScore} Score</span>
              </div>
              <h4 className="text-xs font-semibold text-white group-hover:text-[var(--accent-blue)] transition-colors line-clamp-1">{ent.name}</h4>
              <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">{ent.description}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
