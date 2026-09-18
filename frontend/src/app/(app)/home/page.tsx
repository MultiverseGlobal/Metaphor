"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ArrowRight, Clock, Activity, Target, Shield, CheckCircle2, GitPullRequest } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function HomeEnvironment() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);

  // Mocking the context for the UI transformation
  const currentContext = {
    project: "Orion",
    task: "Notification System Architecture",
    priority: "High",
    status: "In progress",
  };

  const activeWork = [
    { title: "Building notification system", project: "Orion", status: "in-progress" },
    { title: "Atlas Acquisition Setup", project: "Atlas", status: "pending" },
    { title: "Claude Handoff -> Orion", project: "Handoff", status: "pending" },
  ];

  const recentlyChanged = [
    { type: "decision", title: "Adopted Push-based Architecture", time: "2 hours ago" },
    { type: "task", title: "Finished User Story mapping", time: "4 hours ago" },
    { type: "evidence", title: "GitHub PR #42 merged", time: "5 hours ago" },
  ];

  useEffect(() => {
    async function checkAuth() {
      try {
        const isUnlocked =
          typeof document !== "undefined" &&
          (document.cookie.includes("metaphor_unlocked=true") ||
            localStorage.getItem("metaphor_unlocked") === "true");
        
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session && !isUnlocked) {
          router.push("/login?redirect=/home");
          return;
        }
        setAuthLoading(false);
      } catch (err) {
        console.error("Auth check failed:", err);
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen pt-32 pb-24 px-6 md:px-12 lg:px-24 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header greeting */}
        <header>
          <h1 className="text-3xl font-display text-foreground tracking-tight">
            Good evening, Benjamin.
          </h1>
          <p className="text-muted mt-2 text-sm max-w-xl leading-relaxed">
            Metaphor is tracking your context across the ecosystem.
          </p>
        </header>

        {/* CURRENT CONTEXT */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-border-subtle pb-2">
            <h2 className="text-xs font-mono uppercase tracking-widest text-muted">Currently</h2>
          </div>
          
          <div className="pds-card p-6 border-l-2 border-l-primary hover:shadow-card-hover transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-primary mb-1">{currentContext.project}</p>
                <h3 className="text-xl font-display text-foreground mb-4">{currentContext.task}</h3>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-surface-2 border border-border-subtle text-[10px] font-mono uppercase text-muted">
                {currentContext.status}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border-subtle/50">
              <div>
                <p className="pds-label">Priority</p>
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-warning" />
                  {currentContext.priority}
                </p>
              </div>
              <div className="col-span-3">
                <p className="pds-label">Constraints</p>
                <p className="text-sm text-muted">Time • money • existing architecture</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-12">
          {/* ACTIVE WORK */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border-subtle pb-2">
              <h2 className="text-xs font-mono uppercase tracking-widest text-muted">Active Work</h2>
            </div>
            
            <div className="space-y-3">
              {activeWork.map((work, idx) => (
                <div key={idx} className="group p-4 rounded-xl bg-surface-1 border border-border-subtle hover:border-border-strong hover:bg-surface-2 transition-all cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-primary font-medium mb-1">{work.project}</p>
                      <p className="text-sm text-foreground group-hover:text-primary transition-colors">{work.title}</p>
                    </div>
                    <Activity className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* RECENTLY CHANGED */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border-subtle pb-2">
              <h2 className="text-xs font-mono uppercase tracking-widest text-muted">Recently Changed</h2>
            </div>
            
            <div className="space-y-3">
              {recentlyChanged.map((change, idx) => {
                let Icon = Activity;
                let color = "text-info";
                if (change.type === "decision") { Icon = Shield; color = "text-primary"; }
                if (change.type === "task") { Icon = CheckCircle2; color = "text-success"; }
                if (change.type === "evidence") { Icon = GitPullRequest; color = "text-warning"; }

                return (
                  <div key={idx} className="flex items-start gap-4 p-3 rounded-lg hover:bg-surface-2/50 transition-colors cursor-pointer group">
                    <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center bg-surface-2 border border-border-subtle ${color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground group-hover:text-primary transition-colors">{change.title}</p>
                      <p className="text-[11px] text-muted flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {change.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
