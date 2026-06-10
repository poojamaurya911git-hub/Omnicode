// FILE: components/layout/Navbar.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  Swords,
  User,
  Bot,
  Bell,
  Sparkles,
} from "lucide-react";



const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/practice", label: "Practice", icon: Target },
  { href: "/battle", label: "Battle", icon: Swords },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/ai-coach", label: "AI Coach", icon: Bot },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="text-cyan-400 font-bold text-xl flex items-center gap-1">
            <span className="text-cyan-400">&lt;&gt;</span>
            <span className="text-white font-bold tracking-tight">
              Omni
              <span className="text-cyan-400">Code</span>
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname?.startsWith(link.href));
            const Icon = link.icon;

            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-cyan-400 bg-cyan-400/10 border border-cyan-400/20"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg border border-cyan-400/30 bg-cyan-400/5"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="relative flex items-center gap-3">
          <Link href="/analyzer">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-semibold text-sm rounded-lg glow-cyan-sm hover:bg-cyan-400 transition-all duration-200"
            >
              <Sparkles size={16} />
              Connect Profiles
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
             onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full" />
          </motion.button>

          {showNotifications && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="absolute top-14 right-16 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-4 z-50"
  >
    <h3 className="text-white font-semibold mb-3">
      Notifications
    </h3>

    <div className="space-y-3">
      <div className="p-3 rounded-lg bg-zinc-800">
        <p className="text-sm text-white">
          🎉 Welcome to OmniCode!
        </p>
      </div>

      <div className="p-3 rounded-lg bg-zinc-800">
        <p className="text-sm text-white">
          ⚡ New coding challenge available.
        </p>
      </div>

      <div className="p-3 rounded-lg bg-zinc-800">
        <p className="text-sm text-white">
          🏆 Your rank improved by 5 places.
        </p>
      </div>
    </div>
  </motion.div>
)}



         <Link href="/profile">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-black font-bold text-sm cursor-pointer"
          >
            A
          </motion.div></Link>
        </div>
      </div>
    </motion.nav>
  );
}
