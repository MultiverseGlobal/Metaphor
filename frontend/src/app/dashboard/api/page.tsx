"use client";

import React, { useEffect, useState } from "react";
import { Key, Copy, Check, Terminal, ExternalLink, Shield, Plus, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { fetchFromMetaphor } from "../../api";

type ApiKey = {
  id: string;
  name: string;
  preview: string;
  last_used: string | null;
  raw_token?: string; // Only present right after creation
};

export default function ApiAccessPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const data = await fetchFromMetaphor("/auth/apikeys");
      setKeys(data);
    } catch (e) {
      console.error("Failed to load API keys", e);
    }
  };

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    try {
      const newKey = await fetchFromMetaphor("/auth/apikeys", undefined, "POST");
      setKeys(prev => [newKey, ...prev]);
    } catch (e) {
      console.error("Failed to generate API key", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMcpCommand = (token: string) => `npx @metaphor/mcp-server --token="${token}"`;

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500 max-w-4xl mx-auto p-8 overflow-y-auto">
      
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-2 flex items-center gap-2">
            <Key className="w-6 h-6 text-primary" /> API Access & MCP
          </h1>
          <p className="text-sm text-muted max-w-2xl">
            Connect your AI Consumers (Cursor, Claude Desktop, ChatGPT) to Metaphor using the Model Context Protocol.
          </p>
        </div>
        <button 
          onClick={handleGenerateKey}
          disabled={isGenerating}
          className="px-4 py-2 bg-foreground text-background rounded-xl text-sm font-semibold shadow-md hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? <div className="w-4 h-4 border-2 border-background/20 border-t-background rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
          Generate New Token
        </button>
      </header>

      <div className="space-y-8 pb-32">
        
        {/* Connection Strings Card */}
        <Card noPadding className="overflow-hidden">
          <div className="p-6 border-b border-border-subtle bg-surface-1/50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-foreground mb-1">Active Tokens</h2>
              <p className="text-xs text-muted">Use these tokens to authenticate your MCP server.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full text-xs font-semibold">
              <Shield className="w-3 h-3" /> Secure Connection
            </div>
          </div>
          
          <div className="divide-y divide-border-subtle">
            {keys.length === 0 && (
              <div className="p-8 text-center text-muted text-sm">
                No API keys generated yet. Click "Generate New Token" to get started.
              </div>
            )}
            
            {keys.map(k => (
              <div key={k.id} className="p-6 bg-surface-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Lock className="w-4 h-4 text-muted" /> {k.name}
                  </div>
                  {k.raw_token && (
                    <div className="text-[10px] font-bold text-warning uppercase tracking-widest bg-warning/10 px-2 py-0.5 rounded">
                      Copy this now. You won't see it again.
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <pre className={`p-4 ${k.raw_token ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-background border-border-strong text-foreground'} border rounded-xl text-xs font-mono overflow-x-auto`}>
                    <code>{getMcpCommand(k.raw_token || k.preview)}</code>
                  </pre>
                  <button 
                    onClick={() => handleCopy(k.id, getMcpCommand(k.raw_token || k.preview))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-surface-2 hover:bg-primary hover:text-white rounded-md text-muted transition-colors shadow-sm"
                  >
                    {copiedId === k.id ? <Check className="w-4 h-4 text-success group-hover:text-white" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-foreground mb-4">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Connecting to Cursor</h3>
            <p className="text-xs text-muted leading-relaxed mb-4">
              Open Cursor Settings &gt; Features &gt; MCP Servers. Add a new server using the command above. Cursor will now automatically query your Context Engine.
            </p>
            <a href="#" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              Read Docs <ExternalLink className="w-3 h-3" />
            </a>
          </Card>
          
          <Card>
            <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-foreground mb-4">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Connecting to Claude Desktop</h3>
            <p className="text-xs text-muted leading-relaxed mb-4">
              Add the connection command to your `claude_desktop_config.json` file. Claude will be able to read your projects and save new memories.
            </p>
            <a href="#" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              Read Docs <ExternalLink className="w-3 h-3" />
            </a>
          </Card>
        </div>

      </div>
    </div>
  );
}
