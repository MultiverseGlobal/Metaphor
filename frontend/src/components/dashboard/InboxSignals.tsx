import React from "react";
import { AlertCircle } from "lucide-react";

interface InboxSignalsProps {
  inboxData: any;
}

export default function InboxSignals({ inboxData }: InboxSignalsProps) {
  if (!inboxData?.pending_nodes?.length) return null;

  return (
    <div className="fixed bottom-10 left-10 w-[340px] z-40 animate-fade-in-up">
      <div className="p-6 bg-surface/60 backdrop-blur-3xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 mb-5 sticky top-0 bg-surface/60 backdrop-blur-md pb-2">
          <AlertCircle className="w-4 h-4 text-accent-red" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">Inbox Signals</h3>
        </div>
        <div className="space-y-3">
          {inboxData.pending_nodes.map((n: any) => (
            <div key={n.id} className="p-4 bg-background/40 rounded-xl border border-white/5 hover:border-accent-red/40 hover:bg-accent-red/5 transition-all cursor-pointer group">
              <p className="text-sm font-medium mb-3 text-foreground/90 group-hover:text-white transition-colors leading-tight">{n.name}</p>
              <span className="text-[9px] font-mono uppercase tracking-widest bg-accent-red/10 text-accent-red px-2 py-1 rounded border border-accent-red/20 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]">Action Required</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
