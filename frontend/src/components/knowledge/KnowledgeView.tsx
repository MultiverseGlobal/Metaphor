// Layer 6: UI - Living Knowledge Graph View - KnowledgeView.tsx
'use client';

import React, { useCallback, useMemo } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  Node, 
  Edge,
  MarkerType,
  BackgroundVariant,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMetaphor, MetaphorEntity } from '../../context/MetaphorContext';
import { METAPHOR_ONTOLOGY } from '../../lib/ontology/OntologySchema';
import { Network, Sparkles, Filter, Layers } from 'lucide-react';

// Custom Ontology Node Component Renderer with ReactFlow Handles
const OntologyNodeRenderer = ({ data }: { data: { entity: MetaphorEntity } }) => {
  const { inspectEntity } = useMetaphor();
  const entity = data.entity;
  const ontologyDef = METAPHOR_ONTOLOGY[entity.type] || METAPHOR_ONTOLOGY['Project'];

  return (
    <div 
      onClick={() => inspectEntity(entity)}
      className="metaphor-glass p-3 min-w-[170px] border border-[var(--border-strong)] hover:border-[var(--accent-blue)] rounded-xl cursor-pointer shadow-lg transition-all hover:scale-105 group bg-[var(--bg-surface-solid)] relative"
      style={{ borderLeft: `4px solid ${ontologyDef.color}` }}
    >
      <Handle type="target" position={Position.Top} className="!bg-[var(--accent-blue)] !w-2 !h-2 border-0" />
      <div className="flex items-center justify-between mb-1">
        <span className="metaphor-badge text-[8px]" style={{ color: ontologyDef.color }}>
          {entity.type}
        </span>
        <span className="text-[9px] font-mono text-[var(--accent-emerald)]">{entity.impactScore || 90}</span>
      </div>
      <div className="text-xs font-bold text-white group-hover:text-[var(--accent-blue)] transition-colors line-clamp-1">
        {entity.name}
      </div>
      <div className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
        {entity.ownerName || 'System'}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-[var(--accent-blue)] !w-2 !h-2 border-0" />
    </div>
  );
};

export const KnowledgeView: React.FC = () => {
  const { entities, inspectEntity } = useMetaphor();

  const nodeTypes = useMemo(() => ({ ontologyNode: OntologyNodeRenderer }), []);

  // Map Metaphor Entities to ReactFlow Nodes with force grid layout coordinates
  const initialNodes: Node[] = useMemo(() => {
    const layoutCoords = [
      { x: 250, y: 150 }, // Core Engine
      { x: 50, y: 80 },   // David (Person)
      { x: 480, y: 120 }, // Decision Auth
      { x: 220, y: 340 }, // Commit 01
      { x: 550, y: 320 }, // Spec Doc
      { x: 50, y: 300 },  // Meeting 01
      { x: 400, y: -40 }, // Task Auth
      { x: 720, y: 200 }  // Stripe Cust
    ];

    return entities.map((ent, idx) => ({
      id: ent.id,
      type: 'ontologyNode',
      position: layoutCoords[idx % layoutCoords.length],
      data: { entity: ent }
    }));
  }, [entities]);

  // Generate Directed Edges based on Entity Connection References
  const initialEdges: Edge[] = useMemo(() => {
    const edgesList: Edge[] = [];
    entities.forEach(ent => {
      ent.connectedEntityIds.forEach(targetId => {
        edgesList.push({
          id: `e_${ent.id}_${targetId}`,
          source: ent.id,
          target: targetId,
          animated: true,
          style: { stroke: '#0066ff', strokeWidth: 1.5, opacity: 0.7 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#0066ff'
          }
        });
      });
    });
    return edgesList;
  }, [entities]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-3 animate-fade-in">
      
      {/* Header bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 text-[var(--accent-blue)]" />
          <div>
            <h2 className="text-base font-bold text-white leading-none">Knowledge Graph Network</h2>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              {entities.length} Ontology Nodes • {edges.length} Directed Relationships
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-[var(--accent-cyan)] font-mono flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Click any node for Context Inspector
          </span>
        </div>
      </div>

      {/* Interactive Canvas Container */}
      <div className="flex-1 metaphor-glass border border-[var(--border-strong)] rounded-2xl overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#0066ff" gap={24} size={1} variant={BackgroundVariant.Dots} />
          <Controls />
        </ReactFlow>
      </div>

    </div>
  );
};
