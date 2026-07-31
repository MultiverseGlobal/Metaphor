"use client";

import React from "react";
import { User, Mail, CreditCard, LogOut, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function ProfilePage() {
  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500 max-w-3xl mx-auto p-8">
      
      <header className="mb-10 flex items-end gap-6">
        <div className="w-24 h-24 rounded-2xl bg-foreground text-background flex items-center justify-center text-4xl font-bold shadow-lg">
          W
        </div>
        <div className="pb-2">
          <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-1">William</h1>
          <p className="text-sm text-muted flex items-center gap-2">
            <Mail className="w-4 h-4" /> william@multiverse.global
          </p>
        </div>
      </header>

      <div className="space-y-6">
        
        {/* Plan Info */}
        <Card className="flex items-center justify-between border-primary/20 bg-primary/5">
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Metaphor Pro
            </h2>
            <p className="text-xs text-muted">Unlimited nodes and active webhook ingestion.</p>
          </div>
          <button className="px-4 py-2 bg-background border border-border-strong text-xs font-medium rounded-lg hover:border-primary transition-colors shadow-sm">
            Manage Billing
          </button>
        </Card>

        {/* Account Details */}
        <Card noPadding className="divide-y divide-border-subtle">
          <div className="p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-muted">Full Name</span>
            <span className="text-sm font-semibold text-foreground">William</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-muted">Email Address</span>
            <span className="text-sm font-semibold text-foreground">william@multiverse.global</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-muted">Member Since</span>
            <span className="text-sm font-semibold text-foreground">July 2026</span>
          </div>
        </Card>

        <button className="w-full p-4 rounded-xl border border-border-subtle text-accent-red font-medium text-sm flex items-center justify-center gap-2 hover:bg-accent-red/5 transition-colors mt-8">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>

      </div>
    </div>
  );
}
