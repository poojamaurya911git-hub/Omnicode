// FILE: components/practice/CodeEditor.jsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Send, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import { codeTemplate } from "@/lib/mockData";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[400px] bg-black/40">
      <div className="text-zinc-500 text-sm">Loading editor...</div>
    </div>
  ),
});

const languages = [
  { value: "cpp", label: "C++" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
];

export default function CodeEditor({ problem }) {
  const [code, setCode] = useState(codeTemplate);
  const [language, setLanguage] = useState("javascript");
  const [showOutput, setShowOutput] = useState(false);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showProblem, setShowProblem] = useState(true);

  const handleRun = () => {
    setIsRunning(true);
    setShowOutput(true);
    setTimeout(() => {
      setOutput({
        status: "AC",
        message: "Accepted",
        runtime: "4ms",
        memory: "42.1 MB",
        testCases: "52/52 test cases passed",
      });
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    setIsRunning(true);
    setShowOutput(true);
    setTimeout(() => {
      const isAccepted = Math.random() > 0.3;
      setOutput({
        status: isAccepted ? "AC" : "WA",
        message: isAccepted ? "Accepted" : "Wrong Answer",
        runtime: isAccepted ? "4ms" : "N/A",
        memory: isAccepted ? "42.1 MB" : "N/A",
        testCases: isAccepted
          ? "52/52 test cases passed"
          : "Failed on test case 13/52",
      });
      setIsRunning(false);
    }, 2000);
  };

  const currentProblem = problem || {
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-[calc(100vh-140px)] glass rounded-2xl overflow-hidden"
    >
      {/* Problem Statement (collapsible) */}
      <div className="border-b border-white/5">
        <button
          onClick={() => setShowProblem(!showProblem)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-white hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-mono text-xs">01</span>
            <span>{currentProblem.title}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium difficulty-${currentProblem.difficulty.toLowerCase()}`}
            >
              {currentProblem.difficulty}
            </span>
          </div>
          {showProblem ? (
            <ChevronUp size={16} className="text-zinc-500" />
          ) : (
            <ChevronDown size={16} className="text-zinc-500" />
          )}
        </button>

        <AnimatePresence>
          {showProblem && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4 text-sm text-zinc-400 leading-relaxed">
                <p className="mb-3">{currentProblem.description}</p>
                {currentProblem.examples?.map((ex, i) => (
                  <div
                    key={i}
                    className="bg-white/[0.03] rounded-lg p-3 mb-2 font-mono text-xs"
                  >
                    <div className="text-zinc-500 mb-1">Example {i + 1}:</div>
                    <div>
                      <span className="text-zinc-500">Input: </span>
                      <span className="text-cyan-400">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Output: </span>
                      <span className="text-green-400">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div className="text-zinc-600 mt-1">
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/30">
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-zinc-900">
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            renderLineHighlight: "line",
            padding: { top: 16 },
            cursorBlinking: "smooth",
            smoothScrolling: true,
            tabSize: 2,
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-black/30">
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <Play size={14} />
            Run
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2 bg-cyan-500 text-black rounded-lg text-sm font-bold glow-cyan-sm hover:bg-cyan-400 transition-all disabled:opacity-50"
          >
            <Send size={14} />
            Submit
          </motion.button>
        </div>

        {isRunning && (
          <div className="flex items-center gap-2 text-sm text-cyan-400">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            Running...
          </div>
        )}
      </div>

      {/* Output Console */}
      <AnimatePresence>
        {showOutput && output && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/5 bg-black/50"
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {output.status === "AC" ? (
                  <CheckCircle size={20} className="text-green-400" />
                ) : (
                  <XCircle size={20} className="text-red-400" />
                )}
                <span
                  className={`text-lg font-bold ${
                    output.status === "AC" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {output.message}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-zinc-500">Runtime: </span>
                  <span className="text-white">{output.runtime}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Memory: </span>
                  <span className="text-white">{output.memory}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Tests: </span>
                  <span className="text-white">{output.testCases}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
