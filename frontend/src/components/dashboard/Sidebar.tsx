"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Network, 
  Database, 
  Bot, 
  Settings, 
  Activity,
  LogOut
} from "lucide-react";

const mainLinks = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Knowledge Graph", href: "/dashboard/graph", icon: Network },
  { name: "Agents", href: "/dashboard/agents", icon: Bot },
  { name: "Data Sources", href: "/dashboard/data", icon: Database },
  { name: "Activity", href: "/dashboard/activity", icon: Activity },
];

const secondaryLinks = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-surface border-r border-border flex flex-col flex-shrink-0 z-20">
      
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-sm">
           <Network className="w-5 h-5 text-white" />
        </div>
        <span className="ml-3 font-bold text-foreground tracking-tight">Metaphor OS</span>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Platform</div>
        {mainLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.name}
            </Link>
          );
        })}

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-8 mb-2 px-2">System</div>
        {secondaryLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-border">
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
             <span className="text-xs text-primary font-bold">W</span>
          </div>
          <span className="flex-1 text-left truncate">William</span>
          <LogOut className="w-4 h-4 opacity-50" />
        </button>
      </div>

    </div>
  );
}
