"use client";

import React, { useState, useEffect } from "react";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { WeavePanel } from "@/components/WeavePanel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isWeavePanelOpen, setIsWeavePanelOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const { fetchFromMetaphor } = await import("@/app/api");
        const data = await fetchFromMetaphor("/auth/me");

        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const sbUser = session?.user;
        const storedCustomName = typeof window !== "undefined" ? localStorage.getItem("metaphor_user_name") : null;

        const googleFullName = sbUser?.user_metadata?.full_name || sbUser?.user_metadata?.name;
        const emailPrefix = sbUser?.email ? sbUser.email.split("@")[0] : null;
        const emailFirstWord = emailPrefix ? emailPrefix.replace(/[^a-zA-Z]/g, " ").trim().split(" ")[0] : null;
        const cleanEmailName = emailFirstWord && emailFirstWord.length >= 3 && emailFirstWord.length <= 10
          ? emailFirstWord.charAt(0).toUpperCase() + emailFirstWord.slice(1)
          : null;
        const fallbackName = googleFullName || cleanEmailName || "Your Workspace";
        const fallbackEmail = sbUser?.email || "workspace@metaphor.os";

        const isGenericName = !data?.name || data.name === "Developer User" || data.name === "Supabase User";
        const resolvedName = storedCustomName || (!isGenericName ? data.name : fallbackName);
        setUser({
          name: resolvedName,
          email: data?.email || fallbackEmail,
        });
      } catch (e) {
        const storedCustomName = typeof window !== "undefined" ? localStorage.getItem("metaphor_user_name") : null;
        setUser({ name: storedCustomName || "Sovereign User", email: "sovereign@local" });
      }
    }
    fetchUser();

    // Cloud Sync
    import("@/lib/settings").then((m) => m.pullSettingsFromCloud());

    const handleProfileUpdate = () => {
      fetchUser();
      import("@/lib/settings").then((m) => m.pushSettingsToCloud());
    };
    window.addEventListener("user-profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("user-profile-updated", handleProfileUpdate);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-background overflow-hidden text-sm selection:bg-primary/20">
      
      {/* Ecosystem Floating Top Navigation Bar */}
      <FloatingNav
        isWeaveOpen={isWeavePanelOpen}
        onToggleWeave={() => setIsWeavePanelOpen((o) => !o)}
        user={user}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex overflow-hidden pt-12 relative">
        <main className="flex-1 overflow-y-auto relative bg-background">
          {children}
        </main>

        {/* Weave Panel — Collapsible right side drawer */}
        <aside
          style={{
            width: isWeavePanelOpen ? 340 : 0,
            minWidth: isWeavePanelOpen ? 340 : 0,
            overflow: "hidden",
            transition: "all 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
            borderLeft: isWeavePanelOpen ? "1px solid var(--color-border-subtle)" : "none",
            background: "var(--color-surface-1)",
          }}
          className="h-full z-20"
        >
          {isWeavePanelOpen && (
            <div style={{ width: 340, height: "100%", overflowY: "auto" }}>
              <WeavePanel />
            </div>
          )}
        </aside>
      </div>

    </div>
  );
}
