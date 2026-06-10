// FILE: components/landing/HeroSection.jsx
"use client";


import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, Zap, Users, Timer } from "lucide-react";
import Link from "next/link";
import { codeTemplate } from "@/lib/mockData";

function TypewriterCode() {
  const [displayedCode, setDisplayedCode] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < codeTemplate.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode((prev) => prev + codeTemplate[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  return (
    <pre className="text-sm font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap">
      {displayedCode}
      <span className="inline-block w-2 h-5 bg-cyan-400 ml-0.5 animate-pulse" />
    </pre>
  );
}

function FloatingChip({ children, className, delay = 0 }) {
  return (

    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className={`absolute glass rounded-full px-3 py-1.5 text-xs font-medium text-zinc-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function HeroSection() {
  return (

    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left - Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-sm text-zinc-400 mb-8"
          >
            <Zap size={14} className="text-cyan-400" />
            <span>Powered by AI • Trusted by 50K+ coders</span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-6">
            <span className="text-white italic">Code.</span>
            <br />
            <span className="gradient-text italic">Compete.</span>
            <br />
            <span className="gradient-text italic">Dominate.</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg text-zinc-400 max-w-lg mb-8 leading-relaxed font-mono"
          >
            // One platform. All arenas. Real-time battles.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-bold rounded-lg glow-cyan hover:bg-cyan-400 transition-all duration-200"
              >
                Start Coding
                <ArrowRight size={18} />
              </motion.button>
            </Link>

            <Link href="/analyzer">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 glass rounded-lg text-white font-semibold hover:bg-white/10 transition-all duration-200 border border-cyan-500/30"
              >
                <Bot size={18} className="text-cyan-400" />
                Analyze My Profile
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex gap-8 mt-12"
          >
            {[
              { value: "847", label: "PROBLEMS" },
              { value: "14", label: "DAY STREAK" },
              { value: "#1243", label: "GLOBAL RANK" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-cyan-400">
                  {stat.value}
                </div>
                <div className="text-xs text-zinc-500 tracking-wider mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right - Code Editor Preview */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="relative hidden lg:block"
        >
          {/* Editor container */}
          <div className="relative glass rounded-2xl overflow-hidden border border-white/10">
            {/* Editor header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-zinc-500 text-sm">1. Two Sum</span>
              </div>
              <span className="difficulty-easy text-xs px-2 py-0.5 rounded font-medium">
                Easy
              </span>
            </div>

            {/* Code area */}
            <div className="p-6 min-h-[300px] bg-black/40">
              <TypewriterCode />
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-1.5 bg-cyan-500 text-black font-semibold text-sm rounded-md glow-cyan-sm"
              >
                Run Code
              </motion.button>
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              </div>
            </div>
          </div>

          {/* Floating Chips */}
          <FloatingChip className="-top-10 -right-4" delay={1.2}>
            <span className="flex items-center gap-2">
              <Zap size={10} className="text-cyan-400" /> 1.2M Problems Solved
            </span>
          </FloatingChip>
          <FloatingChip className="-bottom-12 left-3" delay={1.4}>
            <span className="flex items-center gap-2">
              <Users size={12} className="text-cyan-400" /> 50K Active Users
            </span>
          </FloatingChip>
          <FloatingChip className="top-1/2 right-8 " delay={1.6}>
            <span className="flex items-center gap-1.5">
              <Timer size={12} className="text-cyan-400" /> 99ms Avg Execution
            </span>
          </FloatingChip>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-zinc-600 text-xs">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 rounded-full border border-zinc-700 flex items-start justify-center p-1"
        >
          <div className="w-1 h-2 bg-cyan-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function Bot(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
