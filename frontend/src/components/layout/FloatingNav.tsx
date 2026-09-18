"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Database,
  Network,
  Terminal,
  Layers,
  Activity,
  Plug,
  Zap,
  Search,
  Sun,
  Moon,
  Settings,
  LogOut,
  ChevronDown,
  Folder,
  Inbox,
  Key,
  Globe,
  User,
  MoreHorizontal,
} from "lucide-react";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";
import { EcosystemSwitcher } from "@/components/ui/EcosystemSwitcher";

interface FloatingNavProps {
  isWeaveOpen?: boolean;
  onToggleWeave?: () => void;
  user?: { name: string; email: string } | null;
}

export function FloatingNav({
  isWeaveOpen = false,
  onToggleWeave,
  user: initialUser,
}: FloatingNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [activeWorkspace, setActiveWorkspace] = useState("Sovereign Node");
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [user, setUser] = useState<{ name: string; email: string } | null>(initialUser || null);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const workspaces = [
    "Sovereign Node",
    "Core Enterprise",
    "Research Lab",
    "Client Alpha",
  ];

  // Theme detection & management
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("metaphor_theme");
      const initial = storedTheme === "light" ? "light" : "dark";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
      if (initial === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("metaphor_theme", nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  // User fetch fallback
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      return;
    }
    const storedName = typeof window !== "undefined" ? localStorage.getItem("metaphor_user_name") : null;
    setUser({
      name: storedName || "Sovereign User",
      email: "sovereign@local",
    });
  }, [initialUser]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (workspaceRef.current && !workspaceRef.current.contains(e.target as Node)) {
        setIsWorkspaceOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    }
    if (typeof window !== "undefined") {
      localStorage.clear();
      document.cookie = "metaphor_unlocked=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "metaphor_onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
    router.push("/login");
  };

  const primaryNavItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Database,
      exact: true,
    },
    {
      label: "Graph",
      href: "/dashboard/graph",
      icon: Network,
      exact: false,
    },
    {
      label: "Editor",
      href: "/dashboard/editor",
      icon: Terminal,
      exact: false,
    },
    {
      label: "Engine",
      href: "/dashboard/playground",
      icon: Layers,
      exact: false,
    },
    {
      label: "Pipeline",
      href: "/dashboard/pipeline",
      icon: Activity,
      exact: false,
    },
    {
      label: "Connectors",
      href: "/dashboard/integrations",
      icon: Plug,
      exact: false,
    },
  ];

  const secondaryNavItems = [
    {
      label: "Projects",
      href: "/dashboard/projects",
      icon: Folder,
      desc: "Workspace projects & attached memories",
    },
    {
      label: "Context Inbox",
      href: "/dashboard/inbox",
      icon: Inbox,
      desc: "Pending ingestions & review stream",
    },
    {
      label: "Context Models",
      href: "/dashboard/models",
      icon: Layers,
      desc: "LLM adapters & projection templates",
    },
    {
      label: "API Access & MCP",
      href: "/dashboard/api",
      icon: Key,
      desc: "Remote MCP servers & credentials",
    },
  ];

  const isRouteActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isMoreActive = secondaryNavItems.some((item) =>
    pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <header className="fixed top-0 left-0 right-0 h-12 z-50 bg-background/85 backdrop-blur-xl border-b border-border-subtle/80 select-none">
      <div className="h-full w-full px-3 md:px-4 flex items-center justify-between gap-2 max-w-[1700px] mx-auto">
        
        {/* ── Left: Brand & Workspace Switcher ────────────────────────── */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-1.5 py-1 rounded-lg hover:bg-surface-2/60 transition-colors group shrink-0"
            title="Metaphor OS Dashboard"
          >
            <MetaphorLogo size={18} />
            <span className="text-xs font-semibold tracking-tight text-foreground font-sans hidden sm:inline group-hover:text-primary transition-colors">
              Metaphor OS
            </span>
          </Link>

          {/* Workspace Pill / Dropdown */}
          <div className="relative hidden md:block" ref={workspaceRef}>
            <button
              onClick={() => setIsWorkspaceOpen((o) => !o)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border-subtle/80 bg-surface-1/70 hover:bg-surface-2/80 text-[11px] font-medium text-foreground transition-all cursor-pointer shadow-xs"
              title="Switch Workspace Node"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="truncate max-w-[130px]">{activeWorkspace}</span>
              <ChevronDown className="w-3 h-3 text-muted" />
            </button>

            {isWorkspaceOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-surface-1/95 backdrop-blur-xl border border-border-subtle rounded-xl shadow-2xl py-1 z-50 animate-in fade-in duration-100">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted border-b border-border-subtle/50">
                  Select Workspace Node
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setIsWorkspaceOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      activeWorkspace === ws
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-muted hover:text-foreground hover:bg-surface-2/60"
                    }`}
                  >
                    <span>{ws}</span>
                    {activeWorkspace === ws && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Center: Segmented Pill Navigation ───────────────────────── */}
        <nav className="flex items-center p-0.5 rounded-xl bg-surface-2/50 border border-border-subtle/80 backdrop-blur-md shrink-0 shadow-xs">
          {primaryNavItems.map((item) => {
            const active = isRouteActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  active
                    ? "bg-foreground text-background shadow-xs font-semibold"
                    : "text-muted hover:text-foreground hover:bg-surface-2/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}

          {/* More Secondary Nav Menu */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setIsMoreOpen((o) => !o)}
              title="More Workspace Modules"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                isMoreActive
                  ? "bg-foreground/20 text-foreground font-semibold"
                  : "text-muted hover:text-foreground hover:bg-surface-2/60"
              }`}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {isMoreOpen && (
              <div className="absolute top-full right-0 mt-1 w-60 bg-surface-1/95 backdrop-blur-xl border border-border-subtle rounded-xl shadow-2xl py-1 z-50 animate-in fade-in duration-100">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted border-b border-border-subtle/50">
                  Additional Modules
                </div>
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isRouteActive(item.href, false);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMoreOpen(false)}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted hover:text-foreground hover:bg-surface-2/60"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-medium text-foreground">{item.label}</div>
                        <div className="text-[10px] text-muted/80 leading-tight">{item.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* ── Right: Telemetry, Actions & Profile ─────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Living Context Telemetry Pill */}
          <div
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-border-subtle/80 bg-surface-1/50 shadow-xs"
            title="Living Context OS active on local/cloud runtime"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-muted font-sans font-medium">Context Active</span>
          </div>

          {/* Weave Intelligence Toggle */}
          {onToggleWeave && (
            <button
              onClick={onToggleWeave}
              title="Toggle Weave Intelligence Panel"
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer border ${
                isWeaveOpen
                  ? "bg-primary/15 text-primary border-primary/30 shadow-xs"
                  : "text-muted hover:text-foreground hover:bg-surface-2/60 border-border-subtle/60"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Command Palette Trigger */}
          <button
            onClick={() => {
              const e = new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                bubbles: true,
              });
              document.dispatchEvent(e);
            }}
            title="Open Command Palette (⌘K)"
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-2/60 border border-border-subtle/60 text-[11px] font-mono cursor-pointer transition-colors"
          >
            <Search className="w-3 h-3" />
            <span>⌘K</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-2/60 transition-colors cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Settings Shortcut */}
          <Link
            href="/dashboard/settings"
            title="Settings"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              pathname.startsWith("/dashboard/settings")
                ? "bg-surface-2 text-foreground font-semibold"
                : "text-muted hover:text-foreground hover:bg-surface-2/60"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
          </Link>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen((o) => !o)}
              className="flex items-center gap-1.5 p-0.5 rounded-lg hover:bg-surface-2/60 transition-colors cursor-pointer"
              title="Account Options"
            >
              <div className="w-6 h-6 rounded-md bg-surface-2 border border-border-subtle flex items-center justify-center text-[10px] font-bold text-foreground">
                {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-52 bg-surface-1/95 backdrop-blur-xl border border-border-subtle rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in duration-100">
                <div className="px-3 py-2 border-b border-border-subtle/50">
                  <div className="text-xs font-semibold text-foreground truncate">
                    {user?.name || "Sovereign User"}
                  </div>
                  <div className="text-[10px] text-muted truncate">
                    {user?.email || "sovereign@local"}
                  </div>
                </div>

                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full text-left px-3 py-1.5 text-xs text-muted hover:text-foreground hover:bg-surface-2/60 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile & Sovereign ID</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2 cursor-pointer mt-1 border-t border-border-subtle/40 pt-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-border-subtle/80 mx-0.5 shrink-0 hidden sm:block" />

          {/* 9-Dot Ecosystem Waffle Switcher */}
          <div className="flex items-center">
            <EcosystemSwitcher />
          </div>

        </div>

      </div>
    </header>
  );
}
