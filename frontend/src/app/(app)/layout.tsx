"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { CommandPalette } from "@/components/ui/CommandPalette";

const PAGE_VARIANTS = {
  initial:  { opacity: 0, y: 6, filter: "blur(4px)" },
  animate:  { opacity: 1, y: 0, filter: "blur(0px)" },
  exit:     { opacity: 0, y: -4, filter: "blur(2px)" },
};
const PAGE_TRANSITION = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const pathname = usePathname();

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsPaletteOpen((o) => !o);
      }
      if (e.key === "Escape") setIsPaletteOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="relative min-h-screen w-screen bg-transparent text-[var(--color-ink)] overflow-x-hidden">
      {/* Command palette */}
      <CommandPalette open={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />

      {/* Navigation Capsule */}
      <FloatingNav onOpenPalette={() => setIsPaletteOpen(true)} />

      {/* Main Page Area */}
      <div className="flex w-full min-h-screen relative pt-24">
        <main className="flex-1 w-full relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              variants={PAGE_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={PAGE_TRANSITION}
              className="w-full min-h-[calc(100vh-6rem)] flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
