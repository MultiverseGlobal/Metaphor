import React from "react";
import { ArrowRight } from "lucide-react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function Card({ children, className = "", noPadding = false, ...props }: CardProps) {
  return (
    <div 
      className={`bg-surface-1 rounded-xl shadow-sm border border-border-subtle/50 transition-all duration-300 ${noPadding ? "" : "p-6"} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// The dominant Hero Card for continuing a workflow
export function HeroActionCard({ title, subtitle, metadata, onClick }: { title: string, subtitle: string, metadata: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="group relative flex flex-col justify-end p-8 w-full min-h-[220px] rounded-2xl cursor-pointer overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-lg bg-surface-1 border border-border-subtle/40"
    >
      {/* Subtle glowing orb effect in the background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-dim rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="relative z-10">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
          {metadata}
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-2">{title}</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{subtitle}</p>
          <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal action card, no borders, just a subtle hover fill
export function ActionCard({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="group flex flex-col items-start p-5 rounded-xl cursor-pointer hover:bg-surface-2/50 transition-all duration-300"
    >
      <div className="w-8 h-8 rounded-lg bg-surface-2/80 flex items-center justify-center text-muted group-hover:text-primary group-hover:bg-primary-dim transition-colors mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted leading-relaxed">{description}</p>
    </div>
  );
}
