// FILE: app/layout.jsx
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "OmniCode — Code. Compete. Dominate.",
  description:
    "The AI-powered competitive programming platform. Sync your profiles, battle in real-time, and level up with personalized AI coaching.",
  keywords: [
    "competitive programming",
    "leetcode",
    "codeforces",
    "codechef",
    "AI coach",
    "coding battles",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-black text-white font-sans">
        {/* Animated Grid Background */}
        <div className="animated-grid" />

        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="relative z-10">{children}</main>

        {/* Footer — conditionally renders based on route (see Footer.jsx) */}
        <Footer />
      </body>
    </html>
  );
}
