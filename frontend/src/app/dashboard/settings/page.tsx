"use client";

import React from "react";
import { Settings, Moon, Sun, Monitor, Bell, Database } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-150 max-w-3xl mx-auto p-8">
      
      <header className="mb-10">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-2 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" /> Settings
        </h1>
        <p className="text-sm text-muted">Manage your OS preferences and ingestion behaviors.</p>
      </header>

      <div className="space-y-8">
        
        {/* Appearance */}
        <section>
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">Appearance</h2>
          <div className="grid grid-cols-3 gap-4">
            <button className="flex flex-col items-center gap-3 p-4 bg-surface-1 border-2 border-primary rounded-xl cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-background border border-border-strong flex items-center justify-center shadow-inner text-foreground">
                <Sun className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-foreground">Clean (Light)</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-4 bg-surface-1 border border-border-subtle hover:border-primary/50 rounded-xl cursor-pointer transition-colors">
              <div className="w-10 h-10 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center shadow-inner text-stone-200">
                <Moon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-muted">Deep (Dark)</span>
            </button>
            <button className="flex flex-col items-center gap-3 p-4 bg-surface-1 border border-border-subtle hover:border-primary/50 rounded-xl cursor-pointer transition-colors">
              <div className="w-10 h-10 rounded-full bg-background border border-border-strong flex items-center justify-center shadow-inner text-muted">
                <Monitor className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-muted">System</span>
            </button>
          </div>
        </section>

        {/* Behavior */}
        <section>
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">Engine Behavior</h2>
          <Card noPadding className="divide-y divide-border-subtle">
            <div className="p-5 flex items-center justify-between hover:bg-surface-2/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <Database className="w-5 h-5 text-muted" />
                <div>
                  <h3 className="text-sm font-medium text-foreground">Passive Ingestion Mode</h3>
                  <p className="text-xs text-muted mt-0.5">Allow webhooks to automatically create Nodes without approval.</p>
                </div>
              </div>
              <div className="w-10 h-6 bg-success rounded-full relative shadow-inner">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            
            <div className="p-5 flex items-center justify-between hover:bg-surface-2/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <Bell className="w-5 h-5 text-muted" />
                <div>
                  <h3 className="text-sm font-medium text-foreground">Clarification Notifications</h3>
                  <p className="text-xs text-muted mt-0.5">Notify me when the engine encounters conflicting truths.</p>
                </div>
              </div>
              <div className="w-10 h-6 bg-surface-2 border border-border-strong rounded-full relative shadow-inner">
                <div className="absolute left-1 top-1 w-4 h-4 bg-muted rounded-full" />
              </div>
            </div>
          </Card>
        </section>

      </div>
    </div>
  );
}
