"use client";

import React, { useState } from "react";
import { Search, Network, Box, Clock, Link2, Settings, Sidebar, User } from "lucide-react";
import Link from "next/link";

export default function LinearLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden text-sm">
      
      {/* Linear-Style Minimal Sidebar */}
      <div 
        className={`flex flex-col bg-surface-2 border-r border-border-subtle transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-0 opacity-0 overflow-hidden"
        }`}
      >
        {/* Workspace Header */}
        <div className="h-14 flex items-center px-4 border-b border-border-subtle font-medium text-foreground">
          <div className="w-5 h-5 rounded bg-primary text-white flex items-center justify-center mr-2 text-[10px] font-bold">
            M
          </div>
          Metaphor OS
        </div>

        {/* Primary Navigation */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-2 space-y-1">
          <NavItem icon={<Search />} label="Search" shortcut="⌘K" active />
          <NavItem icon={<Network />} label="Knowledge Graph" />
          <NavItem icon={<Box />} label="Projects" />
          <NavItem icon={<Clock />} label="Timeline" />
          <NavItem icon={<Link2 />} label="Connections" />
        </div>

        {/* Footer Navigation */}
        <div className="p-2 space-y-1 border-t border-border-subtle">
          <NavItem icon={<Settings />} label="Settings" />
          <NavItem icon={<User />} label="Profile" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        
        {/* Topbar with Sidebar Toggle */}
        <div className="h-14 flex items-center px-4 border-b border-transparent">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-md text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
          >
            <Sidebar className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Void */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
      
    </div>
  );
}

function NavItem({ icon, label, shortcut, active }: { icon: React.ReactNode, label: string, shortcut?: string, active?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${active ? "bg-surface-1 shadow-sm text-foreground" : "text-muted hover:bg-surface-hover hover:text-foreground"}`}>
      <div className="flex items-center gap-2">
        {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })}
        <span className="font-medium">{label}</span>
      </div>
      {shortcut && <span className="text-[10px] font-mono text-muted/60">{shortcut}</span>}
    </div>
  );
}
