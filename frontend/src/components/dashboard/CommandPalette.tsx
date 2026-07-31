import React, { useState } from "react";
import { Command, Network } from "lucide-react";

export default function CommandPalette() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="fixed top-10 left-[40%] -translate-x-1/2 w-full max-w-2xl z-50 animate-fade-in-down">
      <div className={`transition-all duration-300 rounded-2xl ${isFocused ? "shadow-[0_0_40px_rgba(6,182,212,0.2)]" : "shadow-[0_15px_50px_rgba(0,0,0,0.6)]"}`}>
        <div className={`p-1 bg-surface/80 backdrop-blur-3xl rounded-2xl border transition-colors duration-300 ${isFocused ? "border-primary/50" : "border-border/60"}`}>
          <div className="flex items-center gap-4 px-5 py-4">
            <Command className={`w-5 h-5 transition-colors ${isFocused ? "text-primary" : "text-muted-foreground"}`} />
            <input 
              type="text" 
              value={searchQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query Metaphor OS..." 
              className="flex-1 bg-transparent border-none text-lg outline-none placeholder:text-muted-foreground/60 font-medium text-foreground tracking-wide"
            />
            <div className="px-2.5 py-1 bg-background/80 rounded border border-border/50 text-[10px] font-mono text-muted-foreground tracking-widest shadow-inner">
              ⌘K
            </div>
          </div>
          
          {searchQuery && (
            <div className="px-3 pb-3 pt-1 border-t border-border/50">
              <p className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-widest px-3 py-2">Context Matches</p>
              <div className="space-y-1">
                 <div className="px-4 py-3 bg-background/50 rounded-xl border border-transparent hover:border-border hover:bg-surface cursor-pointer transition-all flex items-center gap-3">
                    <Network className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Searching for "{searchQuery}"...</span>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
