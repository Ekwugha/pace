"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Flame,
  Trophy,
  Star,
  Zap,
  Target,
  Sun,
  Moon,
  Coffee,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { cn, getEncouragingMessage, getTimeOfDay } from "@/lib/utils";
import { DayPlan } from "@/types";

/**
 * EncouragementCard - Motivational component that provides encouragement
 * based on user's progress and time of day
 */

interface EncouragementCardProps {
  plan: DayPlan | null;
  className?: string;
}

// Icons available for random decorative elements
// const motivationalIcons = [Sparkles, Flame, Trophy, Heart, Star, Zap, Target];

export function EncouragementCard({ plan, className }: EncouragementCardProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const completedPercent = useMemo(() => {
    if (!plan || plan.tasks.length === 0) return 0;
    return (plan.tasks.filter((t) => t.isCompleted).length / plan.tasks.length) * 100;
  }, [plan]);

  // Only generate random message on client to avoid hydration mismatch
  const message = useMemo(() => {
    if (!mounted) return "Let's make today count";
    return getEncouragingMessage(completedPercent);
  }, [completedPercent, mounted]);

  const timeOfDay = useMemo((): "morning" | "day" | "evening" | "night" => {
    if (!mounted) return "day";
    const hour = new Date().getHours();
    return getTimeOfDay(hour);
  }, [mounted]);

  const getGreeting = () => {
    switch (timeOfDay) {
      case "morning":
        return "Good morning";
      case "day":
        return "Good afternoon";
      case "evening":
        return "Good evening";
      case "night":
        return "Good night";
    }
  };

  const getTimeIcon = () => {
    switch (timeOfDay) {
      case "morning":
        return Sun;
      case "day":
        return Zap;
      case "evening":
        return Coffee;
      case "night":
        return Moon;
    }
  };

  const TimeIcon = getTimeIcon();

  // Determine visual state based on progress
  const getProgressState = () => {
    if (completedPercent === 0) return "start";
    if (completedPercent < 50) return "progress";
    if (completedPercent < 100) return "almost";
    return "complete";
  };

  const state = getProgressState();

  const stateConfig = {
    start: {
      gradient: "from-pace-500/20 to-purple-500/20",
      border: "border-pace-400/30",
      icon: Sparkles,
      iconColor: "text-pace-400",
    },
    progress: {
      gradient: "from-amber-500/20 to-orange-500/20",
      border: "border-amber-400/30",
      icon: Flame,
      iconColor: "text-amber-400",
    },
    almost: {
      gradient: "from-emerald-500/20 to-teal-500/20",
      border: "border-emerald-400/30",
      icon: Target,
      iconColor: "text-emerald-400",
    },
    complete: {
      gradient: "from-yellow-500/20 to-amber-500/20",
      border: "border-yellow-400/30",
      icon: Trophy,
      iconColor: "text-yellow-400",
    },
  };

  const config = stateConfig[state];
  const StateIcon = config.icon;

  return (
    <GlassCard
      variant="elevated"
      className={cn(
        "relative overflow-hidden",
        className
      )}
      hover={false}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          config.gradient
        )}
      />

      {/* Animated Glow */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl",
          config.gradient
        )}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                config.gradient,
                config.border,
                "border"
              )}
            >
              <StateIcon className={cn("w-6 h-6", config.iconColor)} />
            </motion.div>
            <div>
              <p className="text-white/60 text-sm">{getGreeting()}</p>
              <h3 className="text-lg font-semibold text-white">
                {plan ? "Here's how you're doing" : "Ready to plan your day?"}
              </h3>
            </div>
          </div>
          <TimeIcon className="w-5 h-5 text-white/40" />
        </div>

        {/* Message */}
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-medium text-white mb-4"
        >
          {message}
        </motion.p>

        {/* Progress Indicator */}
        {plan && plan.tasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Day Progress</span>
              <span className="text-white font-medium">
                {Math.round(completedPercent)}%
              </span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completedPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  state === "complete"
                    ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                    : "bg-gradient-to-r from-pace-400 to-purple-500"
                )}
              />
            </div>
            <div className="flex justify-between text-xs text-white/40">
              <span>
                {plan.tasks.filter((t) => t.isCompleted).length} of {plan.tasks.length} tasks
              </span>
              {completedPercent === 100 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-yellow-400 font-medium flex items-center gap-1"
                >
                  <Trophy className="w-3 h-3" />
                  Day Complete!
                </motion.span>
              )}
            </div>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-20">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -5, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
              }}
            >
              <Star className="w-3 h-3 text-white" />
            </motion.div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

