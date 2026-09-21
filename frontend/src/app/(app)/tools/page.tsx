"use client";

import React from "react";
import { Check, Shield, Activity, Settings2 } from "lucide-react";

export default function ToolsPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 md:px-12 py-12 md:py-20 min-h-screen">
      <div className="space-y-4 mb-16">
        <h1 className="font-display text-[40px] leading-tight text-[#0A0A0A]">Tools & Capabilities</h1>
        <p className="text-[15px] text-[#6B7280] max-w-2xl" style={{ fontFamily: "Satoshi, sans-serif" }}>
          Manage the participants in your connected world. Review their capabilities, permissions, and health status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tool Card */}
        <div className="interactive-card p-5 rounded-2xl bg-white border border-[rgba(10,10,10,0.06)]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10A37F] text-white flex items-center justify-center font-bold text-[14px]">
                C
              </div>
              <div>
                <h3 className="font-semibold text-[#0A0A0A]" style={{ fontFamily: "Satoshi, sans-serif" }}>ChatGPT</h3>
                <span className="label-mono text-[#6B7280] mt-0.5 block">Reasoning Engine</span>
              </div>
            </div>
            <span className="pds-status-badge active">Healthy</span>
          </div>

          <div className="space-y-3 pt-4 border-t border-[rgba(10,10,10,0.06)]">
            <div className="flex items-center gap-2 text-[13px] text-[#374151]" style={{ fontFamily: "Satoshi, sans-serif" }}>
              <Shield size={14} className="text-[#6B7280]" />
              <span>Full read/write context access</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-[#374151]" style={{ fontFamily: "Satoshi, sans-serif" }}>
              <Activity size={14} className="text-[#6B7280]" />
              <span>Last active: 4 mins ago</span>
            </div>
          </div>
          
          <div className="mt-5 flex justify-end">
            <button className="btn-ghost min-h-[32px] text-[12px] px-3">Configure</button>
          </div>
        </div>

        {/* Tool Card */}
        <div className="interactive-card p-5 rounded-2xl bg-white border border-[rgba(10,10,10,0.06)]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-[14px]">
                G
              </div>
              <div>
                <h3 className="font-semibold text-[#0A0A0A]" style={{ fontFamily: "Satoshi, sans-serif" }}>GitHub</h3>
                <span className="label-mono text-[#6B7280] mt-0.5 block">Code Repository</span>
              </div>
            </div>
            <span className="pds-status-badge active">Healthy</span>
          </div>

          <div className="space-y-3 pt-4 border-t border-[rgba(10,10,10,0.06)]">
            <div className="flex items-center gap-2 text-[13px] text-[#374151]" style={{ fontFamily: "Satoshi, sans-serif" }}>
              <Shield size={14} className="text-[#6B7280]" />
              <span>Read-only repository access</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-[#374151]" style={{ fontFamily: "Satoshi, sans-serif" }}>
              <Activity size={14} className="text-[#6B7280]" />
              <span>Last active: 1 hour ago</span>
            </div>
          </div>
          
          <div className="mt-5 flex justify-end">
            <button className="btn-ghost min-h-[32px] text-[12px] px-3">Configure</button>
          </div>
        </div>
      </div>
    </div>
  );
}
