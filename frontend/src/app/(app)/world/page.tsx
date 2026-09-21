"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Code, GitPullRequest, ArrowRight, Activity, Plus } from "lucide-react";

export default function ConnectedWorldPage() {
  const [tools, setTools] = useState<string[]>(["ChatGPT", "GitHub", "Notion"]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-12 md:py-20 min-h-screen">
      
      {/* Top Header & Visual Diagram Section */}
      <div className="flex flex-col lg:flex-row gap-16 mb-24 items-center">
        
        {/* Left: Heading & Intro */}
        <div className="flex-1 space-y-6 z-10">
          <div className="flex items-center gap-3">
            <span className="status-dot active bg-[#6366F1]" />
            <span className="label-mono text-[#6366F1]">System Active</span>
          </div>
          <h1 className="font-display text-[clamp(40px,5vw,64px)] leading-[1.05] tracking-[-0.02em] text-[#0A0A0A]">
            Your Connected World
          </h1>
          <p className="text-[17px] text-[#6B7280] leading-relaxed max-w-md" style={{ fontFamily: "Satoshi, sans-serif" }}>
            Metaphor is actively synchronizing context between your tools. 
            No manual project creation needed—just set the direction, and the network handles the rest.
          </p>
          
          <div className="pt-6">
            <button className="btn-primary group">
              <span>Set a new direction</span>
              <ArrowRight size={15} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right/Center: Diagram */}
        <div className="flex-1 relative w-full h-[400px] flex items-center justify-center">
          {/* Faint grid background */}
          <div className="absolute inset-0 metaphor-dot-grid opacity-50" />
          
          {/* SVG Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Lines from center to tools */}
            <path d="M 50% 50% L 20% 30%" stroke="rgba(99,102,241,0.2)" strokeWidth="1" strokeDasharray="4 4" className="flora-wire-active" />
            <path d="M 50% 50% L 80% 30%" stroke="rgba(99,102,241,0.2)" strokeWidth="1" strokeDasharray="4 4" className="flora-wire-active" />
            <path d="M 50% 50% L 50% 80%" stroke="rgba(99,102,241,0.2)" strokeWidth="1" strokeDasharray="4 4" className="flora-wire-active" />
          </svg>

          {/* Central Metaphor Node */}
          <motion.div 
            className="absolute z-10 w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-lg border border-[rgba(99,102,241,0.3)]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="absolute -inset-1 rounded-full border border-[#6366F1] opacity-20 animate-pulse-slow" />
            <span className="font-display font-semibold text-lg text-[#0A0A0A]">Metaphor</span>
          </motion.div>

          {/* Tool Nodes */}
          {/* Tool 1 */}
          <motion.div 
            className="absolute z-10 left-[10%] top-[20%] w-auto px-4 py-2 bg-white rounded-xl shadow-sm border border-[rgba(10,10,10,0.08)] flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-2 h-2 rounded-full bg-[#10A37F]" />
            <span className="text-sm font-medium" style={{ fontFamily: "Satoshi, sans-serif" }}>ChatGPT</span>
          </motion.div>

          {/* Tool 2 */}
          <motion.div 
            className="absolute z-10 right-[10%] top-[20%] w-auto px-4 py-2 bg-white rounded-xl shadow-sm border border-[rgba(10,10,10,0.08)] flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-2 h-2 rounded-full bg-[#0A0A0A]" />
            <span className="text-sm font-medium" style={{ fontFamily: "Satoshi, sans-serif" }}>GitHub</span>
          </motion.div>

          {/* Tool 3 */}
          <motion.div 
            className="absolute z-10 bottom-[10%] w-auto px-4 py-2 bg-white rounded-xl shadow-sm border border-[rgba(10,10,10,0.08)] flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
            <span className="text-sm font-medium" style={{ fontFamily: "Satoshi, sans-serif" }}>Antigravity</span>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
        
        {/* Waiting for you */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between border-b border-[rgba(10,10,10,0.06)] pb-3">
            <h2 className="text-[13px] uppercase tracking-widest text-[#6B7280] font-semibold" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              Waiting for you
            </h2>
            <span className="w-5 h-5 rounded-full bg-[#6366F1] text-white text-[10px] flex items-center justify-center font-bold">
              2
            </span>
          </div>

          <div className="space-y-4">
            {/* Item 1 */}
            <div className="group interactive-card p-4 rounded-2xl bg-white border border-[rgba(10,10,10,0.06)] cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[rgba(99,102,241,0.08)] text-[#6366F1] flex items-center justify-center shrink-0">
                  <Check size={16} strokeWidth={2.5} />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-[14px] font-semibold text-[#0A0A0A]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                    Review Refactoring Plan
                  </h3>
                  <p className="text-[13px] text-[#6B7280] leading-relaxed" style={{ fontFamily: "Satoshi, sans-serif" }}>
                    Antigravity proposed a structure change for the auth module. Requires your approval to proceed.
                  </p>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="group interactive-card p-4 rounded-2xl bg-white border border-[rgba(10,10,10,0.06)] cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F9FAFB] border border-[rgba(10,10,10,0.06)] flex items-center justify-center shrink-0 text-[#0A0A0A]">
                  <GitPullRequest size={16} />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-[14px] font-semibold text-[#0A0A0A]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                    Draft PR Description
                  </h3>
                  <p className="text-[13px] text-[#6B7280] leading-relaxed" style={{ fontFamily: "Satoshi, sans-serif" }}>
                    ChatGPT needs clarification on the specific Jira ticket number to reference.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Movement */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-[rgba(10,10,10,0.06)] pb-3">
            <h2 className="text-[13px] uppercase tracking-widest text-[#6B7280] font-semibold" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              Recent movement
            </h2>
            <Activity size={16} className="text-[#6B7280]" />
          </div>

          <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-[1px] before:bg-gradient-to-b before:from-[rgba(10,10,10,0.1)] before:to-transparent">
            
            {/* Stream Row 1 */}
            <div className="relative pl-6">
              <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-[#0A0A0A] ring-4 ring-white" />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-semibold" style={{ fontFamily: "Satoshi, sans-serif", color: "#0A0A0A" }}>GitHub</span>
                <span className="text-[12px] text-[#6B7280]">• 10m ago</span>
              </div>
              <p className="text-[14px] text-[#374151]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                Merged pull request #42 from <span className="font-mono text-[12px] bg-[rgba(10,10,10,0.04)] px-1 rounded">feature/auth</span>
              </p>
            </div>

            {/* Stream Row 2 */}
            <div className="relative pl-6">
              <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-[#10A37F] ring-4 ring-white" />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-semibold" style={{ fontFamily: "Satoshi, sans-serif", color: "#10A37F" }}>ChatGPT</span>
                <span className="text-[12px] text-[#6B7280]">• 45m ago</span>
              </div>
              <p className="text-[14px] text-[#374151]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                Updated the architecture document based on the latest codebase changes.
              </p>
            </div>

            {/* Stream Row 3 */}
            <div className="relative pl-6">
              <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-[#6366F1] ring-4 ring-white" />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-semibold" style={{ fontFamily: "Satoshi, sans-serif", color: "#6366F1" }}>Metaphor Engine</span>
                <span className="text-[12px] text-[#6B7280]">• 1h ago</span>
              </div>
              <p className="text-[14px] text-[#374151]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                Synchronized context across 3 tools for the new feature sprint.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
