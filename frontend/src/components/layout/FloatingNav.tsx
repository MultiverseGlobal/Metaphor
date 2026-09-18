"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Command,
  Network,
  Terminal,
  Layers,
  Activity,
  Plug,
  Settings,
  Sun,
  Moon,
  Zap,
  User,
  LogOut,
  ChevronDown,
  Check,
} from "lucide-react";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";
import { EcosystemSwitcher } from "@/components/ui/EcosystemSwitcher";

interface FloatingNavProps {
  isWeaveOpen?: boolean;
  onToggleWeave?: () => void;
  user?: { name: string; email: string } | null;
}

const ROUTES = [
  { path: "/explorer", label: "Explorer", icon: Terminal, exact: false },
  { path: "/overview", label: "Overview", icon: Command, exact: true },
  { path: "/integrations", label: "Sources", icon: Plug, exact: false },
  { path: "/graph", label: "Graph", icon: Network, exact: false },
  { path: "/partitions", label: "Partitions", icon: Layers, exact: false },
  { path: "/inbox", label: "Inbox", icon: Activity, exact: false },
  { path: "/settings", label: "Settings", icon: Settings, exact: false },
];

export function FloatingNav({
  isWeaveOpen = false,
  onToggleWeave,
  user: initialUser,
}: FloatingNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activePartition, setActivePartition] = useState("Global Identity");
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(initialUser || null);

  const brandRef = useRef<HTMLDivElement>(null);

  const partitions = ["Global Identity", "Engineering", "Research Lab"];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("metaphor_theme");
      const current = stored === "light" ? "light" : "dark";
      setTheme(current);
      document.documentElement.setAttribute("data-theme", current);
      if (current === "dark") {
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

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      return;
    }
    const stored = typeof window !== "undefined" ? localStorage.getItem("metaphor_user_name") : null;
    setUser({ name: stored || "Local User", email: "user@local" });
  }, [initialUser]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setIsBrandDropdownOpen(false);
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
      console.error(e);
    }
    if (typeof window !== "undefined") {
      localStorage.clear();
      document.cookie = "metaphor_unlocked=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "metaphor_onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
    router.push("/login");
  };

  const isRouteActive = (routePath: string, exact: boolean) => {
    if (exact) {
      return pathname === routePath;
    }
    return pathname === routePath || pathname.startsWith(routePath + "/");
  };

  return (
    <>
      {/* ── Top Left: Brand Mark & Ecosystem Switcher (Atlas-style detached island) ── */}
      <div className="fixed top-5 left-5 z-50 flex items-center gap-2 select-none">
        
        {/* Brand Capsule Dropdown */}
        <div className="relative" ref={brandRef}>
          <button
            onClick={() => setIsBrandDropdownOpen((o) => !o)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-1/80 border border-border-subtle/80 shadow-sm backdrop-blur-md hover:bg-surface-2/80 transition-all cursor-pointer text-foreground"
            title="Metaphor OS Node & Account"
          >
            <MetaphorLogo size={16} />
            <span className="text-[12px] font-semibold tracking-tight text-foreground hidden sm:block">
              Metaphor
            </span>
            <ChevronDown className="w-3 h-3 text-muted" />
          </button>

          {isBrandDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-56 bg-surface-1/95 backdrop-blur-xl border border-border-subtle rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-2 border-b border-border-subtle/50">
                <div className="text-xs font-semibold text-foreground truncate">
                  {user?.name || "Local User"}
                </div>
                <div className="text-[10px] text-muted truncate">
                  {user?.email || "user@local"}
                </div>
              </div>

              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted">
                Active Partition
              </div>
              {partitions.map((partition) => (
                <button
                  key={partition}
                  onClick={() => {
                    setActivePartition(partition);
                    setIsBrandDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    activePartition === partition
                      ? "text-primary font-semibold bg-primary/10"
                      : "text-muted hover:text-foreground hover:bg-surface-2/60"
                  }`}
                >
                  <span>{partition}</span>
                  {activePartition === partition && <Check className="w-3 h-3 text-primary" />}
                </button>
              ))}

              <div className="border-t border-border-subtle/50 my-1" />
              
              <div className="px-3 py-1 text-[9px] font-mono text-muted/60 text-right">
                BUILD 49f2b1a (v0.1.0)
              </div>
              <div className="border-t border-border-subtle/50 my-1" />

              <Link
                href="/settings"
                onClick={() => setIsBrandDropdownOpen(false)}
                className="w-full text-left px-3 py-1.5 text-xs text-muted hover:text-foreground hover:bg-surface-2/60 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile & Keys</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Ecosystem Switcher Capsule */}
        <div className="flex items-center px-1.5 py-1 rounded-xl bg-surface-1/80 border border-border-subtle/80 shadow-sm backdrop-blur-md">
          <EcosystemSwitcher />
        </div>
      </div>

      {/* ── Top Right: Minimalist Floating Island Nav Dock (Exact Atlas aesthetic) ── */}
      <div className="fixed top-5 right-5 z-50 flex items-center gap-2 select-none">
        <div className="flex items-center p-1 rounded-2xl bg-surface-1/80 border border-border-subtle/80 shadow-sm backdrop-blur-md">
          {ROUTES.map((route) => {
            const isActive = isRouteActive(route.path, route.exact);
            const Icon = route.icon;
            return (
              <Link
                key={route.path}
                href={route.path}
                title={route.label}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-300 ease-out cursor-pointer ${
                  isActive
                    ? "bg-foreground text-background shadow-xs font-semibold"
                    : "text-muted hover:bg-surface-2/80 hover:text-foreground"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "" : "opacity-70 group-hover:opacity-100 transition-opacity"
                  }`}
                />
                <span
                  className={`text-[11px] font-semibold font-mono tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ease-out ${
                    isActive
                      ? "max-w-24 opacity-100"
                      : "max-w-0 opacity-0 group-hover:max-w-24 group-hover:opacity-100 group-hover:ml-1"
                  }`}
                >
                  {route.label}
                </span>
              </Link>
            );
          })}

          <div className="w-px h-4 bg-border-subtle/80 mx-1 shrink-0" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-surface-2/80 transition-colors cursor-pointer"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Weave Intelligence Toggle */}
          {onToggleWeave && (
            <button
              onClick={onToggleWeave}
              title="Toggle Weave Intelligence"
              className={`p-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                isWeaveOpen
                  ? "bg-primary/20 text-primary"
                  : "text-muted hover:text-foreground hover:bg-surface-2/80"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
