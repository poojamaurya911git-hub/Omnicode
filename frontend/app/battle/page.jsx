// FILE: app/battle/page.jsx
"use client";

import BattleArena from "@/components/battle/BattleArena";
import LiveLeaderboard from "@/components/battle/LiveLeaderboard";

export default function BattlePage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <BattleArena />
        <LiveLeaderboard />
      </div>
    </div>
  );
}
