// FILE: components/dashboard/RecentSubmissions.jsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { recentSubmissions } from "@/lib/mockData";

const verdictConfig = {
  AC: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10", label: "Accepted" },
  WA: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Wrong Answer" },
  TLE: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Time Limit" },
  RE: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-400/10", label: "Runtime Error" },
};

const platformColors = {
  LeetCode: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  Codeforces: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  CodeChef: "text-amber-600 bg-amber-600/10 border-amber-600/20",
};

export default function RecentSubmissions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="glass rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">
        Recent Submissions
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs text-zinc-500 font-medium pb-3 pr-4">
                Problem
              </th>
              <th className="text-left text-xs text-zinc-500 font-medium pb-3 pr-4">
                Platform
              </th>
              <th className="text-left text-xs text-zinc-500 font-medium pb-3 pr-4">
                Verdict
              </th>
              <th className="text-left text-xs text-zinc-500 font-medium pb-3 pr-4">
                Language
              </th>
              <th className="text-right text-xs text-zinc-500 font-medium pb-3">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {recentSubmissions.slice(0, 8).map((sub, index) => {
              const verdict = verdictConfig[sub.verdict];
              const VerdictIcon = verdict.icon;
              const platformClass = platformColors[sub.platform];

              return (
                <motion.tr
                  key={sub.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05, duration: 0.3 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 pr-4">
                    <span className="text-sm text-white font-medium">
                      {sub.problem}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-md border font-medium ${platformClass}`}
                    >
                      {sub.platform}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-medium ${verdict.color}`}
                    >
                      <VerdictIcon size={14} />
                      {verdict.label}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs text-zinc-400 font-mono">
                      {sub.language}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-xs text-zinc-500">{sub.time}</span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
