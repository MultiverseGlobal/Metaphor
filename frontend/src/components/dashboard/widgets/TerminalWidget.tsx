import React, { useEffect, useState } from "react";
import { Terminal } from "lucide-react";

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
    <div className="w-full h-full bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col font-mono shadow-2xl relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2 sticky top-0 bg-surface/50 backdrop-blur-md">
        <Terminal className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">System Log</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-end">
        <div className="space-y-1">
          {logs.map((log, i) => (
            <div key={i} className={`text-xs ${log.includes("[WARN]") ? "text-amber-400" : log.includes("[SYSTEM]") ? "text-primary" : "text-muted-foreground/80"}`}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
