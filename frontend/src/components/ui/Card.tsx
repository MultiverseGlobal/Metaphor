import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function Card({ children, className = "", noPadding = false, ...props }: CardProps) {
  return (
    <div 
      className={`bg-surface-1 border border-border-subtle rounded-xl shadow-glass overflow-hidden ${noPadding ? "" : "p-6"} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center gap-2 mb-4 border-b border-border-subtle pb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-xs text-muted uppercase tracking-widest font-bold ${className}`} {...props}>
      {children}
    </h3>
  );
}
