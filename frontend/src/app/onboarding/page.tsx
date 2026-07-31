"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Bot, User, Check, GitBranch, Share2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  
  // 1: Mission, 2: Preferences, 3: Integrations
  const [step, setStep] = useState(1);
  const [inputValue, setInputValue] = useState("");
  
  // Store the conversation history for the left panel
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Let's build your Context Engine. What is your primary mission right now?" }
  ]);

  // Store nodes to visually render on the right panel
  const [nodes, setNodes] = useState<{id: string, label: string, type: string, x: number, y: number}[]>([]);
  const [edges, setEdges] = useState<{source: string, target: string}[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const addNode = (id: string, label: string, type: string, x: number, y: number) => {
    setNodes(prev => [...prev, { id, label, type, x, y }]);
  };

  const addEdge = (source: string, target: string) => {
    setEdges(prev => [...prev, { source, target }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      handleChatSubmit(inputValue.trim());
      setInputValue("");
    }
  };

  const handleChatSubmit = (text: string) => {
    // Add user message
    setChatHistory(prev => [...prev, { role: "user", text }]);
    
    // Process step
    if (step === 1) {
      setTimeout(() => {
        addNode("n1", "Identity: William", "identity", 20, 40);
        addNode("n2", "Project: Atlas", "project", 70, 20);
        addEdge("n1", "n2");
        setChatHistory(prev => [...prev, { role: "ai", text: "Got it. I've mapped Identity and Project nodes. How should AIs communicate with you? (e.g. tone, banned jargon)" }]);
        setStep(2);
      }, 600);
    } else if (step === 2) {
      setTimeout(() => {
        addNode("n3", "Pref: Direct Tone", "insight", 70, 70);
        addNode("n4", "Constraint: No Jargon", "insight", 30, 80);
        addEdge("n1", "n3");
        addEdge("n1", "n4");
        setChatHistory(prev => [...prev, { role: "ai", text: "Preferences mapped. Finally, which tools do you want Metaphor to passively sync with?" }]);
        setStep(3);
      }, 600);
    }
  };

  const handleIntegrationSelect = (name: string, id: string, x: number, y: number) => {
    addNode(id, `Source: ${name}`, "document", x, y);
    addEdge("n2", id); // Attach to project Atlas
  };

  const finalize = () => {
    setChatHistory(prev => [...prev, { role: "ai", text: "Context Package assembled. Synchronizing with MCP Server..." }]);
    setTimeout(() => {
      localStorage.setItem("metaphor_onboarded", "true");
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden font-sans">
      
      {/* ── Left Side: Conversational Interview ── */}
      <div className="w-1/2 h-full flex flex-col border-r border-border-subtle bg-background z-10 shadow-[20px_0_40px_rgba(0,0,0,0.05)]">
        
        {/* Header */}
        <div className="px-8 py-8 flex justify-between items-center border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-foreground shadow-[0_0_8px_rgba(var(--foreground-rgb),0.5)]" />
            <span className="text-sm font-semibold tracking-tight text-foreground">Lore Builder</span>
          </div>
          <span className="text-xs font-mono text-muted uppercase tracking-widest">Step {step} of 3</span>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 flex flex-col">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[80%] flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar */}
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "ai" ? "bg-surface-2 text-foreground" : "bg-primary text-white"}`}>
                  {msg.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-surface-2 text-foreground" : "bg-transparent text-foreground border border-border-subtle shadow-sm"}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {step === 3 && (
             <div className="animate-in fade-in duration-500 w-full max-w-sm mx-auto mt-4 space-y-3">
               <button 
                 onClick={() => handleIntegrationSelect("GitHub", "n5", 80, 50)}
                 className="w-full text-left p-4 bg-surface-1 border border-border-subtle rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors"
               >
                 <div className="flex items-center gap-3">
                   <GitBranch className="w-4 h-4 text-muted" />
                   <span className="text-sm font-medium">Connect GitHub</span>
                 </div>
                 <div className="w-2 h-2 rounded-full bg-success opacity-0 hover:opacity-100 transition-opacity" />
               </button>
               <button 
                 onClick={() => handleIntegrationSelect("Notion", "n6", 60, 80)}
                 className="w-full text-left p-4 bg-surface-1 border border-border-subtle rounded-xl flex items-center justify-between hover:border-primary/50 transition-colors"
               >
                 <div className="flex items-center gap-3">
                   <Share2 className="w-4 h-4 text-muted" />
                   <span className="text-sm font-medium">Connect Notion</span>
                 </div>
               </button>
             </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-border-subtle bg-background">
          {step < 3 ? (
            <div className="relative">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your response..."
                className="w-full bg-surface-1 border border-border-subtle rounded-xl px-4 py-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors shadow-inner"
                autoFocus
              />
              <button 
                onClick={() => {
                  if (inputValue.trim()) {
                    handleChatSubmit(inputValue.trim());
                    setInputValue("");
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-foreground text-background rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={finalize}
              className="w-full py-4 bg-foreground text-background rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Assemble Context Package <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Right Side: Real-Time Visualizer ── */}
      <div className="w-1/2 h-full bg-surface-1 relative overflow-hidden flex items-center justify-center">
        
        {/* Background Grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--border-subtle) 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.5 }} />

        {nodes.length === 0 ? (
          <div className="text-center text-muted animate-pulse">
            <Share2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-mono uppercase tracking-widest">Awaiting Input...</p>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* Draw Edges using SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {edges.map((edge, i) => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;
                
                return (
                  <line 
                    key={i}
                    x1={`${sourceNode.x}%`} 
                    y1={`${sourceNode.y}%`} 
                    x2={`${targetNode.x}%`} 
                    y2={`${targetNode.y}%`}
                    stroke="var(--border-strong)"
                    strokeWidth="1.5"
                    className="animate-in fade-in duration-700"
                    strokeDasharray="4 4"
                  />
                );
              })}
            </svg>

            {/* Draw Nodes */}
            {nodes.map((node) => (
              <div 
                key={node.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-background border border-border-strong rounded-full shadow-lg z-10 animate-in zoom-in fade-in duration-500 flex items-center gap-2"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <div className={`w-2 h-2 rounded-full ${node.type === 'identity' ? 'bg-primary' : node.type === 'project' ? 'bg-accent-blue' : node.type === 'document' ? 'bg-success' : 'bg-accent-red'}`} />
                <span className="text-xs font-medium text-foreground">{node.label}</span>
              </div>
            ))}
          </div>
        )}
        
      </div>

    </div>
  );
}
