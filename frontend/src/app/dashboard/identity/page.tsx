"use client";

import React, { useState } from "react";
import { User, Target, PenTool, Hash } from "lucide-react";

export default function IdentityEnginePage() {
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");

  // Mock auto-save handler
  const handleBlur = () => {
    setSaveState("saving");
    setTimeout(() => {
      setSaveState("saved");
    }, 800);
  };

  return (
    <div className="max-w-3xl animate-in">
      <header className="mb-12">
        <h1 className="text-2xl text-foreground font-medium mb-2">Identity Engine</h1>
        <p className="text-muted text-sm leading-relaxed max-w-xl">
          Define the persistent P0 context that Metaphor appends to every AI interaction. This establishes your core profile, mission, and communication style.
        </p>
      </header>

      <div className="space-y-12">
        {/* Core Profile */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <User className="w-4 h-4 text-muted" />
            <h2 className="text-sm font-medium text-foreground tracking-wide uppercase">Core Profile</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-muted mb-2 uppercase tracking-wider">Name / Alias</label>
              <input 
                type="text"
                defaultValue="William"
                onBlur={handleBlur}
                className="w-full bg-surface-1 border border-subtle rounded-md px-4 py-3 text-sm text-foreground focus:outline-none focus:border-strong transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-2 uppercase tracking-wider">Mission Statement</label>
              <textarea 
                defaultValue="Build Multiverse Global Enterprises"
                onBlur={handleBlur}
                rows={3}
                className="w-full bg-surface-1 border border-subtle rounded-md px-4 py-3 text-sm text-foreground focus:outline-none focus:border-strong transition-colors resize-none"
              />
            </div>
          </div>
        </section>

        {/* Communication Rules */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <PenTool className="w-4 h-4 text-muted" />
            <h2 className="text-sm font-medium text-foreground tracking-wide uppercase">Communication</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-muted mb-2 uppercase tracking-wider">Writing Style</label>
              <textarea 
                defaultValue="Direct, technical, concise. Avoids jargon unless domain-specific. Never use 'In conclusion' or 'Therefore'."
                onBlur={handleBlur}
                rows={4}
                className="w-full bg-surface-1 border border-subtle rounded-md px-4 py-3 text-sm text-foreground focus:outline-none focus:border-strong transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-muted mb-2 uppercase tracking-wider">Preferred Terms (Do Use)</label>
                <textarea 
                  defaultValue="Context Engine\nKnowledge Graph\nIdentity Model\nNodes"
                  onBlur={handleBlur}
                  rows={4}
                  className="w-full bg-surface-1 border border-subtle rounded-md px-4 py-3 text-sm text-foreground focus:outline-none focus:border-strong transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-2 uppercase tracking-wider">Banned Terms (Do Not Use)</label>
                <textarea 
                  defaultValue="Second Brain\nDigital Twin\nLore\nChatbot"
                  onBlur={handleBlur}
                  rows={4}
                  className="w-full bg-surface-1 border border-subtle rounded-md px-4 py-3 text-sm text-foreground focus:outline-none focus:border-strong transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Fixed Save State Indicator */}
      <div className="fixed bottom-8 right-8 flex items-center gap-2 text-xs text-muted font-medium bg-surface-1 border border-subtle px-3 py-1.5 rounded-full shadow-sm">
        {saveState === "saving" ? (
          <>
            <div className="w-2 h-2 rounded-full border-2 border-muted border-t-transparent animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-green-500/50" />
            Synchronized
          </>
        )}
      </div>
    </div>
  );
}
