"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  Command,
  User,
  LogOut,
  ChevronDown,
  Check,
  Zap,
} from "lucide-react";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";
import { useTheme } from "next-themes";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FloatingNavProps {
  isWeaveOpen?: boolean;
  onToggleWeave?: () => void;
  onOpenPalette?: () => void;
  user?: { name: string; email: string } | null;
}

// ── Routes — text-only, no icons in nav ──────────────────────────────────────

const ROUTES = [
  { path: "/canvas",   label: "Studio"   },
  { path: "/projects", label: "Projects" },
  { path: "/work",     label: "Work"     },
  { path: "/world",    label: "World"    },
  { path: "/settings", label: "Settings" },
];

// ── FloatingNav ───────────────────────────────────────────────────────────────

export function FloatingNav({
  isWeaveOpen = false,
  onToggleWeave,
  onOpenPalette,
  user: initialUser,
}: FloatingNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activePartition, setActivePartition] = useState("Global Identity");
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(initialUser || null);

  const brandRef = useRef<HTMLDivElement>(null);
  const partitions = ["Global Identity", "Engineering", "Research Lab"];

  useEffect(() => { setMounted(true); }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    if (initialUser) { setUser(initialUser); return; }
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
    } catch (e) { console.error(e); }
    if (typeof window !== "undefined") {
      localStorage.clear();
      document.cookie = "metaphor_unlocked=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "metaphor_onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "metaphor_signed_out=true; path=/; max-age=86400;";
    }
    router.push("/?landing=true");
  };

  const isRouteActive = (routePath: string) => {
    return pathname === routePath || pathname.startsWith(routePath + "/");
  };

  // Active route for italic treatment
  const activeRoute = ROUTES.find(r => isRouteActive(r.path));

  return (
    <>
      {/* ── Full-width slim editorial top bar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-5 md:px-8"
        style={{
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {/* Left — Logo + brand dropdown */}
        <div className="flex items-center gap-3 min-w-0" ref={brandRef}>
          <div className="relative">
            <button
              onClick={() => setIsBrandDropdownOpen(o => !o)}
              className="flex items-center gap-2 cursor-pointer group"
              title="Metaphor workspace"
              aria-expanded={isBrandDropdownOpen}
              aria-haspopup="menu"
            >
              <MetaphorLogo size={16} />
              <span
                className="text-[13px] font-semibold tracking-tight hidden sm:block transition-colors duration-150"
                style={{
                  fontFamily: "'Satoshi', sans-serif",
                  color: "rgba(240,240,238,0.85)",
                  letterSpacing: "-0.02em",
                }}
              >
                Metaphor
              </span>
              <ChevronDown
                className="w-3 h-3 transition-transform duration-150"
                style={{
                  color: "rgba(240,240,238,0.35)",
                  transform: isBrandDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* Brand dropdown */}
            {isBrandDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-56 py-1.5 rounded-xl z-50 animate-in fade-in duration-100"
                style={{
                  background: "rgba(13,13,13,0.97)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.70)",
                }}
                role="menu"
              >
                {/* User info */}
                <div
                  className="px-3.5 py-2.5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="text-[12px] font-semibold truncate"
                    style={{ color: "rgba(240,240,238,0.90)", fontFamily: "'Satoshi', sans-serif" }}
                  >
                    {user?.name || "Local User"}
                  </div>
                  <div
                    className="text-[11px] truncate mt-0.5"
                    style={{ color: "rgba(240,240,238,0.35)", fontFamily: "'Satoshi', sans-serif" }}
                  >
                    {user?.email || "user@local"}
                  </div>
                </div>

                {/* Partitions */}
                <div
                  className="px-3.5 py-2 text-[9px] font-mono uppercase tracking-widest mt-0.5"
                  style={{ color: "rgba(240,240,238,0.25)" }}
                >
                  Active Partition
                </div>
                {partitions.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setActivePartition(p); setIsBrandDropdownOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-[12px] transition-colors flex items-center justify-between cursor-pointer"
                    style={{
                      fontFamily: "'Satoshi', sans-serif",
                      color: activePartition === p ? "rgba(240,240,238,0.90)" : "rgba(240,240,238,0.40)",
                      background: activePartition === p ? "rgba(255,255,255,0.04)" : "transparent",
                      fontWeight: activePartition === p ? 600 : 400,
                    }}
                    onMouseEnter={e => {
                      if (activePartition !== p) (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,240,238,0.75)";
                    }}
                    onMouseLeave={e => {
                      if (activePartition !== p) (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,240,238,0.40)";
                    }}
                    role="menuitemradio"
                    aria-checked={activePartition === p}
                  >
                    <span>{p}</span>
                    {activePartition === p && <Check className="w-3 h-3" style={{ color: "#4CAF7D" }} />}
                  </button>
                ))}

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "4px 0" }} />

                <Link
                  href="/settings"
                  onClick={() => setIsBrandDropdownOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] transition-colors cursor-pointer"
                  style={{ fontFamily: "'Satoshi', sans-serif", color: "rgba(240,240,238,0.40)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(240,240,238,0.80)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,240,238,0.40)")}
                  role="menuitem"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile & Keys</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] transition-colors cursor-pointer"
                  style={{ fontFamily: "'Satoshi', sans-serif", color: "rgba(244,63,94,0.70)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(244,63,94,1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(244,63,94,0.70)"; }}
                  role="menuitem"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <span style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)", display: "block" }} />

          {/* Active scope breadcrumb */}
          {activeRoute && (
            <span
              className="text-[11px] hidden md:block"
              style={{
                fontFamily: "'Satoshi', sans-serif",
                color: "rgba(240,240,238,0.35)",
                letterSpacing: "-0.01em",
              }}
            >
              {activeRoute.label}
            </span>
          )}
        </div>

        {/* Center — route navigation, text-only */}
        <nav className="hidden md:flex items-center gap-1 mx-auto">
          {ROUTES.map((route) => {
            const isActive = isRouteActive(route.path);
            return (
              <Link
                key={route.path}
                href={route.path}
                className="relative px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
                style={{
                  fontFamily: isActive ? "'Cormorant Garamond', Georgia, serif" : "'Satoshi', sans-serif",
                  fontStyle: isActive ? "italic" : "normal",
                  fontSize: isActive ? "14px" : "13px",
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? "rgba(240,240,238,0.92)" : "rgba(240,240,238,0.38)",
                  letterSpacing: isActive ? "-0.01em" : "-0.015em",
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,240,238,0.72)";
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,240,238,0.38)";
                }}
              >
                {route.label}
              </Link>
            );
          })}
        </nav>

        {/* Right — utility controls */}
        <div className="flex items-center gap-1 ml-auto">
          {/* ⌘K palette */}
          {onOpenPalette && (
            <button
              onClick={onOpenPalette}
              title="Command palette (⌘K)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-150"
              style={{
                color: "rgba(240,240,238,0.35)",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "transparent",
                fontFamily: "'Satoshi', sans-serif",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,240,238,0.75)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.14)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,240,238,0.35)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
              }}
              aria-label="Open command palette"
            >
              <Command className="w-3 h-3" />
              <kbd className="text-[9px] font-mono hidden md:block opacity-70">⌘K</kbd>
            </button>
          )}

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-lg cursor-pointer transition-colors duration-150"
              style={{ color: "rgba(240,240,238,0.35)", background: "transparent" }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,240,238,0.75)"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,240,238,0.35)"}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Weave toggle */}
          {onToggleWeave && (
            <button
              onClick={onToggleWeave}
              title="Weave Intelligence panel"
              className="p-2 rounded-lg cursor-pointer transition-all duration-150"
              style={{
                color: isWeaveOpen ? "#4CAF7D" : "rgba(240,240,238,0.35)",
                background: isWeaveOpen ? "rgba(76,175,125,0.10)" : "transparent",
                border: isWeaveOpen ? "1px solid rgba(76,175,125,0.20)" : "1px solid transparent",
              }}
              onMouseEnter={e => {
                if (!isWeaveOpen) (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,240,238,0.75)";
              }}
              onMouseLeave={e => {
                if (!isWeaveOpen) (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,240,238,0.35)";
              }}
              aria-label={isWeaveOpen ? "Close Weave panel" : "Open Weave Intelligence panel"}
              aria-pressed={isWeaveOpen}
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>
    </>
  );
}
