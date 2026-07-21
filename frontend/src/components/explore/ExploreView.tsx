// Layer 6: UI - Object-First Entity Matrix - ExploreView.tsx
'use client';

import React, { useState } from 'react';
import { useMetaphor } from '../../context/MetaphorContext';
import { METAPHOR_ONTOLOGY, EntityType } from '../../lib/ontology/OntologySchema';
import { 
  Layers, 
  Search, 
  User, 
  FolderGit2, 
  FileText, 
  Compass, 
  CheckSquare, 
  Video, 
  Zap, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const ExploreView: React.FC = () => {
  const { entities, inspectEntity } = useMetaphor();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const entityTypes: (string | EntityType)[] = ['all', 'Project', 'Person', 'Decision', 'Commit', 'Document', 'Meeting', 'Task'];

  const filteredEntities = entities.filter(ent => {
    const matchesType = selectedType === 'all' || ent.type === selectedType;
    const matchesSearch = ent.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          ent.description?.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[var(--accent-blue)]" />
            <h2 className="text-lg font-bold text-white tracking-tight">Object Explorer</h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Object-first organization. Everything is a connected entity with ontology properties.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Filter objects..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-white/4 text-xs text-white placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-blue)] w-48"
            />
          </div>
        </div>
      </div>

      {/* Entity Type Filter Badges */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {entityTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${
              selectedType === type
                ? 'bg-[var(--accent-blue)] text-white font-medium shadow-md shadow-[var(--accent-blue-glow)]'
                : 'bg-white/4 text-[var(--text-muted)] hover:text-white hover:bg-white/10'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Object Matrix Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntities.map(ent => {
          const ontologyDef = METAPHOR_ONTOLOGY[ent.type] || METAPHOR_ONTOLOGY['Project'];
          
          return (
            <div
              key={ent.id}
              onClick={() => inspectEntity(ent)}
              className="metaphor-glass p-4 border border-[var(--border-subtle)] hover:border-[var(--border-accent)] rounded-xl cursor-pointer transition-all hover:bg-[var(--bg-surface-hover)] space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="metaphor-badge text-[9px]" style={{ color: ontologyDef.color }}>
                  {ent.type}
                </span>
                <span className="text-[10px] font-mono text-[var(--accent-emerald)]">
                  {ent.impactScore} Centrality
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-[var(--accent-blue)] transition-colors line-clamp-1">
                  {ent.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1">
                  {ent.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span className="font-mono">{ent.ownerName || 'System'}</span>
                <span className="flex items-center text-[var(--accent-cyan)] font-mono">
                  {ent.connectedEntityIds.length} Connected Links <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
