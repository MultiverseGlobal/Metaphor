import React from "react";
import { Activity, Users, Database, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const metrics = [
  { name: "Active Agents", value: "24", change: "+4.75%", icon: Users },
  { name: "System Health", value: "99.9%", change: "+0.1%", icon: Activity },
  { name: "Data Indexed", value: "1.4 TB", change: "+12%", icon: Database },
  { name: "Context Queries", value: "12,490", change: "+24%", icon: Zap },
];

export default function KPIWidget() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <Activity className="w-4 h-4 text-primary" />
        <CardTitle>Global Health</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-2 gap-4 flex-1">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="bg-surface-2 rounded-lg border border-border-subtle p-4 flex flex-col justify-between hover:border-border-strong transition-colors">
              <div className="flex justify-between items-start mb-4">
                <Icon className="w-4 h-4 text-primary opacity-80" />
                <Badge variant="success">{metric.change}</Badge>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-bright tracking-tight">{metric.value}</h3>
                <p className="text-[10px] uppercase tracking-wider text-muted mt-1">{metric.name}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
