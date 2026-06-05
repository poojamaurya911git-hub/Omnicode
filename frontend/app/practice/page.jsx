// FILE: app/practice/page.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ProblemFilters from "@/components/practice/ProblemFilters";
import ProblemList from "@/components/practice/ProblemList";
import CodeEditor from "@/components/practice/CodeEditor";
import { problems } from "@/lib/mockData";

export default function PracticePage() {
  const [selectedProblem, setSelectedProblem] = useState(problems[0]);
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Practice Arena</h1>
          <p className="text-zinc-500 mt-1">
            Master your skills across all platforms
          </p>
        </motion.div>

        {showEditor ? (
          /* Editor View */
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEditor(false)}
                className="mb-4 text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                ← Back to problems
              </motion.button>
              <ProblemList
                onSelectProblem={(p) => setSelectedProblem(p)}
                selectedProblem={selectedProblem}
              />
            </div>
            <CodeEditor problem={selectedProblem} />
          </div>
        ) : (
          /* Browse View */
          <div className="grid lg:grid-cols-[260px_1fr] gap-6">
            <ProblemFilters />
            <ProblemList
              onSelectProblem={(p) => {
                setSelectedProblem(p);
                setShowEditor(true);
              }}
              selectedProblem={selectedProblem}
            />
          </div>
        )}
      </div>
    </div>
  );
}
