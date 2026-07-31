import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function Card({ children, className = "", noPadding = false, ...props }: CardProps) {
  return (
    <div 
      className={`bg-surface-1 rounded-xl shadow-sm border border-border-subtle transition-shadow duration-300 hover:shadow-md ${noPadding ? "" : "p-6"} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Minimal action card for the Cognitive OS (No numbers, just intent)
export function ActionCard({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="group flex flex-col items-start p-5 bg-surface-1 border border-border-subtle rounded-xl cursor-pointer hover:border-border-strong hover:bg-surface-2 transition-colors duration-200"
    >
      <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-muted group-hover:text-primary transition-colors border border-border-subtle mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted leading-relaxed">{description}</p>
    </div>
  );
}
