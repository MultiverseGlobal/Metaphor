"use client";

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { fetchFromMetaphor } from "../api";

// Dynamically import to prevent SSR canvas errors
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function GraphViewer() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const data = await fetchFromMetaphor("/graph");
        setGraphData({
          nodes: data.nodes || [],
          links: data.edges || []
        });
      } catch (e) {
        console.error("Failed to fetch graph data", e);
      }
    };
    fetchGraph();

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 opacity-[0.15] overflow-hidden pointer-events-none">
      {dimensions.width > 0 && graphData.nodes.length > 0 && (
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="name"
          nodeColor={(node: any) => {
            switch(node.type) {
              case 'Project': return '#3b82f6';
              case 'Concept': return '#8b5cf6';
              case 'Goal': return '#10b981';
              case 'Constraint': return '#ef4444';
              case 'Preference': return '#f59e0b';
              default: return '#9ca3af';
            }
          }}
          linkColor={() => 'rgba(255,255,255,0.2)'}
          backgroundColor="transparent"
          nodeRelSize={4}
          linkDirectionalArrowLength={2}
          linkDirectionalArrowRelPos={1}
          d3VelocityDecay={0.3}
        />
      )}
    </div>
  );
}
