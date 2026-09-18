"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Terminal, Network, Layers, Settings,
  Search, ArrowRight, GitCommit, Shield, Database, Target,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { id: "home",     label: "Home",     icon: Home,     href: "/home",     group: "Navigate" },
  { id: "context",  label: "Context",  icon: Terminal,  href: "/context",  group: "Navigate" },
  { id: "world",    label: "World",    icon: Network,   href: "/world",    group: "Navigate" },
  { id: "work",     label: "Work",     icon: Layers,    href: "/work",     group: "Navigate" },
  { id: "settings", label: "Settings", icon: Settings,  href: "/settings", group: "Navigate" },
];

const CONTEXT_SUGGESTIONS = [
  { id: "q1", label: "What should I know about Orion right now?", icon: Terminal, group: "Context Queries" },
  { id: "q2", label: "What changed since last week?",             icon: Terminal, group: "Context Queries" },
  { id: "q3", label: "What decisions are active?",                icon: Shield,   group: "Context Queries" },
  { id: "q4", label: "What are the current constraints?",         icon: Target,   group: "Context Queries" },
];

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const runNavItem = useCallback((href: string) => {
    router.push(href);
    onClose();
  }, [router, onClose]);

  const runContextQuery = useCallback((label: string) => {
    router.push(`/context?q=${encodeURIComponent(label)}`);
    onClose();
  }, [router, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[55] bg-foreground/10 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Palette */}
          <motion.div
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[60] w-full max-w-lg"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <Command
              className="bg-surface-1 border border-border-strong shadow-float rounded-xl overflow-hidden"
              shouldFilter
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
                <Search className="w-4 h-4 text-muted shrink-0" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Navigate, explore context, find entities..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
                  autoFocus
                />
                <kbd className="text-[10px] font-mono text-muted bg-surface-2 border border-border-subtle px-1.5 py-0.5 rounded">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[380px] overflow-y-auto p-2">
                <Command.Empty className="px-4 py-8 text-center text-sm text-muted">
                  No results for &ldquo;{query}&rdquo;
                </Command.Empty>

                {/* Navigation */}
                <Command.Group heading="Navigate" className="[&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-muted [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Command.Item
                        key={item.id}
                        value={item.label}
                        onSelect={() => runNavItem(item.href)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground cursor-pointer data-[selected=true]:bg-surface-2 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-muted" />
                        <span>{item.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted ml-auto opacity-0 data-[selected=true]:opacity-100" />
                      </Command.Item>
                    );
                  })}
                </Command.Group>

                <Command.Separator className="my-1 border-t border-border-subtle" />

                {/* Context Queries */}
                <Command.Group heading="Context Queries">
                  {CONTEXT_SUGGESTIONS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Command.Item
                        key={item.id}
                        value={item.label}
                        onSelect={() => runContextQuery(item.label)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground cursor-pointer data-[selected=true]:bg-surface-2 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-muted" />
                        <span className="truncate">&ldquo;{item.label}&rdquo;</span>
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              </Command.List>

              <div className="border-t border-border-subtle px-4 py-2 flex items-center gap-4 text-[10px] text-muted font-mono">
                <span><kbd className="bg-surface-2 border border-border-subtle rounded px-1">↑↓</kbd> navigate</span>
                <span><kbd className="bg-surface-2 border border-border-subtle rounded px-1">↵</kbd> select</span>
                <span><kbd className="bg-surface-2 border border-border-subtle rounded px-1">ESC</kbd> close</span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
