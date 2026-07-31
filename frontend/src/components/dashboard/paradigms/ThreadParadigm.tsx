import React, { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import KPIWidget from "@/components/dashboard/widgets/KPIWidget";
import DataTableWidget from "@/components/dashboard/widgets/DataTableWidget";

export default function ThreadParadigm() {
  const [messages, setMessages] = useState<{role: "user" | "system", content: string, widget?: "kpi" | "data"}[]>([
    { role: "system", content: "Metaphor OS Thread initialized. How can I assist you with your knowledge graph today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsgs = [...messages, { role: "user" as const, content: input }];
    setMessages(newMsgs);
    setInput("");

    setTimeout(() => {
      let sysReply = "I processed your request.";
      let widget: "kpi" | "data" | undefined;
      
      if (input.toLowerCase().includes("health")) {
        sysReply = "Here is the global health overview of your active agents:";
        widget = "kpi";
      } else if (input.toLowerCase().includes("projects")) {
        sysReply = "Here is the active topology of your knowledge databases:";
        widget = "data";
      }

      setMessages([...newMsgs, { role: "system", content: sysReply, widget }]);
    }, 600);
  };

  return (
    <div className="w-full h-full flex flex-col items-center bg-background">
      <div className="w-full max-w-3xl flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-32">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "system" && (
              <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center border border-border-subtle shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            
            <div className={`max-w-[80%] flex flex-col gap-4 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`px-4 py-3 rounded-2xl ${
                msg.role === "user" 
                  ? "bg-primary text-background rounded-tr-sm" 
                  : "bg-surface-1 border border-border-subtle text-foreground rounded-tl-sm"
              }`}>
                <p className="text-sm font-medium">{msg.content}</p>
              </div>
              
              {/* Rich Widget Attachments */}
              {msg.widget === "kpi" && <div className="w-[500px] h-[300px] animate-fade-in-up"><KPIWidget /></div>}
              {msg.widget === "data" && <div className="w-[400px] h-[300px] animate-fade-in-up"><DataTableWidget /></div>}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary-dim shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="absolute bottom-8 w-full max-w-3xl px-6">
        <form onSubmit={handleSend} className="relative bg-surface-1/80 backdrop-blur-xl border border-border-strong rounded-2xl shadow-glass flex items-center p-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk to Metaphor OS..." 
            className="flex-1 bg-transparent border-none text-sm text-foreground placeholder:text-muted py-2 px-3 outline-none"
          />
          <button type="submit" className="p-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
