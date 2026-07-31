"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, HelpCircle } from "lucide-react";

export default function TopHeader() {
  const pathname = usePathname();
  
  // Quick breadcrumb generation
  const segments = pathname.split('/').filter(Boolean);
  const currentPage = segments[segments.length - 1] || "overview";
  const title = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  return (
    <div className="h-16 bg-background border-b border-border flex items-center justify-between px-8 z-10 sticky top-0">
      
      {/* Breadcrumbs & Title */}
      <div className="flex items-center gap-2">
         <span className="text-muted-foreground text-sm font-medium">Metaphor OS</span>
         <span className="text-muted-foreground/50 text-sm">/</span>
         <span className="text-foreground text-sm font-semibold">{title}</span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl mx-8 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-border rounded-md leading-5 bg-surface text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-shadow"
          placeholder="Search projects, agents, or knowledge bases... (⌘K)"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-background"></span>
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
