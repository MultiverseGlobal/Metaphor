"use client";

import React from "react";
import { 
  Users, 
  Activity, 
  Database, 
  Zap,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

const metrics = [
  { name: "Active Agents", value: "24", change: "+4.75%", icon: Users },
  { name: "System Health", value: "99.9%", change: "+0.1%", icon: Activity },
  { name: "Data Indexed", value: "1.4 TB", change: "+12%", icon: Database },
  { name: "Context Queries", value: "12,490", change: "+24%", icon: Zap },
];

const projects = [
  { id: "PRJ-001", name: "Metaphor Core", status: "Healthy", type: "Infrastructure", updated: "2 mins ago" },
  { id: "PRJ-002", name: "Atlas Portal", status: "Warning", type: "Frontend", updated: "1 hr ago" },
  { id: "PRJ-003", name: "Knowledge Ingestion", status: "Healthy", type: "Data Pipeline", updated: "3 hrs ago" },
  { id: "PRJ-004", name: "Neural Link", status: "Syncing", type: "Integration", updated: "Just now" },
  { id: "PRJ-005", name: "Postgres + pgvector", status: "Offline", type: "Database", updated: "1 day ago" },
];

const activities = [
  { user: "William", action: "deployed new model to", target: "Metaphor Core", time: "10 minutes ago" },
  { user: "System", action: "detected anomaly in", target: "Knowledge Ingestion", time: "2 hours ago" },
  { user: "Sarah", action: "invited 3 new members to", target: "Atlas Portal", time: "5 hours ago" },
];

export default function DashboardOverview() {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in-up">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor your agents, projects, and global system health.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="bg-surface rounded-xl border border-border p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{metric.change}</span>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">{metric.value}</h3>
              <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Data Table */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-bold text-foreground tracking-tight">Active Projects</h2>
            <button className="text-sm text-primary font-semibold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Project Name</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Last Updated</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{project.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{project.id}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{project.type}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {project.status === "Healthy" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {project.status === "Warning" && <AlertCircle className="w-4 h-4 text-amber-500" />}
                        {project.status === "Syncing" && <Clock className="w-4 h-4 text-blue-500" />}
                        {project.status === "Offline" && <AlertCircle className="w-4 h-4 text-red-500" />}
                        <span className="font-medium">{project.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{project.updated}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-surface rounded-xl border border-border shadow-sm flex flex-col">
          <div className="p-6 border-b border-border">
             <h2 className="text-lg font-bold text-foreground tracking-tight">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {activities.map((activity, i) => (
                <div key={i} className="flex gap-4 relative">
                  {/* Timeline line */}
                  {i !== activities.length - 1 && (
                    <div className="absolute top-8 left-[11px] bottom-[-24px] w-px bg-border"></div>
                  )}
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-1 z-10">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{activity.user}</span> {activity.action} <span className="font-semibold">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-2.5 bg-muted/50 hover:bg-muted text-sm font-semibold rounded-lg transition-colors border border-transparent hover:border-border">
              View All Activity
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
