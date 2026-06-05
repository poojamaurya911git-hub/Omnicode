// FILE: components/landing/StatsSection.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FileCode, Users, Trophy, Server } from "lucide-react";

function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = target;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + "K";
    return num.toLocaleString();
  };

  return (
    <span ref={ref}>
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

const stats = [
  {
    icon: FileCode,
    value: 1200000,
    suffix: "+",
    label: "Problems Solved",
    description: "Across all platforms",
  },
  {
    icon: Users,
    value: 50000,
    suffix: "+",
    label: "Active Users",
    description: "And growing daily",
  },
  {
    icon: Trophy,
    value: 200,
    suffix: "+",
    label: "Contests Hosted",
    description: "Weekly battles",
  },
  {
    icon: Server,
    value: 99.9,
    suffix: "%",
    label: "Uptime",
    description: "Reliable infrastructure",
  },
];

export default function StatsSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="glass rounded-2xl p-8 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-cyan-400" />
                </div>
                <div className="text-4xl md:text-5xl font-black gradient-text mb-2">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    duration={stat.value > 1000 ? 2500 : 2000}
                  />
                </div>
                <div className="text-white font-semibold mb-1">
                  {stat.label}
                </div>
                <div className="text-zinc-500 text-sm">
                  {stat.description}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
