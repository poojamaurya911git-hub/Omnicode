// FILE: components/profile/TopicRadar.jsx
"use client";

import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { topicStrengths } from "@/lib/mockData";

export default function TopicRadar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="glass rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">
        Topic Distribution
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={topicStrengths} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="topic"
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#52525b", fontSize: 10 }}
            axisLine={false}
          />
          <Radar
            name="Strength"
            dataKey="score"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
