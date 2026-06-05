// FILE: components/landing/CTASection.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

export default function CTASection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setEmail("");
    }
  };

  return (
    <section className="py-32 relative">
      {/* Glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-7xl font-black mb-6">
            Ready to{" "}
            <span className="gradient-text">level up</span>?
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
            Join 50,000+ competitive programmers already using OmniCode to
            sharpen their skills and climb the ranks.
          </p>

          {/* Email Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-5 py-3 glass rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-all duration-200"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 text-black font-bold rounded-lg glow-cyan hover:bg-cyan-400 transition-all duration-200 whitespace-nowrap"
            >
              {submitted ? (
                <>
                  <Check size={18} />
                  Subscribed!
                </>
              ) : (
                <>
                  Get Early Access
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-zinc-600 text-sm mt-4"
          >
            Free forever for students. No credit card required.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
