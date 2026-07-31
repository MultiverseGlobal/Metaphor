import React, { useEffect, useState } from "react";
import { Terminal } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

export default function TerminalWidget() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const initialLogs = [
      "[SYSTEM] Initializing Metaphor OS Kernel...",
      "[NETWORK] Establishing secure connection to Atlas Portal.",
      "[WARN] High latency detected on Knowledge Ingestion pipeline.",
      "[AUTH] Handshake successful.",
      "[SYSTEM] Bento Matrix active."
    ];
    setLogs(initialLogs);

    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLog = `[${new Date().toISOString().split("T")[1].slice(0, 8)}] Incoming telemetry data from Sector ${Math.floor(Math.random() * 9)}...`;
        const next = [...prev, newLog];
        if (next.length > 50) return next.slice(next.length - 50);
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full flex flex-col font-mono">
      <CardHeader className="sticky top-0 bg-surface-1/90 backdrop-blur pb-2 mb-0 border-b-border-subtle z-10">
        <Terminal className="w-4 h-4 text-primary" />
        <CardTitle>System Log</CardTitle>
      </CardHeader>
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-end pt-4">
        <div className="space-y-1.5">
          {logs.map((log, i) => (
            <div key={i} className={`text-[11px] leading-relaxed ${log.includes("[WARN]") ? "text-warning" : log.includes("[SYSTEM]") ? "text-primary" : "text-muted"}`}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
