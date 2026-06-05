// FILE: components/landing/TestimonialsSection.jsx
"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { testimonials } from "@/lib/mockData";

export default function TestimonialsSection() {
  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Loved by <span className="gradient-text">top coders</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Join thousands of competitive programmers who have transformed their
            practice with OmniCode.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass rounded-2xl p-8 relative group"
            >
              <Quote
                size={32}
                className="text-cyan-400/20 absolute top-6 right-6"
              />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-black font-bold text-sm shrink-0">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {testimonial.name}
                  </div>
                  <div className="text-cyan-400 text-sm">
                    {testimonial.role}
                  </div>
                </div>
              </div>
              <p className="text-zinc-400 leading-relaxed text-sm italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
