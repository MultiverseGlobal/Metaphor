"use client";

import React, { useState } from "react";
import { Search, Network, Box, Clock, Link2, Settings, Sidebar, User, ChevronDown } from "lucide-react";
import { Kbd } from "@/components/ui/Kbd";

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
        className={`flex flex-col bg-surface-2/30 border-r border-border-subtle ease-in-out ${
          isSidebarOpen ? "w-64" : "w-0 opacity-0 overflow-hidden"
        }`}
        style={{ transition: 'all var(--transition-base)' }}
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
            <div className="px-3 py-1 flex items-center justify-between text-[11px] font-medium text-muted uppercase tracking-wider group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded" tabIndex={0}>
              Workspace
              <ChevronDown 
                className="w-3 h-3 opacity-0 group-hover:opacity-100 group-focus:opacity-100" 
                style={{ transition: 'opacity var(--transition-fast)' }} 
              />
            </div>
            <NavItem icon={<Network />} label="Knowledge Graph" shortcut="⌘G" />
            <NavItem icon={<Box />} label="Projects" shortcut="⌘P" />
            <NavItem icon={<Link2 />} label="Connections" />
          </div>

        </div>

        {/* Footer Navigation */}
        <div className="p-3 space-y-0.5 mb-2 border-t border-border-subtle/50 pt-4">
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
            className="p-1.5 rounded-md text-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            style={{ transition: 'all var(--transition-fast)' }}
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
    <div 
      className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
        active 
          ? "bg-surface-1 shadow-sm text-foreground ring-1 ring-border-subtle" 
          : "text-muted hover:bg-surface-2 hover:text-foreground"
      }`}
      style={{ transition: 'all var(--transition-fast)' }}
      tabIndex={0}
    >
      <div className="flex items-center gap-3">
        {React.cloneElement(icon as React.ReactElement, { 
          className: `w-4 h-4 ${active ? "text-primary" : "opacity-70 group-hover:opacity-100 group-focus:opacity-100"} group-hover:scale-110 group-focus:scale-110 transition-all duration-200` 
        })}
        <span className="font-medium text-[13px] tracking-tight">{label}</span>
      </div>
      {shortcut && (
        <div className={`opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 ${active ? 'opacity-100' : ''}`}>
          <Kbd>{shortcut}</Kbd>
        </div>
      )}
    </div>
  );
}
