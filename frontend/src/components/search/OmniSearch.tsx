import React from "react";
import { Search } from "lucide-react";

export function OmniSearch() {
  return (
    <div className="w-full max-w-3xl mx-auto group">
      <div className="relative flex flex-col items-center">
        {/* Massive Search Input */}
        <input 
          type="text"
          placeholder="What would you like to think about?"
          className="w-full py-6 px-4 bg-transparent border-b-2 border-border-subtle outline-none text-foreground text-2xl md:text-3xl font-medium placeholder:text-muted/40 transition-colors focus:border-primary"
        />
        
        {/* Absolute positioned shortcut hint */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="px-2 py-1 bg-surface-2 rounded text-[11px] font-mono text-muted font-medium tracking-widest">
            ⌘ K
          </div>
        </div>
      </div>
    </div>
  );
}
