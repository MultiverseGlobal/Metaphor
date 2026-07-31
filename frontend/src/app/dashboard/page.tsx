"use client";

import React, { useState } from "react";
import { Terminal, AppWindow, MessagesSquare, Code2 } from "lucide-react";
import CommandParadigm from "@/components/dashboard/paradigms/CommandParadigm";
import CanvasParadigm from "@/components/dashboard/paradigms/CanvasParadigm";
import ThreadParadigm from "@/components/dashboard/paradigms/ThreadParadigm";
import IDEParadigm from "@/components/dashboard/paradigms/IDEParadigm";

type Paradigm = "command" | "canvas" | "thread" | "ide";

export default function MultiParadigmEngine() {
  const [activeParadigm, setActiveParadigm] = useState<Paradigm>("command");

  return (
    <div className="w-full h-full relative overflow-hidden bg-background">
      
      {/* Paradigm Renderer */}
      <div className="w-full h-full">
        {activeParadigm === "command" && <CommandParadigm />}
        {activeParadigm === "canvas" && <CanvasParadigm />}
        {activeParadigm === "thread" && <ThreadParadigm />}
        {activeParadigm === "ide" && <IDEParadigm />}
      </div>
      
      {/* Universal Paradigm Switcher (Floating Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-[100] flex items-center bg-surface-1/80 backdrop-blur-xl border border-border-strong rounded-full shadow-glass p-1 gap-1">
        
        <button 
          onClick={() => setActiveParadigm("command")}
          className={`p-2 rounded-full transition-all ${activeParadigm === "command" ? "bg-primary text-background" : "text-muted hover:text-foreground hover:bg-surface-2"}`}
          title="Command Paradigm (The Void)"
        >
          <Terminal className="w-4 h-4" />
        </button>
        
        <button 
          onClick={() => setActiveParadigm("canvas")}
          className={`p-2 rounded-full transition-all ${activeParadigm === "canvas" ? "bg-primary text-background" : "text-muted hover:text-foreground hover:bg-surface-2"}`}
          title="Canvas Paradigm (Spatial Board)"
        >
          <AppWindow className="w-4 h-4" />
        </button>
        
        <button 
          onClick={() => setActiveParadigm("thread")}
          className={`p-2 rounded-full transition-all ${activeParadigm === "thread" ? "bg-primary text-background" : "text-muted hover:text-foreground hover:bg-surface-2"}`}
          title="Thread Paradigm (Continuous Chat)"
        >
          <MessagesSquare className="w-4 h-4" />
        </button>
        
        <button 
          onClick={() => setActiveParadigm("ide")}
          className={`p-2 rounded-full transition-all ${activeParadigm === "ide" ? "bg-primary text-background" : "text-muted hover:text-foreground hover:bg-surface-2"}`}
          title="IDE Paradigm (Developer Console)"
        >
          <Code2 className="w-4 h-4" />
        </button>
        
      </div>
    </div>
  );
}
