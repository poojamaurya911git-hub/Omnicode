// FILE: components/battle/LiveLeaderboard.jsx
"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";
import { leaderboardData } from "@/lib/mockData";

const rankStyles = {
  1: {
    glow: "shadow-[0_0_20px_rgba(255,215,0,0.2)]",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5",
    badge: "text-yellow-400",
    icon: Trophy,
  },
  2: {
    glow: "shadow-[0_0_15px_rgba(192,192,192,0.15)]",
    border: "border-zinc-400/30",
    bg: "bg-zinc-400/5",
    badge: "text-zinc-300",
    icon: Medal,
  },
  3: {
    glow: "shadow-[0_0_15px_rgba(205,127,50,0.15)]",
    border: "border-amber-600/30",
    bg: "bg-amber-600/5",
    badge: "text-amber-500",
    icon: Award,
  },
};

export default function LiveLeaderboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-white/5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy size={20} className="text-cyan-400" />
          Live Leaderboard
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs text-zinc-500 font-medium px-6 py-3">
                Rank
              </th>
              <th className="text-left text-xs text-zinc-500 font-medium px-6 py-3">
                Player
              </th>
              <th className="text-center text-xs text-zinc-500 font-medium px-6 py-3">
                Solved
              </th>
              <th className="text-center text-xs text-zinc-500 font-medium px-6 py-3">
                Time
              </th>
              <th className="text-center text-xs text-zinc-500 font-medium px-6 py-3">
                Score
              </th>
              <th className="text-right text-xs text-zinc-500 font-medium px-6 py-3">
                Δ Rating
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((player, index) => {
              const style = rankStyles[player.rank];
              const RankIcon = style?.icon;

              return (
                <motion.tr
                  key={player.rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                  className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.02] ${
                    style ? `${style.bg} ${style.glow}` : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {RankIcon ? (
                        <RankIcon size={18} className={style.badge} />
                      ) : (
                        <span className="text-zinc-500 text-sm font-mono w-[18px] text-center">
                          {player.rank}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          style
                            ? "bg-gradient-to-br from-cyan-400 to-blue-500 text-black"
                            : "bg-white/10 text-zinc-400"
                        }`}
                      >
                        {player.avatar}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          style ? "text-white" : "text-zinc-300"
                        }`}
                      >
                        {player.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-white font-semibold">
                      {player.solved}/4
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-zinc-400 font-mono">
                      {player.time}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-cyan-400 font-bold">
                      {player.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm text-green-400 font-medium">
                      {player.ratingDelta}
                    </span>
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
