"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Network, Database, Key, Plug, Settings, Sidebar, User, ChevronDown, Layers, Terminal, Inbox } from "lucide-react";
import { Kbd } from "@/components/ui/Kbd";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";

export default function LinearLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const { fetchFromMetaphor } = await import("@/app/api");
        const data = await fetchFromMetaphor("/auth/me");
        if (data && data.name) {
          setUser(data);
        }
      } catch (e) {
        console.error("Failed to fetch user in layout:", e);
      }
    }
    fetchUser();
  }, []);

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden text-sm">
      
      {/* Polished Sidebar */}
      <div 
        className={`flex flex-col bg-surface-2/30 border-r border-border-subtle ease-in-out ${
          isSidebarOpen ? "w-64" : "w-0 opacity-0 overflow-hidden"
        }`}
        style={{ transition: 'all var(--transition-fast)' }}
      >
        {/* Workspace Header */}
        <div className="h-14 flex items-center px-6 mt-2 mb-2 font-semibold text-foreground tracking-tight">
          <MetaphorLogo size={20} className="mr-3" />
          Metaphor OS
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-2 px-3 space-y-6">
          
          {/* Action Layer */}
          <div className="space-y-0.5 mb-6">
            <NavItem href="/dashboard/inbox" icon={<Inbox />} label="Context Inbox" shortcut="⌘I" pathname={pathname} />
            <NavItem href="/dashboard/playground" icon={<Terminal />} label="The Context Layer" shortcut="⌘P" pathname={pathname} />
          </div>

          {/* Infrastructure Actions */}
          <div className="space-y-0.5">
            <NavItem href="/dashboard" icon={<Database />} label="Context Dashboard" shortcut="⌘D" pathname={pathname} exact />
            <NavItem href="/dashboard/graph" icon={<Network />} label="Knowledge Graph" shortcut="⌘G" pathname={pathname} />
          </div>

          {/* Collapsible Section: Configuration */}
          <div className="space-y-1">
            <div className="px-3 py-1 flex items-center justify-between text-[11px] font-medium text-muted uppercase tracking-wider group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded" tabIndex={0}>
              Intelligence Routing
              <ChevronDown 
                className="w-3 h-3 opacity-0 group-hover:opacity-100 group-focus:opacity-100" 
                style={{ transition: 'opacity var(--transition-fast)' }} 
              />
            </div>
            <NavItem href="/dashboard/models" icon={<Layers />} label="Context Models" shortcut="⌘M" pathname={pathname} />
            <NavItem href="/dashboard/integrations" icon={<Plug />} label="Integrations" shortcut="⌘I" pathname={pathname} />
            <NavItem href="/dashboard/api" icon={<Key />} label="API Access" pathname={pathname} />
          </div>

        </div>

        {/* Footer Navigation */}
        <div className="p-3 space-y-0.5 mb-2 border-t border-border-subtle/50 pt-4">
          <NavItem href="/dashboard/settings" icon={<Settings />} label="Settings" shortcut="⌘," pathname={pathname} />
          <NavItem href="/dashboard/profile" icon={<User />} label={user?.name || "Developer User"} pathname={pathname} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-background h-full overflow-hidden">
        
        {/* Topbar Header */}
        <header className="h-12 px-4 border-b border-border-subtle flex items-center justify-between bg-surface-1/40 backdrop-blur-md shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-md text-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
              title="Toggle Sidebar"
            >
              <Sidebar className="w-4 h-4" />
            </button>
            <div className="h-4 w-[1px] bg-border-subtle" />
            <span className="text-xs font-medium text-muted tracking-tight">Metaphor OS</span>
          </div>
        </header>

        {/* Workspace Void */}
        <div className="flex-1 overflow-y-auto relative z-10">
          {children}
        </div>
      </div>
      
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  shortcut, 
  href = "#", 
  pathname = "", 
  exact = false 
}: { 
  icon: React.ReactNode, 
  label: string, 
  shortcut?: string, 
  href?: string,
  pathname?: string,
  exact?: boolean
}) {
  const active = exact ? pathname === href : pathname.startsWith(href) && (href !== "/dashboard" || pathname === "/dashboard");

  return (
    <Link 
      href={href}
      className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
        active 
          ? "bg-surface-1 shadow-sm text-foreground ring-1 ring-border-subtle" 
          : "text-muted hover:bg-surface-2 hover:text-foreground"
      }`}
      style={{ transition: 'all var(--transition-fast)' }}
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
    </Link>
  );
}
