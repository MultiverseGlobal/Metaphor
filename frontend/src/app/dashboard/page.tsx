"use client";

import React, { useState, useEffect, useRef } from "react";
import { Command } from "lucide-react";
import TerminalWidget from "@/components/dashboard/widgets/TerminalWidget";
import KPIWidget from "@/components/dashboard/widgets/KPIWidget";
import DataTableWidget from "@/components/dashboard/widgets/DataTableWidget";
import GraphWidget from "@/components/dashboard/widgets/GraphWidget";

type LayoutType = "void" | "health" | "architecture" | "diagnostic";

export default function BentoMatrixOS() {
  const [activeLayout, setActiveLayout] = useState<LayoutType>("void");
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setActiveLayout("void");
        setQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.toLowerCase();
    
    if (q.includes("health") || q.includes("monitor")) {
      setActiveLayout("health");
    } else if (q.includes("arch") || q.includes("graph")) {
      setActiveLayout("architecture");
    } else if (q.includes("full") || q.includes("diag") || q.includes("all")) {
      setActiveLayout("diagnostic");
    } else {
      // Default fallback just to show something
      setActiveLayout("health");
    }
    
    // Clear input after execution
    setQuery("");
    inputRef.current?.blur();
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#050505]">
      
      {/* Omni-Prompt (Always available, but centered when void) */}
      <div className={`absolute z-50 transition-all duration-700 ease-in-out w-full max-w-2xl px-6 ${
        activeLayout === "void" 
          ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-100" 
          : "top-8 left-1/2 -translate-x-1/2 scale-90 opacity-70 hover:opacity-100"
      }`}>
        <form onSubmit={handleCommand} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-500"></div>
          <div className="relative bg-black/50 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl flex items-center p-2">
            <div className="pl-4 pr-3 text-muted-foreground">
              <Command className="w-5 h-5" />
            </div>
            <input 
              ref={inputRef}
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query the Matrix (e.g., 'monitor health', 'show architecture', 'full diagnostic')" 
              className="flex-1 bg-transparent border-none text-lg text-foreground placeholder:text-muted-foreground/50 py-3 outline-none"
            />
            <div className="px-3 py-1.5 mr-2 bg-white/5 rounded border border-white/10 text-xs font-mono text-muted-foreground hidden sm:block">
              ↵ Enter
            </div>
          </div>
        </form>
      </div>

      {/* The Generative Grid System */}
      <div className={`absolute inset-0 pt-32 pb-8 px-8 transition-opacity duration-700 ${activeLayout === "void" ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}`}>
        
        {/* Layout 1: Health Monitor (50/50 Split) */}
        {activeLayout === "health" && (
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
            <KPIWidget />
            <TerminalWidget />
          </div>
        )}

        {/* Layout 2: Architecture (Graph + Data) */}
        {activeLayout === "architecture" && (
          <div className="w-full h-full grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="lg:col-span-2">
              <GraphWidget />
            </div>
            <div className="lg:col-span-1">
              <DataTableWidget />
            </div>
          </div>
        )}

        {/* Layout 3: Full Diagnostic (Complex Bento) */}
        {activeLayout === "diagnostic" && (
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 animate-fade-in-up">
            <div className="md:col-span-1 md:row-span-1">
              <KPIWidget />
            </div>
            <div className="md:col-span-2 md:row-span-2">
              <GraphWidget />
            </div>
            <div className="md:col-span-1 md:row-span-1">
              <TerminalWidget />
            </div>
          </div>
        )}

      </div>
      
      {/* Void Background Glow (Only in void state) */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] transition-opacity duration-1000 ${activeLayout === "void" ? "opacity-100" : "opacity-0"}`}></div>
    </div>
  );
}
