"use client";

import React, { useState } from "react";
import { Command, LayoutDashboard, BrainCircuit, Activity, Settings, User } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden relative">
      
      {/* Detached Floating Dock */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 z-[100] flex flex-col items-center gap-4 bg-surface-1/60 backdrop-blur-2xl border border-border-strong rounded-2xl p-2 shadow-glass">
        
        <div className="w-10 h-10 flex items-center justify-center bg-primary-dim rounded-xl border border-primary/20 mb-4 cursor-pointer hover:bg-primary/30 transition-colors">
          <Command className="w-5 h-5 text-primary" />
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem icon={<LayoutDashboard />} id="dashboard" active={activeNav === "dashboard"} onClick={() => setActiveNav("dashboard")} />
          <NavItem icon={<BrainCircuit />} id="knowledge" active={activeNav === "knowledge"} onClick={() => setActiveNav("knowledge")} />
          <NavItem icon={<Activity />} id="agents" active={activeNav === "agents"} onClick={() => setActiveNav("agents")} />
        </nav>

        <div className="h-4"></div>
        <NavItem icon={<Settings />} id="settings" active={activeNav === "settings"} onClick={() => setActiveNav("settings")} />
        <div className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-2 transition-colors cursor-pointer mt-2 border border-border-subtle bg-surface-2 overflow-hidden">
          <User className="w-5 h-5 text-muted" />
        </div>
      </div>

      {/* The main workspace void where panels will slide in */}
      <div className="flex-1 relative">
        {/* We pass the active nav down so the page can manage panels */}
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { activeNav } as any);
          }
          return child;
        })}
      </div>
      
    </div>
  );
}

function NavItem({ icon, id, active, onClick }: { icon: React.ReactNode, id: string, active: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-300 ${active ? "bg-surface-2 text-primary shadow-inner border border-border-strong" : "text-muted hover:text-foreground hover:bg-surface-2/50"}`}
      title={id}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
    </div>
  );
}
