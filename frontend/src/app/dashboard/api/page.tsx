"use client";

import React from "react";
import { Key, Copy, Check, Terminal, ExternalLink, Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function ApiAccessPage() {
  const [copied, setCopied] = React.useState(false);

  const mcpCommand = `npx @metaphor/mcp-server --token="mcp_live_e93k..."`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mcpCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500 max-w-4xl mx-auto p-8">
      
      <header className="mb-10">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-2 flex items-center gap-2">
          <Key className="w-6 h-6 text-primary" /> API Access & MCP
        </h1>
        <p className="text-sm text-muted max-w-2xl">
          Connect your AI Consumers (Cursor, Claude Desktop, ChatGPT) to Metaphor using the Model Context Protocol.
        </p>
      </header>

      <div className="space-y-8">
        
        {/* Connection String Card */}
        <Card noPadding className="overflow-hidden">
          <div className="p-6 border-b border-border-subtle bg-surface-1/50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-foreground mb-1">MCP Connection Command</h2>
              <p className="text-xs text-muted">Run this in Cursor or add it to Claude Desktop config.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full text-xs font-semibold">
              <Shield className="w-3 h-3" /> Secure Token
            </div>
          </div>
          
          <div className="p-6 bg-surface-1">
            <div className="relative group">
              <pre className="p-4 bg-background border border-border-strong rounded-xl text-xs font-mono text-foreground overflow-x-auto">
                <code>{mcpCommand}</code>
              </pre>
              <button 
                onClick={handleCopy}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-surface-2 hover:bg-primary hover:text-white rounded-md text-muted transition-colors shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-success group-hover:text-white" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
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
