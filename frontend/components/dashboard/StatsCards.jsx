// FILE: components/dashboard/StatsCards.jsx
"use client";

import { motion } from "framer-motion";
import { FileCode, Flame, TrendingUp, Globe } from "lucide-react";
import { dashboardStats } from "@/lib/mockData";

const cards = [
  {
    icon: FileCode,
    label: "Total Solved",
    value: dashboardStats.totalSolved,
    change: dashboardStats.weeklyChange.solved,
    changeLabel: "this week",
    color: "text-cyan-400",
  },
  {
    icon: Flame,
    label: "Current Streak",
    value: `${dashboardStats.currentStreak} days`,
    change: dashboardStats.weeklyChange.streak,
    changeLabel: "days",
    emoji: "🔥",
    color: "text-orange-400",
  },
  {
    icon: TrendingUp,
    label: "CF Rating",
    value: dashboardStats.cfRating,
    change: dashboardStats.weeklyChange.rating,
    changeLabel: "this month",
    color: "text-blue-400",
  },
  {
    icon: Globe,
    label: "Global Rank",
    value: `#${dashboardStats.globalRank.toLocaleString()}`,
    change: dashboardStats.weeklyChange.rank,
    changeLabel: "positions",
    color: "text-green-400",
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="glass rounded-2xl p-6 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Icon size={20} className={card.color} />
              </div>
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full font-medium">
                ↑ {card.change}
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {card.value} {card.emoji || ""}
            </div>
            <div className="text-zinc-500 text-sm">{card.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
