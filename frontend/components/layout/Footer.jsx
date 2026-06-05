// FILE: components/layout/Footer.jsx
"use client";

import { motion } from "framer-motion";
import { Mail, Globe, Code2, Heart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Custom SVG icons for social media (lucide-react v1.17+ removed brand icons)
function GitHubIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function TwitterXIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const footerLinks = {
  Product: [
    { label: "Practice", href: "/practice" },
    { label: "Battle Mode", href: "/battle" },
    { label: "AI Coach", href: "/ai-coach" },
    { label: "Analyzer", href: "/analyzer" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API", href: "#" },
    { label: "Status", href: "#" },
    { label: "Changelog", href: "#" },
  ],
};

const socialLinks = [
  { icon: GitHubIcon, href: "#", label: "GitHub" },
  { icon: TwitterXIcon, href: "#", label: "Twitter" },
  { icon: LinkedInIcon, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
];

// Pages where footer should NOT appear
const noFooterPages = ["/dashboard", "/ai-coach"];

export default function Footer() {
  const pathname = usePathname();

  // Don't render Footer on full-height layout pages (dashboard, ai-coach)
  if (noFooterPages.some((p) => pathname?.startsWith(p))) {
    return null;
  }

  return (
    <footer className="relative border-t border-white/5 bg-black/50 backdrop-blur-xl z-10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-cyan-400 font-bold text-xl">&lt;&gt;</span>
              <span className="text-white font-bold text-xl tracking-tight">
                Omni<span className="text-cyan-400">Code</span>
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6 max-w-xs">
              The AI-powered competitive programming platform. Code, compete,
              and dominate across all platforms.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                const isLucide = social.icon === Mail;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-cyan-400 hover:border-cyan-400/30 transition-all duration-200"
                    aria-label={social.label}
                  >
                    {isLucide ? <Icon size={16} /> : <Icon size={16} />}
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-sm mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-zinc-500 hover:text-cyan-400 text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm flex items-center gap-1">
            © {new Date().getFullYear()} OmniCode. Built with{" "}
            <Heart size={12} className="text-red-500 fill-red-500" /> for
            competitive programmers.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
