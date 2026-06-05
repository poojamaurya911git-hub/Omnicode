// FILE: app/ai-coach/page.jsx
"use client";

import ChatInterface from "@/components/ai-coach/ChatInterface";

export default function AICoachPage() {
  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <ChatInterface />
      </div>
    </div>
  );
}
