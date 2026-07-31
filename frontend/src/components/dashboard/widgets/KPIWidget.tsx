import React from "react";
import { Activity, Users, Database, Zap } from "lucide-react";

const metrics = [
  { name: "Active Agents", value: "24", change: "+4.75%", icon: Users },
  { name: "System Health", value: "99.9%", change: "+0.1%", icon: Activity },
  { name: "Data Indexed", value: "1.4 TB", change: "+12%", icon: Database },
  { name: "Context Queries", value: "12,490", change: "+24%", icon: Zap },
];

export default function KPIWidget() {
  return (
    <div className="w-full h-full bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Global Health</span>
      </div>
      <div className="grid grid-cols-2 gap-4 flex-1">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="bg-background/40 rounded-xl border border-white/5 p-4 flex flex-col justify-between hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <Icon className="w-4 h-4 text-primary/70" />
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">{metric.change}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground tracking-tight">{metric.value}</h3>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{metric.name}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
