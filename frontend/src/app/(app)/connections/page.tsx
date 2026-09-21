"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Cpu, Key, Trash2, CheckCircle2 } from "lucide-react";

interface ConnectionItem {
  id: string;
  name: string;
  type: "mcp" | "oauth" | "api_key";
  endpoint?: string;
  account?: string;
  status: "connected" | "disconnected";
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<ConnectionItem[]>([
    {
      id: "c1",
      name: "GitHub OAuth",
      type: "oauth",
      account: "pseudonyms-dev",
      status: "connected",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [serverUrl, setServerUrl] = useState("");

  const handleAddServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUrl) return;
    setConnections((prev) => [
      ...prev,
      {
        id: `mcp-${Date.now()}`,
        name: serverUrl.replace(/^https?:\/\//, "").split("/")[0] || "Custom MCP",
        type: "mcp",
        endpoint: serverUrl,
        status: "connected",
      },
    ]);
    setServerUrl("");
    setShowAddModal(false);
  };

  const handleRemove = (id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  };

  const mcpServers = connections.filter((c) => c.type === "mcp");
  const oauthConnections = connections.filter((c) => c.type === "oauth");

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-16 md:py-24 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[rgba(10,10,10,0.06)] mb-12">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[#AEB7BC] mb-2">
            Workspace &middot; Infrastructure
          </div>
          <h1
            className="font-display text-[clamp(36px,4vw,48px)] leading-[1.05] tracking-[-0.01em] text-[var(--color-ink)]"
            style={{ fontWeight: 400 }}
          >
            Connections.
          </h1>
          <p className="text-[15px] text-[#555E64] mt-2 max-w-xl">
            Model Context Protocol (MCP) endpoints, OAuth tokens, and shared execution credentials.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[rgba(10,10,10,0.12)] bg-white/80 hover:bg-white hover:border-[var(--color-ink)] transition-all text-[13px] font-medium text-[var(--color-ink)] shadow-sm shrink-0 cursor-pointer"
        >
          <Plus size={14} />
          <span>Add MCP Server</span>
        </button>
      </div>

      {showAddModal && (
        <div className="mb-10 p-6 rounded-2xl border border-[rgba(10,10,10,0.1)] bg-white/60 backdrop-blur-md">
          <h3 className="text-[16px] font-medium text-[var(--color-ink)] mb-1">
            Register MCP Endpoint
          </h3>
          <p className="text-[13px] text-[#555E64] mb-4">
            Provide the SSE or stdio endpoint for your MCP server.
          </p>
          <form onSubmit={handleAddServer} className="flex gap-3">
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="e.g. http://localhost:8080/sse"
              required
              className="flex-1 px-3 py-2 bg-transparent border-b border-[rgba(10,10,10,0.2)] focus:border-[var(--color-ink)] outline-none text-[14px] text-[var(--color-ink)]"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[var(--color-ink)] text-white text-[13px] font-medium hover:bg-black transition-colors"
            >
              Connect
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-full border border-[rgba(10,10,10,0.12)] text-[13px] text-[#555E64] hover:text-[var(--color-ink)]"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-16">
        {/* MCP Section */}
        <section>
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,10,0.06)] mb-6">
            <div className="flex items-center gap-2">
              <Cpu size={15} className="text-[#555E64]" />
              <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#555E64]">
                Model Context Protocol (MCP)
              </h2>
            </div>
            <span className="text-[12px] font-mono text-[#AEB7BC]">
              {mcpServers.length} active
            </span>
          </div>

          {mcpServers.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full border border-[rgba(10,10,10,0.06)] flex items-center justify-center mb-3 text-[#AEB7BC]">
                <Cpu size={16} />
              </div>
              <h3
                className="text-[18px] text-[var(--color-ink)] mb-1"
                style={{
                  fontFamily: "'Cormorant Garamond', var(--next-font-display), serif",
                  fontStyle: "italic",
                }}
              >
                No servers connected yet
              </h3>
              <p className="text-[13px] text-[#555E64] max-w-sm mb-4">
                Connect your local or remote MCP servers to expose tools and resources across models.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-[12px] font-mono uppercase tracking-wider text-[var(--color-ink)] underline underline-offset-4 hover:opacity-75"
              >
                + Add first endpoint
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[rgba(10,10,10,0.06)]">
              {mcpServers.map((server) => (
                <div key={server.id} className="py-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-[14px] font-medium text-[var(--color-ink)]">
                      {server.name}
                    </h4>
                    <span className="text-[12px] font-mono text-[#AEB7BC]">
                      {server.endpoint}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(server.id)}
                    className="text-[#AEB7BC] hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* OAuth & Keys Section */}
        <section>
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(10,10,10,0.06)] mb-6">
            <div className="flex items-center gap-2">
              <Key size={15} className="text-[#555E64]" />
              <h2 className="text-[13px] font-mono uppercase tracking-wider text-[#555E64]">
                Authentication &amp; Credentials
              </h2>
            </div>
            <span className="text-[12px] font-mono text-[#AEB7BC]">
              {oauthConnections.length} connected
            </span>
          </div>

          <div className="flex flex-col divide-y divide-[rgba(10,10,10,0.06)]">
            {oauthConnections.map((conn) => (
              <div key={conn.id} className="py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-[14px] font-medium text-[var(--color-ink)]">
                      {conn.name}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  </div>
                  <span className="text-[12px] text-[#AEB7BC] font-mono">
                    Authenticated as @{conn.account}
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(conn.id)}
                  className="text-[12px] text-red-500 hover:text-red-700 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
