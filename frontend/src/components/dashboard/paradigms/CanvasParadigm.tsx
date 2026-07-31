import React, { useMemo } from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import TerminalWidget from "@/components/dashboard/widgets/TerminalWidget";
import KPIWidget from "@/components/dashboard/widgets/KPIWidget";
import DataTableWidget from "@/components/dashboard/widgets/DataTableWidget";

const initialNodes = [
  { id: "1", position: { x: 100, y: 100 }, data: { label: "KPI" }, type: "kpi" },
  { id: "2", position: { x: 600, y: 100 }, data: { label: "Terminal" }, type: "terminal" },
  { id: "3", position: { x: 100, y: 500 }, data: { label: "Data" }, type: "data" },
];

export default function CanvasParadigm() {
  const nodeTypes = useMemo(() => ({
    kpi: () => <div className="w-[400px] h-[300px]"><KPIWidget /></div>,
    terminal: () => <div className="w-[500px] h-[400px]"><TerminalWidget /></div>,
    data: () => <div className="w-[400px] h-[400px]"><DataTableWidget /></div>,
  }), []);

  return (
    <div className="w-full h-full relative bg-background">
      {/* We apply a dark mode overlay filter because xyflow light defaults are strong */}
      <ReactFlow 
        nodes={initialNodes}
        nodeTypes={nodeTypes}
        fitView
        className="dark-theme"
      >
        <Background color="rgba(255, 255, 255, 0.1)" gap={32} size={1} />
        <Controls className="bg-surface-1 border-border-subtle" />
      </ReactFlow>
    </div>
  );
}
