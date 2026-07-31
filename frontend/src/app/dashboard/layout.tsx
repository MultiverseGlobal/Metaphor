"use client";

import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopHeader from "@/components/dashboard/TopHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
      {/* Permanent Left Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader />
        
        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto relative bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
