"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MetaphorLogo } from "@/components/ui/MetaphorLogo";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FloatingNavProps {
  isWeaveOpen?: boolean;
  onToggleWeave?: () => void;
  onOpenPalette?: () => void;
  user?: { name: string; email: string } | null;
}

// ── Routes ───────────────────────────────────────────────────────────────────

const ROUTES = [
  { path: "/world",       label: "Your Connected World" },
  { path: "/tools",       label: "Tools" },
  { path: "/handoffs",    label: "Handoffs" },
  { path: "/context",     label: "Context" },
  { path: "/connections", label: "Connections" },
  { path: "/settings",    label: "Settings" },
];

// ── Glass Navigation Capsule ─────────────────────────────────────────────────

export function FloatingNav({
  onOpenPalette,
  user: initialUser,
}: FloatingNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<{ name: string; email: string } | null>(initialUser || null);

  useEffect(() => {
    if (initialUser) { setUser(initialUser); return; }
    const stored = typeof window !== "undefined" ? localStorage.getItem("metaphor_user_name") : null;
    setUser({ name: stored || "Local User", email: "user@local" });
  }, [initialUser]);

  const isRouteActive = (routePath: string) => {
    return pathname === routePath || pathname.startsWith(routePath + "/");
  };

  return (
    <header
      className="fixed top-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      role="banner"
    >
      <motion.div
        className="pointer-events-auto flex items-center h-[52px] px-8 rounded-full glass-clear backdrop-blur-xl border border-[rgba(10,10,10,0.06)] shadow-[0_14px_40px_rgba(0,0,0,0.04)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav className="flex items-center gap-5">
          {ROUTES.map((route, index) => {
            const isActive = isRouteActive(route.path);
            return (
              <React.Fragment key={route.path}>
                <Link
                  href={route.path}
                  className="relative transition-colors duration-200"
                  style={{
                    fontFamily: isActive ? "'Cormorant Garamond', var(--next-font-display), serif" : "'Cormorant Garamond', var(--next-font-display), serif",
                    fontStyle: "normal",
                    fontSize: "17px",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--color-ink)" : "#3B4043",
                    letterSpacing: "0.01em",
                  }}
                >
                  {route.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[var(--color-ink)]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
                
                {/* Separator */}
                {index < ROUTES.length - 1 && (
                  <span className="text-[13px] text-[#AEB7BC] select-none font-sans opacity-50">|</span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </motion.div>
    </header>
  );
}
