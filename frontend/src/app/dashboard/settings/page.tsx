"use client";

import React, { useState, useEffect } from "react";
import { Settings, Moon, Sun, Monitor, Bell, Database } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { fetchFromMetaphor } from "@/app/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: "system",
    passiveIngestion: true,
    clarificationNotifications: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const user = await fetchFromMetaphor("/auth/me");
        if (user.settings) {
          setSettings(prev => ({ ...prev, ...user.settings }));
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const updateSetting = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      const user = await fetchFromMetaphor("/auth/me");
      await fetchFromMetaphor("/auth/me", {
        name: user.name,
        settings: newSettings
      });
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  };

  if (loading) return null;

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
            <button onClick={() => updateSetting("theme", "light")} className={`flex flex-col items-center gap-3 p-4 bg-surface-1 border ${settings.theme === 'light' ? 'border-primary' : 'border-border-subtle'} hover:border-primary/50 rounded-xl cursor-pointer transition-colors`}>
              <div className="w-10 h-10 rounded-full bg-background border border-border-strong flex items-center justify-center shadow-inner text-foreground">
                <Sun className="w-5 h-5" />
              </div>
              <span className={`text-xs font-semibold ${settings.theme === 'light' ? 'text-foreground' : 'text-muted'}`}>Clean (Light)</span>
            </button>
            <button onClick={() => updateSetting("theme", "dark")} className={`flex flex-col items-center gap-3 p-4 bg-surface-1 border ${settings.theme === 'dark' ? 'border-primary' : 'border-border-subtle'} hover:border-primary/50 rounded-xl cursor-pointer transition-colors`}>
              <div className="w-10 h-10 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center shadow-inner text-stone-200">
                <Moon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-semibold ${settings.theme === 'dark' ? 'text-foreground' : 'text-muted'}`}>Deep (Dark)</span>
            </button>
            <button onClick={() => updateSetting("theme", "system")} className={`flex flex-col items-center gap-3 p-4 bg-surface-1 border ${settings.theme === 'system' ? 'border-primary' : 'border-border-subtle'} hover:border-primary/50 rounded-xl cursor-pointer transition-colors`}>
              <div className="w-10 h-10 rounded-full bg-background border border-border-strong flex items-center justify-center shadow-inner text-muted">
                <Monitor className="w-5 h-5" />
              </div>
              <span className={`text-xs font-semibold ${settings.theme === 'system' ? 'text-foreground' : 'text-muted'}`}>System</span>
            </button>
          </div>
        </section>

        {/* Behavior */}
        <section>
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">Engine Behavior</h2>
          <Card noPadding className="divide-y divide-border-subtle">
            <div onClick={() => updateSetting("passiveIngestion", !settings.passiveIngestion)} className="p-5 flex items-center justify-between hover:bg-surface-2/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <Database className="w-5 h-5 text-muted" />
                <div>
                  <h3 className="text-sm font-medium text-foreground">Passive Ingestion Mode</h3>
                  <p className="text-xs text-muted mt-0.5">Allow webhooks to automatically create Nodes without approval.</p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full relative shadow-inner transition-colors ${settings.passiveIngestion ? 'bg-success' : 'bg-surface-2 border border-border-strong'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${settings.passiveIngestion ? 'right-1 bg-white shadow-sm' : 'left-1 bg-muted'}`} />
              </div>
            </div>
            
            <div onClick={() => updateSetting("clarificationNotifications", !settings.clarificationNotifications)} className="p-5 flex items-center justify-between hover:bg-surface-2/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <Bell className="w-5 h-5 text-muted" />
                <div>
                  <h3 className="text-sm font-medium text-foreground">Clarification Notifications</h3>
                  <p className="text-xs text-muted mt-0.5">Notify me when the engine encounters conflicting truths.</p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full relative shadow-inner transition-colors ${settings.clarificationNotifications ? 'bg-success' : 'bg-surface-2 border border-border-strong'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${settings.clarificationNotifications ? 'right-1 bg-white shadow-sm' : 'left-1 bg-muted'}`} />
              </div>
            </div>
          </Card>
        </section>

      </div>
    </div>
  );
}
