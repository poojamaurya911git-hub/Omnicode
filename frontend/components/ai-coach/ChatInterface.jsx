// FILE: components/ai-coach/ChatInterface.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { chatMessages, topicStrengths, userProfile, analyzerResults } from "@/lib/mockData";

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mr-3 shrink-0 mt-1">
          <Bot size={16} className="text-cyan-400" />
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-cyan-500 text-black font-medium rounded-br-md"
            : "glass rounded-bl-md"
        }`}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-cyan-400 text-xs font-semibold">
                OmniAI
              </span>
            </div>
            <div className="text-zinc-200 whitespace-pre-line">
              {message.content.split("\n").map((line, i) => {
                if (line.startsWith("**") && line.endsWith("**")) {
                  return (
                    <p key={i} className="font-bold text-white my-1">
                      {line.replace(/\*\*/g, "")}
                    </p>
                  );
                }
                if (line.startsWith("```")) {
                  return null;
                }
                if (line.match(/^\d+\.\s/)) {
                  return (
                    <p key={i} className="ml-2 my-0.5">
                      {line}
                    </p>
                  );
                }
                return (
                  <p key={i} className="my-0.5">
                    {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return (
                          <strong key={j} className="text-white">
                            {part.replace(/\*\*/g, "")}
                          </strong>
                        );
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </div>
          </div>
        )}
        <div
          className={`text-[10px] mt-2 ${
            isUser ? "text-black/50" : "text-zinc-600"
          }`}
        >
          {message.timestamp}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatInterface() {
  const [messages, setMessages] = useState(chatMessages);
  const [input, setInput] = useState("");
  const [hintMode, setHintMode] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, userMsg]);
    setInput("");

    // Simulated AI response
    setTimeout(() => {
      const aiMsg = {
        id: messages.length + 2,
        role: "ai",
        content: hintMode
          ? "💡 **Hint:** Think about what data structure would allow O(1) lookups. Consider the relationship between the current element and the target."
          : "That's a great question! Let me analyze your approach and provide some insights.\n\nBased on your recent submissions, I'd recommend focusing on the **sliding window** technique for this type of problem. It can reduce your time complexity from O(n²) to O(n).\n\nWould you like me to walk you through a specific example?",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1500);
  };

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6 h-[calc(100vh-120px)]">
      {/* Left Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col gap-4"
      >
        {/* User Card */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-black font-bold">
              AV
            </div>
            <div>
              <div className="text-white font-semibold">
                {userProfile.name}
              </div>
              <div className="text-zinc-500 text-xs">
                {userProfile.stats.totalSolved} problems solved
              </div>
            </div>
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-cyan-400">
                {userProfile.stats.streak}
              </div>
              <div className="text-[10px] text-zinc-500">Streak</div>
            </div>
            <div>
              <div className="text-lg font-bold text-cyan-400">
                {userProfile.stats.globalRank}
              </div>
              <div className="text-[10px] text-zinc-500">Rank</div>
            </div>
            <div>
              <div className="text-lg font-bold text-cyan-400">1847</div>
              <div className="text-[10px] text-zinc-500">Rating</div>
            </div>
          </div>
        </div>

        {/* Mini Radar */}
        <div className="glass rounded-2xl p-4">
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={topicStrengths} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis
                dataKey="topic"
                tick={{ fill: "#a1a1aa", fontSize: 9 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                dataKey="score"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Analysis Score */}
        <div className="glass rounded-2xl p-5">
          <div className="text-3xl font-black gradient-text mb-1">
            {analyzerResults.consistencyScore}/100
          </div>
          <div className="text-sm text-zinc-500">Analysis Score</div>
        </div>

        {/* Insight Cards */}
        <div className="space-y-2">
          <div className="glass rounded-xl p-3 border-l-4 border-red-500/50 flex items-center gap-2">
            <span className="text-xs text-red-400">⊘</span>
            <span className="text-xs text-zinc-300">
              Weak in Dynamic Programming (12%)
            </span>
          </div>
          <div className="glass rounded-xl p-3 border-l-4 border-yellow-500/50 flex items-center gap-2">
            <span className="text-xs text-yellow-400">⚡</span>
            <span className="text-xs text-zinc-300">
              Inconsistent (3-day average streak)
            </span>
          </div>
          <div className="glass rounded-xl p-3 border-l-4 border-green-500/50 flex items-center gap-2">
            <span className="text-xs text-green-400">✓</span>
            <span className="text-xs text-zinc-300">
              Strong in Arrays & Strings (Top 15%)
            </span>
          </div>
        </div>
      </motion.div>

      {/* Chat Area */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col glass rounded-2xl overflow-hidden"
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Bot size={20} className="text-cyan-400" />
            </div>
            <div>
              <div className="text-white font-semibold">OmniAI Coach</div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-xs text-green-400">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Hint Mode Toggle */}
            <button
              onClick={() => setHintMode(!hintMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                hintMode
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-white/5 text-zinc-500 border border-white/10 hover:text-white"
              }`}
            >
              <Sparkles size={12} />
              Hint Mode
            </button>
            <button className="text-zinc-500 hover:text-white transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-1">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask OmniAI anything ..."
              className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              className="px-5 py-3 bg-cyan-500 text-black font-bold rounded-xl glow-cyan-sm hover:bg-cyan-400 transition-all flex items-center gap-2"
            >
              <Send size={16} />
              Ask AI
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
