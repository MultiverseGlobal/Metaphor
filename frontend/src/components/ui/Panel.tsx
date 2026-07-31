import React from "react";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  level: number; // 0 for base layer, 1 for stacked over, etc.
}

export function Panel({ children, level, className = "", ...props }: PanelProps) {
  // Translate the panel horizontally and scale slightly based on level
  // Level 0 is the base panel (e.g. Dashboard).
  // Level 1 slides in over it, pushing Level 0 back slightly.
  
  const transformStyle = {
    transform: `translateX(${level * 40}px) scale(${1 - level * 0.02})`,
    zIndex: 10 + level,
  };

  return (
    <div 
      className={`absolute inset-y-4 right-4 left-24 bg-surface-1/90 backdrop-blur-3xl border border-border-subtle rounded-2xl shadow-glass overflow-hidden transition-all duration-500 ease-out flex flex-col ${className}`}
      style={transformStyle}
      {...props}
    >
      {children}
    </div>
  );
}
