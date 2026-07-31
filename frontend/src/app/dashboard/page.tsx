"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchFromMetaphor } from "../api";

import ObsidianHUDLayout from "@/components/layouts/ObsidianHUDLayout";
import ScifiTerminalLayout from "@/components/layouts/ScifiTerminalLayout";
import SpatialCanvasLayout from "@/components/layouts/SpatialCanvasLayout";
import EditorialLayout from "@/components/layouts/EditorialLayout";
import MinimalistGridLayout from "@/components/layouts/MinimalistGridLayout";

export default function Dashboard() {
  const router = useRouter();
  
  const [theme, setTheme] = useState("spatial");
  
  // Loaded Context Data States
  const [snapshot, setSnapshot] = useState<any>(null);
  const [inboxData, setInboxData] = useState<any>({ pending_nodes: [], pending_edges: [], clarifications: [] });
  const [loading, setLoading] = useState(true);

  // Credentials config
  const [apiKey, setApiKey] = useState("metaphor_dev_secret_key_123");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiKey(localStorage.getItem("metaphor_api_key") || "metaphor_dev_secret_key_123");
      const savedTheme = localStorage.getItem("metaphor_theme") || "spatial";
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      loadAllData();
    }
  }, [router]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("metaphor_theme", newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSnapshot(),
        loadInboxData()
      ]);
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadSnapshot = async () => {
    setTimeout(() => {
      setSnapshot({
        mission: "Develop the Metaphor universal context operating system to align all connected AI agents.",
        active_projects: [
          { id: "p1", name: "Metaphor Core", type: "Project" },
          { id: "p2", name: "Atlas Portal", type: "Project" },
          { id: "p3", name: "Knowledge Ingestion", type: "System" }
        ],
        confidence: 0.88
      });
    }, 500);
  };

  const loadInboxData = async () => {
    setTimeout(() => {
      setInboxData({
        pending_nodes: [
          { id: "pn1", name: "Increase Atlas pricing to $500", type: "Decision" },
          { id: "pn2", name: "Deploy Postgres + pgvector", type: "Architecture" }
        ]
      });
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-t-2 border-primary animate-spin mb-4" />
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Booting OS...</span>
        </div>
      </div>
    );
  }

  // Master Theme Router
  switch (theme) {
    case "obsidian":
      return <ObsidianHUDLayout snapshot={snapshot} inboxData={inboxData} theme={theme} onThemeChange={handleThemeChange} />;
    case "scifi":
      return <ScifiTerminalLayout snapshot={snapshot} inboxData={inboxData} theme={theme} onThemeChange={handleThemeChange} />;
    case "spatial":
      return <SpatialCanvasLayout snapshot={snapshot} inboxData={inboxData} theme={theme} onThemeChange={handleThemeChange} />;
    case "editorial":
      return <EditorialLayout snapshot={snapshot} inboxData={inboxData} theme={theme} onThemeChange={handleThemeChange} />;
    case "minimalist":
    default:
      return <MinimalistGridLayout snapshot={snapshot} inboxData={inboxData} theme={theme} onThemeChange={handleThemeChange} />;
  }
}
