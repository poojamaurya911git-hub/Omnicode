// FILE: components/practice/ProblemList.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle, XCircle, Circle } from "lucide-react";
import { problems } from "@/lib/mockData";

const platformLogos = {
  LeetCode: { letter: "L", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30" },
  Codeforces: { letter: "C", color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  CodeChef: { letter: "C", color: "text-amber-600 bg-amber-600/10 border-amber-600/30" },
};

const statusIcons = {
  solved: { icon: CheckCircle, color: "text-green-400" },
  attempted: { icon: XCircle, color: "text-yellow-400" },
  unsolved: { icon: Circle, color: "text-zinc-600" },
};

export default function ProblemList({ onSelectProblem, selectedProblem }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProblems = problems.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Search */}
      <div className="p-4 border-b border-white/5">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            placeholder="Search problems ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Problem List */}
      <div className="max-h-[calc(100vh-240px)] overflow-y-auto">
        {filteredProblems.map((problem, index) => {
          const platform = platformLogos[problem.platform];
          const status = statusIcons[problem.status];
          const StatusIcon = status.icon;
          const isSelected = selectedProblem?.id === problem.id;

          return (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              onClick={() => onSelectProblem && onSelectProblem(problem)}
              className={`flex items-center gap-4 px-5 py-4 border-b border-white/[0.03] cursor-pointer transition-all duration-200 hover:bg-white/[0.03] ${
                isSelected ? "bg-cyan-500/5 border-l-2 border-l-cyan-400" : ""
              }`}
            >
              {/* Number */}
              <span className="text-zinc-600 text-sm font-mono w-8">
                #{problem.id}
              </span>

              {/* Platform Badge */}
              <div
                className={`w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center border ${platform.color}`}
              >
                {platform.letter}
              </div>

              {/* Problem Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-sm font-medium truncate">
                  {problem.title}
                </h4>
                <div className="flex gap-2 mt-1">
                  {problem.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium difficulty-${problem.difficulty.toLowerCase()}`}
              >
                {problem.difficulty}
              </span>

              {/* Status */}
              <StatusIcon size={18} className={status.color} />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
