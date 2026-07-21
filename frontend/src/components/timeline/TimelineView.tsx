// Layer 6: UI - Living Reality Timeline - TimelineView.tsx
'use client';

import React, { useState } from 'react';
import { useMetaphor } from '../../context/MetaphorContext';
import { SourceSystem } from '../../lib/events/EventTypes';
import { 
  Clock, 
  Filter, 
  GitCommit, 
  CreditCard, 
  FileText, 
  Video, 
  Mail, 
  Zap, 
  User, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const TimelineView: React.FC = () => {
  const { events, inspectEntity, entities } = useMetaphor();
  const [selectedSource, setSelectedSource] = useState<string>('all');

  const sources = ['all', 'github', 'notion', 'stripe', 'calendar', 'gmail'];

  const filteredEvents = selectedSource === 'all' 
    ? events 
    : events.filter(e => e.source === selectedSource);

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
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[var(--accent-blue)]" />
            <h2 className="text-lg font-bold text-white tracking-tight">Living Reality Timeline</h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            How system reality, decisions, code, and revenue evolved chronologically over time.
          </p>
        </div>

        {/* Source System Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {sources.map(src => (
            <button
              key={src}
              onClick={() => setSelectedSource(src)}
              className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition-all ${
                selectedSource === src
                  ? 'bg-[var(--accent-blue)] text-white font-medium shadow-md shadow-[var(--accent-blue-glow)]'
                  : 'bg-white/4 text-[var(--text-muted)] hover:text-white hover:bg-white/10'
              }`}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Vertical Timeline Flow */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[var(--accent-blue)] before:via-[var(--accent-purple)] before:to-transparent">
        {filteredEvents.map((evt, idx) => {
          const SourceIcon = getSourceIcon(evt.source);
          
          return (
            <div key={evt.id} className="relative group">
              
              {/* Timeline Dot Indicator */}
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-[var(--bg-root)] border-2 border-[var(--accent-blue)] group-hover:border-[var(--accent-cyan)] group-hover:scale-125 transition-all flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]" />
              </div>

              {/* Event Container Card */}
              <div 
                onClick={() => inspectEntity(evt)}
                className="metaphor-glass p-4 border border-[var(--border-subtle)] hover:border-[var(--border-accent)] rounded-xl cursor-pointer transition-all hover:bg-[var(--bg-surface-hover)] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-md bg-white/5 text-[var(--accent-cyan)]">
                      <SourceIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-[var(--accent-blue)] transition-colors">
                      {evt.title}
                    </span>
                    <span className="metaphor-badge text-[9px]">{evt.source}</span>
                  </div>

                  <span className="text-[11px] font-mono text-[var(--text-muted)]">{evt.timestamp}</span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed pl-8">
                  {evt.summary}
                </p>

                {evt.authorName && (
                  <div className="flex items-center space-x-2 pl-8 pt-1 text-[11px] text-[var(--text-muted)] font-mono">
                    <User className="w-3 h-3 text-[var(--accent-blue)]" />
                    <span>Actor: {evt.authorName}</span>
                  </div>
                )}

                {evt.aiContextObservation && (
                  <div className="ml-8 p-2 rounded-lg bg-[var(--accent-blue-glow)] border border-[var(--border-accent)] text-[11px] text-[var(--accent-cyan)] flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>{evt.aiContextObservation}</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
