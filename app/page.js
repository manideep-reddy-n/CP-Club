"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Trophy, BookOpen, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [raindrops, setRaindrops] = useState([]);

  useEffect(() => {
    const drops = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,      // Random position
      delay: Math.random() * 5,             // Random delay
      duration: Math.random() * 2 + 2,      // Random duration
      char: Math.random() > 0.5 ? "1" : "0" // Random character
    }));
    setRaindrops(drops);
  }, []);

  const stats = [
    { label: "Active Members", value: "50+", icon: Users },
    { label: "Contests Hosted", value: "10+", icon: Trophy },
    { label: "Resources", value: "200+", icon: BookOpen },
    { label: "Problems Solved", value: "5K+", icon: Sparkles },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Binary Rain Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

        {/* Floating binary numbers */}
        <div className="absolute inset-0 font-mono text-xs text-green-500/10 select-none">
          {raindrops.map((drop) => (
            <motion.div
              key={drop.id}
              className="absolute"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: "100vh", opacity: [0, 1, 0] }}
              style={{ left: drop.left }}
              transition={{
                duration: drop.duration,
                delay: drop.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {drop.char}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-matrix-200/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-[120px] animate-pulse-slow" />

      {/* Hero Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center space-y-8">
          {/* Headline */}
          <motion.div variants={itemVariants} className="space-y-4">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-matrix-200/20 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <span className="w-2 h-2 bg-matrix-200 rounded-full animate-pulse" />
              <span className="text-sm text-zinc-400 font-mono">
                BigOOne
              </span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-mono font-bold leading-tight">
              <span className="text-white">Where </span>
              <span className="bg-gradient-to-r from-matrix-100 via-matrix-200 to-emerald-400 bg-clip-text text-transparent animate-gradient-x">
                Algorithms
              </span>
              <br />
              <span className="text-white">Meet </span>
              <span className="bg-gradient-to-r from-emerald-400 via-matrix-200 to-matrix-100 bg-clip-text text-transparent animate-gradient-x">
                Excellence
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Join the most active competitive programming community. Solve problems,
              compete in contests, and level up your coding skills.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/leaderboard">
              <Button
                size="lg"
                className="bg-matrix-200 text-black hover:bg-matrix-100 font-mono font-bold shadow-glow-md hover:shadow-glow-lg transition-all duration-300 group px-8 py-6 text-base"
              >
                View Leaderboard
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/resources">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-matrix-200 text-matrix-200 hover:bg-green-200 font-mono font-bold backdrop-blur-sm bg-black/20 px-8 py-6 text-base hover:shadow-glow-sm transition-all duration-300 transform will-change-transform hover:-translate-y-1 hover:scale-[1.02] group-hover:border-matrix-100"
              >
                <BookOpen className="mr-2 w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                Resources
              </Button>
            </Link>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="pt-12"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    variants={statsVariants}
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                    className="glass-card p-6 text-center group cursor-pointer"
                  >
                    <div className="flex justify-center mb-3">
                      <div className="p-3 rounded-lg bg-matrix-200/10 text-matrix-200 group-hover:bg-matrix-200/20 transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="text-3xl font-mono font-bold text-white mb-2 group-hover:text-matrix-200 transition-colors">
                      {stat.value}
                    </div>
                    <div className="text-sm text-zinc-400 font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
