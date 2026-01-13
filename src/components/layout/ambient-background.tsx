"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getTimeOfDay } from "@/lib/utils";

/**
 * AmbientBackground - Dynamic gradient background that changes based on time of day
 * Creates an immersive, atmospheric experience
 */

type TimeOfDay = "morning" | "day" | "evening" | "night";

interface GradientConfig {
  primary: string;
  secondary: string;
  accent: string;
  mesh: string;
}

const gradientConfigs: Record<TimeOfDay, GradientConfig> = {
  morning: {
    primary: "from-indigo-900 via-purple-800 to-pink-700",
    secondary: "from-orange-500/20 via-pink-500/20 to-purple-600/20",
    accent: "bg-gradient-to-br from-amber-400/10 to-rose-400/10",
    mesh: "radial-gradient(at 20% 30%, hsla(280, 100%, 70%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 20%, hsla(340, 100%, 70%, 0.15) 0px, transparent 50%), radial-gradient(at 40% 80%, hsla(20, 100%, 60%, 0.1) 0px, transparent 50%)",
  },
  day: {
    primary: "from-cyan-900 via-blue-800 to-indigo-800",
    secondary: "from-cyan-400/20 via-teal-400/20 to-blue-500/20",
    accent: "bg-gradient-to-br from-sky-400/10 to-cyan-400/10",
    mesh: "radial-gradient(at 10% 20%, hsla(180, 100%, 60%, 0.15) 0px, transparent 50%), radial-gradient(at 90% 30%, hsla(220, 100%, 70%, 0.15) 0px, transparent 50%), radial-gradient(at 50% 90%, hsla(200, 100%, 50%, 0.1) 0px, transparent 50%)",
  },
  evening: {
    primary: "from-orange-900 via-rose-800 to-purple-900",
    secondary: "from-orange-500/20 via-rose-500/20 to-purple-600/20",
    accent: "bg-gradient-to-br from-orange-400/10 to-pink-400/10",
    mesh: "radial-gradient(at 70% 20%, hsla(20, 100%, 60%, 0.2) 0px, transparent 50%), radial-gradient(at 20% 60%, hsla(340, 100%, 60%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 80%, hsla(280, 100%, 50%, 0.1) 0px, transparent 50%)",
  },
  night: {
    primary: "from-slate-950 via-slate-900 to-indigo-950",
    secondary: "from-indigo-600/10 via-purple-600/10 to-blue-700/10",
    accent: "bg-gradient-to-br from-indigo-500/5 to-purple-500/5",
    mesh: "radial-gradient(at 30% 40%, hsla(240, 100%, 50%, 0.1) 0px, transparent 50%), radial-gradient(at 70% 70%, hsla(260, 100%, 40%, 0.1) 0px, transparent 50%), radial-gradient(at 90% 10%, hsla(220, 100%, 50%, 0.05) 0px, transparent 50%)",
  },
};

export function AmbientBackground() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("day");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      setTimeOfDay(getTimeOfDay(hour));
    };

    updateTimeOfDay();
    // Update every minute
    const interval = setInterval(updateTimeOfDay, 60000);

    return () => clearInterval(interval);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
    );
  }

  const config = gradientConfigs[timeOfDay];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Primary gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className={`absolute inset-0 bg-gradient-to-br ${config.primary}`}
      />

      {/* Mesh gradient overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute inset-0"
        style={{ background: config.mesh }}
      />

      {/* Animated floating orbs */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/10 blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 30, -20, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-500/15 to-blue-500/10 blur-3xl"
      />

      <motion.div
        animate={{
          x: [0, 20, -30, 0],
          y: [0, -20, 40, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-600/5 blur-3xl"
      />

      {/* Subtle grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
    </div>
  );
}

