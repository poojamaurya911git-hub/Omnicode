// FILE: app/dashboard/page.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Swords,
  User,
  Bot,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import StatsCards from "@/components/dashboard/StatsCards";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import { RatingLineChart, TopicRadarChart } from "@/components/dashboard/RatingChart";
import RecentSubmissions from "@/components/dashboard/RecentSubmissions";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/practice", label: "Practice", icon: Target },
  { href: "/battle", label: "Battle", icon: Swords },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/ai-coach", label: "AI Coach", icon: Bot },
  { href: "/analyzer", label: "Analyzer", icon: BarChart3 },
  { href: "#", label: "Settings", icon: Settings },
];

function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`hidden lg:flex flex-col fixed left-0 top-16 bottom-0 z-30 glass border-r border-white/5 transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="flex-1 py-6 px-3 space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link key={link.label} href={link.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400"
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-3 border-t border-white/5 text-zinc-500 hover:text-white transition-colors flex items-center justify-center"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </motion.aside>
  );
}

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-screen pt-16">
      <Sidebar />

      <div className="flex-1 lg:ml-56 p-6 lg:p-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">
            Good morning, Aryan 👋
          </h1>
          <p className="text-zinc-500 mt-1">{today}</p>
        </motion.div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Activity Heatmap */}
        <div className="mt-6">
          <ActivityHeatmap />
        </div>

        {/* Charts Row */}
        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <RatingLineChart />
          <TopicRadarChart />
        </div>

        {/* Recent Submissions */}
        <div className="mt-6">
          <RecentSubmissions />
        </div>
      </div>
    </div>
  );
}
