// FILE: components/practice/ProblemFilters.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, Trophy } from "lucide-react";

export default function ProblemFilters({ onFilterChange }) {
  const [platform, setPlatform] = useState("All Platforms");
  const [difficulty, setDifficulty] = useState("All Levels");
  const [statuses, setStatuses] = useState({
    solved: true,
    attempted: true,
    unsolved: true,
  });

  const handleStatusChange = (key) => {
    const newStatuses = { ...statuses, [key]: !statuses[key] };
    setStatuses(newStatuses);
    if (onFilterChange) {
      onFilterChange({ platform, difficulty, statuses: newStatuses });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Filters Card */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter size={18} className="text-cyan-400" />
          <h3 className="text-white font-semibold">Filters</h3>
        </div>

        {/* Platform */}
        <div className="mb-5">
          <label className="text-sm text-zinc-400 mb-2 block">Platform</label>
          <select
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value);
              if (onFilterChange) onFilterChange({ platform: e.target.value, difficulty, statuses });
            }}
            className="w-full px-4 py-2.5 glass rounded-lg text-white text-sm bg-transparent border border-white/10 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
          >
            <option value="All Platforms" className="bg-zinc-900">All Platforms</option>
            <option value="LeetCode" className="bg-zinc-900">LeetCode</option>
            <option value="Codeforces" className="bg-zinc-900">Codeforces</option>
            <option value="CodeChef" className="bg-zinc-900">CodeChef</option>
          </select>
        </div>

        {/* Difficulty */}
        <div className="mb-5">
          <label className="text-sm text-zinc-400 mb-2 block">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              if (onFilterChange) onFilterChange({ platform, difficulty: e.target.value, statuses });
            }}
            className="w-full px-4 py-2.5 glass rounded-lg text-white text-sm bg-transparent border border-white/10 focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
          >
            <option value="All Levels" className="bg-zinc-900">All Levels</option>
            <option value="Easy" className="bg-zinc-900">Easy</option>
            <option value="Medium" className="bg-zinc-900">Medium</option>
            <option value="Hard" className="bg-zinc-900">Hard</option>
          </select>
        </div>

        {/* Status */}
        <div className="mb-5">
          <label className="text-sm text-zinc-400 mb-2 block">Status</label>
          <div className="space-y-2">
            {[
              { key: "solved", label: "Solved", color: "bg-green-400" },
              { key: "attempted", label: "Attempted", color: "bg-yellow-400" },
              { key: "unsolved", label: "Unsolved", color: "bg-zinc-500" },
            ].map((status) => (
              <label
                key={status.key}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={`w-4 h-4 rounded border transition-all ${
                    statuses[status.key]
                      ? `${status.color} border-transparent`
                      : "border-zinc-600 bg-transparent"
                  }`}
                  onClick={() => handleStatusChange(status.key)}
                >
                  {statuses[status.key] && (
                    <svg
                      viewBox="0 0 12 12"
                      fill="none"
                      className="w-4 h-4 text-black"
                    >
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                  {status.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 bg-cyan-500/20 text-cyan-400 font-medium text-sm rounded-lg border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
        >
          Apply Filters
        </motion.button>
      </div>

      {/* Daily Challenge */}
      <div className="glass rounded-2xl p-6 border-l-4 border-yellow-500">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={18} className="text-yellow-400" />
          <h3 className="text-white font-semibold text-sm">Daily Challenge</h3>
        </div>
        <p className="text-zinc-400 text-sm mb-4">
          Complete today&apos;s challenge to maintain your streak!
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 bg-yellow-500/20 text-yellow-400 font-medium text-sm rounded-lg border border-yellow-500/30 hover:bg-yellow-500/30 transition-all"
        >
          Start Challenge
        </motion.button>
      </div>
    </motion.div>
  );
}
