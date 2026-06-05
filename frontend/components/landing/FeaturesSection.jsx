// FILE: components/landing/FeaturesSection.jsx
"use client";

import { motion } from "framer-motion";
import { Users, Brain, RefreshCw, Swords, Calendar, Sparkles } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Real-Time Collaboration",
    description:
      "Code together in real-time with friends and teammates. Share solutions, compete head-to-head, and learn collaboratively.",
  },
  {
    icon: Brain,
    title: "AI Code Analysis",
    description:
      "Get instant feedback on your code quality, time complexity, and optimization suggestions powered by advanced AI.",
  },
  {
    icon: RefreshCw,
    title: "Multi-Platform Sync",
    description:
      "Connect LeetCode, Codeforces, and CodeChef profiles. Track all your progress in one unified dashboard.",
  },
  {
    icon: Swords,
    title: "Battle Mode",
    description:
      "Challenge others in timed coding battles. Climb the leaderboards and prove you're the best competitive programmer.",
  },
  {
    icon: Calendar,
    title: "Progress Heatmap",
    description:
      "Visualize your coding consistency with a GitHub-style heatmap. Track streaks and maintain daily practice habits.",
  },
  {
    icon: Sparkles,
    title: "Smart Recommendations",
    description:
      "AI-powered problem recommendations based on your strengths, weaknesses, and learning goals. Never waste time on wrong problems.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function FeaturesSection() {
  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need to{" "}
            <span className="gradient-text">dominate</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            A complete toolkit designed for competitive programmers who want to
            level up faster than ever before.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  borderColor: "rgba(6, 182, 212, 0.3)",
                }}
                className="group glass rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:bg-white/[0.08]"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:glow-cyan-sm transition-all duration-300">
                  <Icon size={24} className="text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
