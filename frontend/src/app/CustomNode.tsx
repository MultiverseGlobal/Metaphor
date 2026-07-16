"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { 
  User, 
  Calendar, 
  Lightbulb, 
  CheckSquare, 
  GitCommit, 
  Folder 
} from "lucide-react";

interface NodeData {
  name: string;
  type: string;
  metadata?: Record<str, any>;
}

const iconMap: Record<str, React.ComponentType<any>> = {
  person: User,
  meeting: Calendar,
  idea: Lightbulb,
  decision: CheckSquare,
  commit: GitCommit,
  project: Folder
};

const CustomNodeComponent = ({ data }: { data: NodeData }) => {
  const typeLower = (data.type || "project").toLowerCase();
  const IconComponent = iconMap[typeLower] || Folder;
  
  // Choose color theme based on node type
  const borderVar = `var(--color-${typeLower}, var(--accent-primary))`;
  const bgVar = `rgba(13, 13, 23, 0.85)`;

  return (
    <div 
      className="glass-panel px-4 py-3 rounded-lg flex items-center gap-3 border shadow-lg hover:scale-105 transition-all min-w-[200px]"
      style={{
        borderColor: borderVar,
        background: bgVar,
      }}
    >
      {/* Node handles for connections */}
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ background: borderVar, borderRadius: "50%", width: "8px", height: "8px" }} 
      />
      
      {/* Icon Container */}
      <div 
        className="p-2 rounded-md flex items-center justify-center text-white"
        style={{
          backgroundColor: borderVar + "25", // Apply transparent alpha
          color: borderVar
        }}
      >
        <IconComponent size={18} />
      </div>

      {/* Info Container */}
      <div className="flex flex-col text-left">
        <span className="text-xs uppercase tracking-wider opacity-60 font-semibold" style={{ color: borderVar }}>
          {data.type}
        </span>
        <span className="text-sm font-semibold text-gray-100 max-w-[160px] truncate">
          {data.name}
        </span>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ background: borderVar, borderRadius: "50%", width: "8px", height: "8px" }} 
      />
    </div>
  );
};

export const CustomNode = memo(CustomNodeComponent);
