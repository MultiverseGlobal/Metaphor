// Layer 6: UI - Knowledge-First Connectors View - ConnectorsView.tsx
'use client';

import React from 'react';
import { useMetaphor } from '../../context/MetaphorContext';
import { 
  Plug, 
  CheckCircle2, 
  RefreshCw, 
  Activity, 
  GitCommit, 
  CreditCard, 
  FileText, 
  Video, 
  Mail,
  Zap,
  ShieldCheck,
  Radio
} from 'lucide-react';

export const ConnectorsView: React.FC = () => {
  const { connectors } = useMetaphor();

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
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center space-x-2">
            <Plug className="w-5 h-5 text-[var(--accent-blue)]" />
            <h2 className="text-lg font-bold text-white tracking-tight">Ingestion & Knowledge Connectors</h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Metaphor continuously ingests raw events and transforms them into structured ontology & knowledge nodes.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-[var(--accent-emerald)] bg-white/3 border border-[var(--border-subtle)] px-3 py-1.5 rounded-lg">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Ingestion Engine Operational</span>
        </div>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map(conn => {
          const SourceIcon = getSourceIcon(conn.source);

          return (
            <div 
              key={conn.id}
              className="metaphor-glass p-5 border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-xl space-y-4 transition-all bg-[var(--bg-surface)]"
            >
              {/* Connector Top Bar */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-cyan)] shrink-0">
                    <SourceIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{conn.name}</h3>
                    <div className="flex items-center space-x-2 text-[11px] text-[var(--text-muted)] font-mono">
                      <span>Last sync: {conn.lastSync}</span>
                      <span>•</span>
                      <span className="text-[var(--accent-emerald)] flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Active
                      </span>
                    </div>
                  </div>
                </div>

                <span className="metaphor-badge text-[10px] text-[var(--accent-emerald)] border-emerald-500/30">
                  {conn.healthScore}% Health
                </span>
              </div>

              {/* KNOWLEDGE PRODUCED HIGHLIGHTS (PRIMARY FEATURE) */}
              <div className="p-3 rounded-lg bg-black/30 border border-[var(--border-subtle)] space-y-2">
                <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
                  <span>Knowledge Produced Today</span>
                  <span className="text-[var(--accent-cyan)]">{conn.eventsProcessedToday} Events Ingested</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {conn.knowledgeProduced.map((kp, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-1.5 rounded bg-white/3">
                      <span className="text-[var(--text-secondary)]">{kp.label}</span>
                      <span className="font-mono font-bold text-[var(--accent-blue)]">{kp.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata Footer */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] pt-1">
                <span>Mode: {conn.pollingFrequency}</span>
                <div className="flex items-center space-x-2">
                  <button className="text-[var(--text-secondary)] hover:text-white transition-colors">View Ingestion Logs</button>
                  <span>•</span>
                  <button className="text-[var(--accent-blue)] hover:underline flex items-center">
                    <RefreshCw className="w-3 h-3 mr-1" /> Re-sync
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
