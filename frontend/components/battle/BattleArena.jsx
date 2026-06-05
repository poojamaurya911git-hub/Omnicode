// FILE: components/battle/BattleArena.jsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Users, Clock, Plus, X, Zap, Shield } from "lucide-react";
import { battleRooms } from "@/lib/mockData";

const difficultyColors = {
  Easy: "difficulty-easy",
  Medium: "difficulty-medium",
  Hard: "difficulty-hard",
};

function CreateRoomModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="glass rounded-2xl p-8 w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Create Battle Room</h3>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">
                Room Name
              </label>
              <input
                type="text"
                placeholder="e.g., DP Masters"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">
                Difficulty
              </label>
              <select className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer">
                <option value="Easy" className="bg-zinc-900">Easy</option>
                <option value="Medium" className="bg-zinc-900">Medium</option>
                <option value="Hard" className="bg-zinc-900">Hard</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">
                Max Participants
              </label>
              <input
                type="number"
                defaultValue={8}
                min={2}
                max={20}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">
                Duration (minutes)
              </label>
              <input
                type="number"
                defaultValue={30}
                min={10}
                max={120}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 py-3 bg-cyan-500 text-black font-bold rounded-lg glow-cyan hover:bg-cyan-400 transition-all"
          >
            Create Room
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function BattleArena() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 relative"
      >
        {/* Sparks effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: `${30 + i * 8}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
            />
          ))}
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-sm text-cyan-400 mb-6">
          <Zap size={14} />
          <span>Live Battles Active</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black gradient-text mb-4">
          Battle Arena
        </h1>
        <p className="text-zinc-400 text-lg max-w-lg mx-auto">
          Challenge other coders in real-time competitive programming battles
        </p>
      </motion.div>

      {/* Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <h2 className="text-xl font-semibold text-white">Active Rooms</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-black font-bold text-sm rounded-lg glow-cyan-sm hover:bg-cyan-400 transition-all"
        >
          <Plus size={16} />
          Create Room
        </motion.button>
      </motion.div>

      {/* Battle Rooms Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {battleRooms.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="glass rounded-2xl p-6 group cursor-pointer relative overflow-hidden"
          >
            {room.status === "live" && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-400 font-medium">LIVE</span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Swords size={20} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{room.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${difficultyColors[room.difficulty]}`}>
                  {room.difficulty}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-5 text-sm text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Users size={14} />
                <span>
                  {room.participants}/{room.maxParticipants}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span
                  className={
                    room.timeLeft.startsWith("0") ? "text-red-400 font-bold" : ""
                  }
                >
                  {room.timeLeft}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield size={14} />
                <span>{room.problemCount} problems</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${
                room.status === "live"
                  ? "bg-cyan-500 text-black glow-cyan-sm hover:bg-cyan-400"
                  : "bg-white/10 text-white border border-white/10 hover:bg-white/15"
              }`}
            >
              {room.status === "live" ? "Join Battle" : "Waiting..."}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Timer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="glass rounded-2xl p-8 text-center mb-12"
      >
        <p className="text-zinc-400 text-sm mb-2">Next Contest Starts In</p>
        <div className="flex items-center justify-center gap-4">
          {[
            { value: "02", label: "HRS" },
            { value: "14", label: "MIN" },
            { value: "32", label: "SEC" },
          ].map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-4">
              <div>
                <div className="text-5xl font-black gradient-text">
                  {unit.value}
                </div>
                <div className="text-xs text-zinc-500 mt-1 tracking-wider">
                  {unit.label}
                </div>
              </div>
              {i < 2 && (
                <span className="text-2xl text-zinc-600 font-bold">:</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <CreateRoomModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
