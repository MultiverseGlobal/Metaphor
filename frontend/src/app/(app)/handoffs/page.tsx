"use client";

import React from "react";
import { ArrowRight, GitMerge, FileText } from "lucide-react";

export default function HandoffsPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 md:px-12 py-12 md:py-20 min-h-screen">
      <div className="space-y-4 mb-16">
        <h1 className="font-display text-[40px] leading-tight text-[#0A0A0A]">Handoffs</h1>
        <p className="text-[15px] text-[#6B7280] max-w-2xl" style={{ fontFamily: "Satoshi, sans-serif" }}>
          Track the flow of context between your connected tools. Review what was passed, when, and why.
        </p>
      </div>

      <div className="space-y-4 relative pl-4 before:absolute before:inset-y-0 before:left-[11px] before:w-[1px] before:bg-[rgba(10,10,10,0.06)]">
        
        {/* Handoff Event 1 */}
        <div className="relative pl-6 pb-8">
          <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-[#10A37F] ring-4 ring-white" />
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[13px] font-semibold text-[#10A37F]" style={{ fontFamily: "Satoshi, sans-serif" }}>ChatGPT</span>
            <ArrowRight size={12} className="text-[#6B7280]" />
            <span className="text-[13px] font-semibold text-[#0A0A0A]" style={{ fontFamily: "Satoshi, sans-serif" }}>GitHub</span>
            <span className="text-[12px] text-[#6B7280] ml-2">• 10 mins ago</span>
          </div>
          
          <div className="interactive-card p-4 rounded-xl bg-white border border-[rgba(10,10,10,0.06)] mt-2">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-[#6B7280]"><GitMerge size={16} /></div>
              <div>
                <p className="text-[14px] text-[#0A0A0A] font-medium" style={{ fontFamily: "Satoshi, sans-serif" }}>
                  Drafted PR description for Auth Module refactor
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="label-mono text-[#6366F1] bg-[rgba(99,102,241,0.08)] px-2 py-0.5 rounded">#AUTH-123</span>
                  <span className="text-[12px] text-[#6B7280]" style={{ fontFamily: "Satoshi, sans-serif" }}>Passed 12 files of context</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Handoff Event 2 */}
        <div className="relative pl-6">
          <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-[#6366F1] ring-4 ring-white" />
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[13px] font-semibold text-[#6366F1]" style={{ fontFamily: "Satoshi, sans-serif" }}>Notion</span>
            <ArrowRight size={12} className="text-[#6B7280]" />
            <span className="text-[13px] font-semibold text-[#10A37F]" style={{ fontFamily: "Satoshi, sans-serif" }}>ChatGPT</span>
            <span className="text-[12px] text-[#6B7280] ml-2">• 2 hours ago</span>
          </div>
          
          <div className="interactive-card p-4 rounded-xl bg-white border border-[rgba(10,10,10,0.06)] mt-2">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-[#6B7280]"><FileText size={16} /></div>
              <div>
                <p className="text-[14px] text-[#0A0A0A] font-medium" style={{ fontFamily: "Satoshi, sans-serif" }}>
                  Loaded Product Requirements Document
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[12px] text-[#6B7280]" style={{ fontFamily: "Satoshi, sans-serif" }}>Updated context window for reasoning engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
