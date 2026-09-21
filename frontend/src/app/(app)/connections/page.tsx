"use client";

import { Link as LinkIcon, Puzzle, Cpu } from "lucide-react";

export default function ConnectionsPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 md:px-12 py-12 md:py-20 min-h-screen">
      <div className="space-y-4 mb-16">
        <h1 className="font-display text-[40px] leading-tight text-[#0A0A0A]">Connections</h1>
        <p className="text-[15px] text-[#6B7280] max-w-2xl" style={{ fontFamily: "Satoshi, sans-serif" }}>
          Manage your MCP servers, API keys, and OAuth connections.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Section: MCP Servers */}
        <section>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[rgba(10,10,10,0.06)]">
            <Cpu size={18} className="text-[#0A0A0A]" />
            <h2 className="text-[16px] font-semibold text-[#0A0A0A]" style={{ fontFamily: "Satoshi, sans-serif" }}>MCP Servers</h2>
          </div>
          <div className="bg-white border border-[rgba(10,10,10,0.06)] rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[rgba(10,10,10,0.04)] flex items-center justify-center text-[#6B7280]">
              <Puzzle size={24} />
            </div>
            <p className="text-[14px] text-[#374151]" style={{ fontFamily: "Satoshi, sans-serif" }}>
              No custom MCP servers configured yet.
            </p>
            <button className="btn-ghost mt-2 min-h-[36px] text-[13px]">Add Server</button>
          </div>
        </section>

        {/* Section: OAuth Connections */}
        <section>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[rgba(10,10,10,0.06)]">
            <LinkIcon size={18} className="text-[#0A0A0A]" />
            <h2 className="text-[16px] font-semibold text-[#0A0A0A]" style={{ fontFamily: "Satoshi, sans-serif" }}>OAuth & API Keys</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl border border-[rgba(10,10,10,0.06)] bg-[#F9FAFB]">
              <div>
                <h3 className="font-medium text-[#0A0A0A] text-[14px]" style={{ fontFamily: "Satoshi, sans-serif" }}>GitHub</h3>
                <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: "Satoshi, sans-serif" }}>Connected as @user</p>
              </div>
              <button className="text-[12px] text-[#DC2626] font-medium hover:underline">Disconnect</button>
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
}
