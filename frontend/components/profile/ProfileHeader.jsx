// FILE: components/profile/ProfileHeader.jsx
"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, ExternalLink } from "lucide-react";
import { userProfile, analyzerResults } from "@/lib/mockData";

const platformStyles = {
  leetcode: { label: "LC", color: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30" },
  codechef: { label: "CC", color: "bg-amber-600/15 text-amber-500 border-amber-600/30" },
  codeforces: { label: "CF", color: "bg-blue-400/15 text-blue-400 border-blue-400/30" },
};

export default function ProfileHeader() {
  const stats = [
    {
      icon: "🏆",
      value: userProfile.stats.totalSolved,
      label: "Total Problems",
      color: "text-cyan-400",
    },
    {
      icon: "🔥",
      value: `${userProfile.stats.streak} days`,
      label: "Current Streak",
      color: "text-orange-400",
    },
    {
      icon: "⚡",
      value: `#${userProfile.stats.globalRank}`,
      label: "Global Rank",
      color: "text-yellow-400",
    },
    {
      icon: "📊",
      value: `${userProfile.stats.consistency}%`,
      label: "Consistency",
      color: "text-green-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-8"
      >
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-3xl font-bold text-black shrink-0 ring-4 ring-cyan-400/20">
            AV
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">
                {userProfile.name}
              </h1>
              {/* Platform badges */}
              {Object.entries(analyzerResults.platforms).map(([key]) => {
                const style = platformStyles[key];
                return (
                  <span
                    key={key}
                    className={`text-xs px-2 py-0.5 rounded-md font-semibold border ${style.color}`}
                  >
                    {style.label}
                  </span>
                );
              })}
            </div>
            <p className="text-zinc-400 text-sm mb-3">{userProfile.bio}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Active since {userProfile.joinDate}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              className="glass rounded-xl p-4 text-center"
            >
              <span className="text-lg">{stat.icon}</span>
              <div className={`text-2xl font-bold mt-1 ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Connected Platforms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">
          Connected Platforms
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {Object.entries(analyzerResults.platforms).map(
            ([key, platform], i) => {
              const style = platformStyles[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  className="glass rounded-2xl p-6 relative"
                >
                  {/* Online dot */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full" />

                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${style.color}`}
                    >
                      {style.label}
                    </div>
                    <div>
                      <div className="text-white font-semibold capitalize">
                        {key}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {platform.handle}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Problems Solved</span>
                      <span className="text-white font-semibold">
                        {platform.solved}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Rating</span>
                      <span className="text-cyan-400 font-bold">
                        {platform.rating}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Rank</span>
                      <span className="text-white font-medium">
                        {platform.rank}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-4 text-xs text-zinc-600">
                    <Calendar size={12} />
                    Last active {platform.lastActive}
                  </div>
                </motion.div>
              );
            }
          )}
        </div>
      </motion.div>
    </div>
  );
}
