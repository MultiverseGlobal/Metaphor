"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Database, Box, Check, ChevronRight, Activity, Network, Key } from 'lucide-react';
import { MetaphorLogo } from '@/components/ui/MetaphorLogo';

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  
  const words = ["yourself.", "your team.", "your business.", "your codebase."];

  const steps = [
    { id: "init", title: "Initialize Identity", icon: <Key className="w-5 h-5" />, desc: "Set your core persona and connect Metaphor to your world." },
    { id: "ingest", title: "Passive Ingestion", icon: <Database className="w-5 h-5" />, desc: "Metaphor reads Notion, Drive, and GitHub in the background." },
    { id: "graph", title: "Context Graph", icon: <Network className="w-5 h-5" />, desc: "Data is resolved into semantic nodes and edges continuously." },
    { id: "llm", title: "AI Injection", icon: <Box className="w-5 h-5" />, desc: "Your context is automatically appended to Claude and ChatGPT." }
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(stepInterval);
  }, [steps.length]);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(wordInterval);
  }, [words.length]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary-dim selection:text-foreground overflow-x-hidden">
      
      {/* ── Top Navigation Bar ── */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full z-50"
      >
        <div className="flex items-center gap-3">
          <MetaphorLogo size={16} />
          <span className="text-sm font-semibold tracking-tight text-foreground">Metaphor OS</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          <Link href="#architecture" className="hover:text-foreground transition-colors duration-200">Architecture</Link>
          <Link href="#flow" className="hover:text-foreground transition-colors duration-200">User Flow</Link>
          <Link href="#manifesto" className="hover:text-foreground transition-colors duration-200">Manifesto</Link>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground transition-colors duration-200">
            Sign In
          </Link>
          <Link href="/onboarding" className="group flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-80 transition-opacity">
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.nav>

      <main className="flex-1 flex flex-col items-center justify-start text-center pt-32 px-6">
        
        {/* ── Typography-Driven Hero ── */}
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm font-mono tracking-widest text-muted uppercase mb-8 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Universal Context Engine
          </motion.p>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-semibold tracking-tighter text-foreground leading-[1.1] mb-8"
          >
            Every AI should know you <br />
            <span className="text-muted flex flex-col md:flex-row items-center justify-center gap-3 mt-2">
              the way you know
              <span className="relative inline-block w-[280px] text-left">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={wordIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="absolute left-0 top-0 text-foreground whitespace-nowrap"
                  >
                    {words[wordIndex]}
                  </motion.span>
                </AnimatePresence>
                <span className="invisible whitespace-nowrap">{words[3]}</span>
              </span>
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl max-w-2xl text-muted leading-relaxed mb-16"
          >
            Metaphor is the context layer between you and every AI. It passively learns from your data sources (Notion, Drive, Calendar) and injects that shared understanding into your AI Consumers (Claude, ChatGPT, Cursor).
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-6"
          >
            <Link 
              href="/onboarding" 
              className="px-8 py-4 bg-foreground text-background text-sm font-medium rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
            >
              Get Started
            </Link>
          </motion.div>
        </div>

        {/* ── Dynamic Flow Visualizer ── */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          id="flow"
          className="w-full max-w-6xl mt-40 mb-32"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Step Details */}
            <div className="flex flex-col text-left space-y-8">
              {steps.map((step, index) => {
                const isActive = activeStep === index;
                return (
                  <div 
                    key={step.id} 
                    className={`p-6 rounded-2xl transition-all duration-500 border cursor-pointer ${isActive ? "bg-surface-1 border-border-strong shadow-lg scale-105" : "bg-transparent border-transparent opacity-50 hover:opacity-100 scale-100"}`}
                    onClick={() => setActiveStep(index)}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`p-3 rounded-full ${isActive ? "bg-primary/10 text-primary" : "bg-surface-2 text-muted"}`}>
                        {step.icon}
                      </div>
                      <h3 className={`text-xl font-semibold ${isActive ? "text-foreground" : "text-muted"}`}>{step.title}</h3>
                    </div>
                    <p className={`text-sm leading-relaxed ${isActive ? "text-muted" : "text-muted/50"}`}>
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right: Visual Representation */}
            <div className="relative h-[500px] w-full bg-surface-1 border border-border-subtle rounded-3xl overflow-hidden shadow-xl flex items-center justify-center p-8">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-50" />
              
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  <motion.div 
                    key="init"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center w-full max-w-xs"
                  >
                    <div className="w-full p-6 bg-background border border-border-subtle rounded-xl shadow-sm mb-4">
                      <div className="text-xs text-muted mb-2 uppercase tracking-wider font-semibold">Core Identity</div>
                      <div className="text-sm font-medium text-foreground mb-4">User: Developer</div>
                      <div className="text-xs text-muted">Mission: Build seamless context integration across the OS.</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-10 h-10 rounded-full bg-background border border-border-subtle flex items-center justify-center"><Activity className="w-4 h-4 text-primary" /></div>
                      <div className="w-10 h-10 rounded-full bg-background border border-border-subtle flex items-center justify-center"><Database className="w-4 h-4 text-accent-cyan" /></div>
                    </div>
                  </motion.div>
                )}
                {activeStep === 1 && (
                  <motion.div 
                    key="ingest"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center w-full"
                  >
                    <Activity className="w-12 h-12 text-primary mb-6 animate-pulse" />
                    <div className="space-y-3 w-full max-w-xs">
                      <div className="flex items-center justify-between p-3 bg-background border border-border-subtle rounded-lg">
                        <span className="text-xs text-muted">Reading GitHub Commits</span>
                        <Check className="w-4 h-4 text-success" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-background border border-border-subtle rounded-lg">
                        <span className="text-xs text-muted">Parsing Notion Docs</span>
                        <Check className="w-4 h-4 text-success" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-background border border-border-subtle rounded-lg">
                        <span className="text-xs text-muted">Syncing Local Files</span>
                        <div className="w-4 h-4 border-2 border-border-strong border-t-transparent rounded-full animate-spin" />
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeStep === 2 && (
                  <motion.div 
                    key="graph"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                  >
                    <Network className="w-16 h-16 text-foreground mb-8" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-background border border-border-subtle rounded-xl flex flex-col items-center">
                        <span className="text-xs font-mono text-primary mb-1">Entity</span>
                        <span className="text-sm font-medium">Metaphor OS</span>
                      </div>
                      <div className="p-4 bg-background border border-border-subtle rounded-xl flex flex-col items-center">
                        <span className="text-xs font-mono text-accent-cyan mb-1">Concept</span>
                        <span className="text-sm font-medium">Context Injection</span>
                      </div>
                      <div className="p-4 bg-background border border-border-subtle rounded-xl flex flex-col items-center col-span-2 text-center">
                        <span className="text-xs font-mono text-muted mb-1">Relationship</span>
                        <span className="text-sm font-medium">Metaphor OS <ChevronRight className="inline w-3 h-3" /> utilizes <ChevronRight className="inline w-3 h-3" /> Context Injection</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeStep === 3 && (
                  <motion.div 
                    key="llm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col w-full max-w-sm text-left"
                  >
                    <div className="mb-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted mb-2 flex justify-between">
                        <span>Injected Prompt</span>
                        <span className="text-primary font-mono">Real-time</span>
                      </span>
                      <div className="p-4 bg-background border border-border-subtle rounded-xl shadow-sm text-sm">
                        <span className="text-muted leading-relaxed">
                          System: User is Developer. Mission: Build seamless context integration. <br/>
                          Recent Context: Developer just pushed commits related to "Context Injection" into Metaphor OS.
                        </span>
                        <br/><br/>
                        <span className="text-foreground">"Help me refactor the graph resolution algorithm."</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </motion.div>

        {/* ── Feature Stack (Typography Driven) ── */}
        <section className="w-full max-w-6xl mx-auto py-24 text-left grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 px-8 border-t border-border-subtle">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-2xl font-semibold text-foreground mb-4">Passive Ingestion.</h3>
            <p className="text-base text-muted leading-relaxed">
              Metaphor connects to GitHub, Notion, and Google Drive. It reads webhooks in the background, summarizing commits and documents into relational entities instantly.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <h3 className="text-2xl font-semibold text-foreground mb-4">Autonomous Writing.</h3>
            <p className="text-base text-muted leading-relaxed">
              Through the Model Context Protocol (MCP), external AIs like Claude can actively write new decisions back to your knowledge graph during a conversation.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
            <h3 className="text-2xl font-semibold text-foreground mb-4">Conflict Resolution.</h3>
            <p className="text-base text-muted leading-relaxed">
              People change their minds. Metaphor uses time-decaying confidence scores and 'supersedes' relationships to ensure AIs only access your current reality, not 3-year-old opinions.
            </p>
          </motion.div>
        </section>

      </main>

      {/* ── Minimal Footer ── */}
      <footer className="w-full py-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center px-8 text-xs text-muted font-medium">
        <span>© 2026 Multiverse Global. All rights reserved.</span>
        <div className="flex gap-8 mt-4 md:mt-0">
          <Link href="#" className="hover:text-foreground transition-colors">Documentation</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Security</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
        </div>
      </footer>
      
    </div>
  );
}
