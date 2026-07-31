"use client";

import React, { useState } from "react";
import { Search, Network, Box, Clock, Link2, Settings, Sidebar, User, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function LinearLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden text-sm">
      
      {/* Polished Sidebar */}
      <div 
        className={`flex flex-col bg-surface-2/30 border-r border-border-subtle transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-0 opacity-0 overflow-hidden"
        }`}
      >
        {/* Workspace Header */}
        <div className="h-14 flex items-center px-6 mt-2 mb-2 font-semibold text-foreground tracking-tight">
          <div className="w-6 h-6 rounded-md bg-foreground text-background flex items-center justify-center mr-3 text-[11px] font-bold shadow-sm">
            M
          </div>
          Metaphor OS
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-2 px-3 space-y-6">
          
          {/* Main Actions */}
          <div className="space-y-0.5">
            <NavItem icon={<Search />} label="Search" shortcut="⌘K" active />
            <NavItem icon={<Clock />} label="Timeline" shortcut="⌘T" />
          </div>

          {/* Collapsible Section: Workspace */}
          <div className="space-y-1">
            <div className="px-3 py-1 flex items-center justify-between text-[11px] font-medium text-muted uppercase tracking-wider group cursor-pointer">
              Workspace
              <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <NavItem icon={<Network />} label="Knowledge Graph" shortcut="⌘G" />
            <NavItem icon={<Box />} label="Projects" shortcut="⌘P" />
            <NavItem icon={<Link2 />} label="Connections" />
          </div>

        </div>

        {/* Footer Navigation */}
        <div className="p-3 space-y-0.5 mb-2">
          <NavItem icon={<Settings />} label="Settings" shortcut="⌘," />
          <NavItem icon={<User />} label="William" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-background">
        
        {/* Topbar with Sidebar Toggle */}
        <div className="absolute top-4 left-4 z-50">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-md text-muted hover:bg-surface-2 hover:text-foreground transition-all duration-200"
          >
            <Sidebar className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Void */}
        <div className="flex-1 overflow-y-auto relative z-10">
          {children}
        </div>
      </div>
      
    </div>
  );
}

function NavItem({ icon, label, shortcut, active }: { icon: React.ReactNode, label: string, shortcut?: string, active?: boolean }) {
  return (
    <div className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
      active 
        ? "bg-surface-1 shadow-sm text-foreground ring-1 ring-border-subtle" 
        : "text-muted hover:bg-surface-2 hover:text-foreground"
    }`}>
      <div className="flex items-center gap-3">
        {React.cloneElement(icon as React.ReactElement, { className: `w-4 h-4 ${active ? "text-primary" : "opacity-70 group-hover:opacity-100 transition-opacity"}` })}
        <span className="font-medium text-[13px]">{label}</span>
      </div>
      {shortcut && <span className={`text-[10px] font-mono tracking-widest ${active ? "text-muted" : "text-muted/40 group-hover:text-muted/80"} transition-colors`}>{shortcut}</span>}
    </div>
  );
}
