// FILE: app/analyzer/page.jsx
"use client";

import AnalyzerDashboard from "@/components/analyzer/AnalyzerDashboard";

export default function AnalyzerPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-6">
        <AnalyzerDashboard />
      </div>
    </div>
  );
}
