import React from "react";
import { Command, Search } from "lucide-react";

export function OmniSearch() {
  return (
    <div className="w-full max-w-2xl mx-auto group">
      <div className="relative flex items-center bg-surface-1 rounded-2xl shadow-md border border-border-strong overflow-hidden transition-all duration-300 hover:shadow-lg focus-within:shadow-lg focus-within:border-primary/50">
        <div className="pl-6 text-primary">
          <Search className="w-5 h-5" />
        </div>
        <input 
          type="text"
          placeholder="Ask anything or type a command..."
          className="w-full py-4 px-4 bg-transparent border-none outline-none text-foreground text-lg placeholder:text-muted/60"
        />
        <div className="pr-6 flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
          <div className="px-2 py-1 bg-surface-2 border border-border-subtle rounded flex items-center justify-center">
            <Command className="w-3 h-3 text-muted" />
          </div>
          <div className="px-2 py-1 bg-surface-2 border border-border-subtle rounded text-[10px] font-mono text-muted">
            K
          </div>
        </div>
      </div>
    </div>
  );
}
