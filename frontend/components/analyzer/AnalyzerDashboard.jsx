// FILE: components/analyzer/AnalyzerDashboard.jsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Check,
  Link2,
  ExternalLink,
  TrendingUp,
  AlertTriangle,
  Target,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { analyzerResults, topicStrengths } from "@/lib/mockData";

const platformConfig = {
  leetcode: {
    name: "LeetCode",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    label: "LC",
  },
  codechef: {
    name: "CodeChef",
    color: "text-amber-600",
    bg: "bg-amber-600/10 border-amber-600/20",
    label: "CC",
  },
  codeforces: {
    name: "Codeforces",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    label: "CF",
  },
};

const loadingSteps = [
  "Fetching data from platforms...",
  "Processing submissions...",
  "Running AI analysis...",
  "Generating recommendations...",
];

export default function AnalyzerDashboard() {
  const [connectedPlatforms, setConnectedPlatforms] = useState({
    leetcode: true,
    codechef: true,
    codeforces: true,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setCurrentStep(0);

    loadingSteps.forEach((_, index) => {
      setTimeout(() => {
        setCurrentStep(index);
      }, index * 800);
    });

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 3200);
  };

  const togglePlatform = (key) => {
    setConnectedPlatforms((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const consistencyData = [
    { name: "Score", value: analyzerResults.consistencyScore },
    { name: "Remaining", value: 100 - analyzerResults.consistencyScore },
  ];

  const difficultyColors = {
    Easy: "difficulty-easy",
    Medium: "difficulty-medium",
    Hard: "difficulty-hard",
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-black gradient-text mb-3">
          AI Profile Analyzer
        </h1>
        <p className="text-zinc-400 text-lg">
          Connect your competitive programming profiles for AI-powered insights
        </p>
      </motion.div>

      {/* Connect Platforms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid sm:grid-cols-3 gap-4 mb-8"
      >
        {Object.entries(platformConfig).map(([key, config], i) => {
          const isConnected = connectedPlatforms[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className={`glass rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                isConnected ? "border-cyan-500/30" : ""
              }`}
              onClick={() => togglePlatform(key)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${config.bg} ${config.color}`}
                  >
                    {config.label}
                  </div>
                  <span className="text-white font-semibold">
                    {config.name}
                  </span>
                </div>
                {isConnected && (
                  <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center">
                    <Check size={14} className="text-green-400" />
                  </div>
                )}
              </div>
              <button
                className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                  isConnected
                    ? "bg-green-400/10 text-green-400 border border-green-400/20"
                    : "bg-white/5 text-zinc-400 border border-white/10 hover:text-white hover:bg-white/10"
                }`}
              >
                {isConnected ? "Connected" : "Connect"}
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Analyze Button / Loading */}
      {!analysisComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col items-center mb-12"
        >
          {isAnalyzing ? (
            <div className="glass rounded-2xl p-8 w-full max-w-md text-center">
              <div className="w-12 h-12 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-cyan-400 font-medium"
                >
                  {loadingSteps[currentStep]}
                </motion.p>
              </AnimatePresence>
              {/* Progress bar */}
              <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${((currentStep + 1) / loadingSteps.length) * 100}%`,
                  }}
                  transition={{ duration: 0.6 }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                />
              </div>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyze}
              className="flex items-center gap-3 px-10 py-4 bg-cyan-500 text-black font-bold text-lg rounded-xl glow-cyan hover:bg-cyan-400 transition-all"
            >
              <Sparkles size={22} />
              Analyze Now
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Results Dashboard */}
      <AnimatePresence>
        {analysisComplete && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Tier + Consistency */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {/* Tier Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="glass rounded-2xl p-8 text-center glow-cyan"
              >
                <div className="text-sm text-zinc-400 mb-2">Current Tier</div>
                <div className="text-4xl font-black gradient-text mb-2">
                  {analyzerResults.tier}
                </div>
                <div className="text-sm text-zinc-500">
                  Based on {analyzerResults.totalSolved} problems across all
                  platforms
                </div>
              </motion.div>

              {/* Consistency Donut */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="glass rounded-2xl p-6 flex items-center gap-6"
              >
                <div className="w-32 h-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={consistencyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={0}
                        dataKey="value"
                      >
                        <Cell fill="#06b6d4" />
                        <Cell fill="rgba(255,255,255,0.05)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <div className="text-4xl font-black text-cyan-400">
                    {analyzerResults.consistencyScore}
                    <span className="text-xl text-zinc-500">/100</span>
                  </div>
                  <div className="text-sm text-zinc-400 mt-1">
                    Consistency Score
                  </div>
                  <div className="text-xs text-zinc-600 mt-2">
                    Based on daily activity, streak patterns, and submission
                    frequency
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Strong/Weak Topics */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-green-400" />
                  Strong Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analyzerResults.strongTopics.map((topic) => (
                    <span
                      key={topic.name}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-400/10 text-green-400 border border-green-400/20"
                    >
                      {topic.name}{" "}
                      <span className="text-green-400/60">
                        {topic.percentage}%
                      </span>
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-400" />
                  Weak Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analyzerResults.weakTopics.map((topic) => (
                    <span
                      key={topic.name}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-400/10 text-red-400 border border-red-400/20"
                    >
                      {topic.name}{" "}
                      <span className="text-red-400/60">
                        {topic.percentage}%
                      </span>
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Radar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="glass rounded-2xl p-6 mb-8"
            >
              <h3 className="text-white font-semibold mb-4">
                Topic Distribution
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart
                  data={topicStrengths}
                  cx="50%"
                  cy="50%"
                  outerRadius="75%"
                >
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
                    dataKey="score"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Recommended Problems */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Target size={20} className="text-cyan-400" />
                Recommended Problems
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {analyzerResults.recommendedProblems.map((problem, i) => (
                  <motion.div
                    key={problem.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    className="glass rounded-2xl p-5 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                          {problem.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-zinc-500">
                            {problem.platform}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium ${difficultyColors[problem.difficulty]}`}
                          >
                            {problem.difficulty}
                          </span>
                        </div>
                      </div>
                      <ExternalLink
                        size={16}
                        className="text-zinc-600 group-hover:text-cyan-400 transition-colors"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
