// FILE: components/dashboard/RatingChart.jsx
"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { ratingHistory, topicStrengths } from "@/lib/mockData";

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg p-3 border border-white/10">
        <p className="text-zinc-400 text-xs">{label}</p>
        <p className="text-cyan-400 font-bold text-sm">
          Rating: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
}

export function RatingLineChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="glass rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">
        Codeforces Rating
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={ratingHistory}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis
            dataKey="month"
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            domain={["dataMin - 100", "dataMax + 100"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#06b6d4"
            strokeWidth={3}
            dot={{
              fill: "#06b6d4",
              strokeWidth: 2,
              stroke: "#000",
              r: 4,
            }}
            activeDot={{
              r: 6,
              fill: "#06b6d4",
              stroke: "#06b6d4",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function TopicRadarChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="glass rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-6">
        Topic Strengths
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={topicStrengths}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis
            dataKey="topic"
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#52525b", fontSize: 10 }}
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
