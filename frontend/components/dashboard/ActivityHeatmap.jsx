// FILE: components/dashboard/ActivityHeatmap.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { heatmapData } from "@/lib/mockData";

const platformTabs = ["All", "LeetCode", "Codeforces", "CodeChef"];

function getHeatmapLevel(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  if (count <= 9) return 4;
  return 5;
}

export default function ActivityHeatmap() {
  const [activeTab, setActiveTab] = useState("All");

  // Group by week
  const weeks = [];
  for (let w = 0; w < 52; w++) {
    weeks.push(heatmapData.filter((d) => d.week === w));
  }

  const totalSubmissions = heatmapData.reduce((sum, d) => sum + d.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Activity Heatmap
          </h3>
          <p className="text-sm text-zinc-500 mt-1">
            <span className="text-cyan-400 font-semibold">
              {totalSubmissions}
            </span>{" "}
            problems in the last year
          </p>
        </div>

        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {platformTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="flex gap-[3px] min-w-[700px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: weekIndex * 0.01,
                    duration: 0.3,
                  }}
                  className={`w-[12px] h-[12px] rounded-[2px] heatmap-${getHeatmapLevel(
                    day.count
                  )} cursor-pointer transition-all duration-200 hover:ring-1 hover:ring-cyan-400/50`}
                  title={`${day.date}: ${day.count} submissions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-zinc-600">Less</span>
        {[0, 1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`w-[12px] h-[12px] rounded-[2px] heatmap-${level}`}
          />
        ))}
        <span className="text-xs text-zinc-600">More</span>
      </div>
    </motion.div>
  );
}
