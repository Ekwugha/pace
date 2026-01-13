"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Clock,
  Brain,
  Coffee,
  Users,
  Dumbbell,
  Moon,
  AlertTriangle,
  Info,
  ArrowLeft,
  RefreshCw,
  Utensils,
  Sparkles,
  X,
} from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore, useCurrentPlan } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { BlockType } from "@/types";
import { getEncouragementMessage, EncouragementMessage } from "@/lib/encouragement";

/**
 * ScheduleView - Displays the generated schedule with encouragement on completion
 */

const blockConfig: Record<
  BlockType,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  work: {
    icon: Brain,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/20",
    borderColor: "border-indigo-500/30",
  },
  essential: {
    icon: Clock,
    color: "text-sky-400",
    bgColor: "bg-sky-500/20",
    borderColor: "border-sky-500/30",
  },
  break: {
    icon: Coffee,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/30",
  },
  phone: {
    icon: Users,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/30",
  },
  social: {
    icon: Users,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/30",
  },
  leisure: {
    icon: Sparkles,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/30",
  },
  sleep: {
    icon: Moon,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/30",
  },
  meal: {
    icon: Utensils,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/30",
  },
  movement: {
    icon: Dumbbell,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/30",
  },
};

export function ScheduleView() {
  const [mounted, setMounted] = useState(false);
  const currentPlan = useCurrentPlan();
  const { setCurrentView, markBlockComplete, regenerateSchedule } = useStore();
  const selectedDate = useStore((state) => state.navigation.selectedDate);
  
  // Encouragement toast state
  const [encouragement, setEncouragement] = useState<EncouragementMessage | null>(null);
  const [showEncouragement, setShowEncouragement] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // All hooks must be called before any conditional returns
  const stats = useMemo(() => {
    if (!currentPlan) return null;
    
    const completedBlocks = currentPlan.blocks.filter((b) => b.isCompleted && b.type !== "sleep");
    const totalBlocks = currentPlan.blocks.filter((b) => b.type !== "sleep");
    
    return {
      totalWork: currentPlan.blocks
        .filter((b) => b.type === "work")
        .reduce((sum, b) => sum + differenceInMinutes(new Date(b.end), new Date(b.start)), 0),
      totalBreaks: currentPlan.blocks
        .filter((b) => b.type === "break")
        .reduce((sum, b) => sum + differenceInMinutes(new Date(b.end), new Date(b.start)), 0),
      completedCount: completedBlocks.length,
      totalCount: totalBlocks.length,
      progress: totalBlocks.length > 0 ? (completedBlocks.length / totalBlocks.length) * 100 : 0,
    };
  }, [currentPlan]);

  // Handle block completion with encouragement
  const handleBlockComplete = useCallback((blockId: string, blockType: BlockType) => {
    if (!currentPlan || !stats) return;
    
    const block = currentPlan.blocks.find(b => b.id === blockId);
    const wasCompleted = block?.isCompleted;
    
    // Mark as complete
    markBlockComplete(selectedDate, blockId);
    
    // Only show encouragement when completing (not uncompleting)
    if (!wasCompleted) {
      const newCompletedCount = stats.completedCount + 1;
      const message = getEncouragementMessage(
        blockType,
        newCompletedCount,
        stats.totalCount,
        currentPlan.intensity
      );
      
      setEncouragement(message);
      setShowEncouragement(true);
      
      // Auto-hide after 4 seconds
      setTimeout(() => {
        setShowEncouragement(false);
      }, 4000);
    }
  }, [currentPlan, stats, selectedDate, markBlockComplete]);

  // Show loading skeleton during hydration - AFTER all hooks
  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-2" />
            <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-16 bg-white/5 rounded-2xl animate-pulse" />
        <div className="h-96 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!currentPlan || !currentPlan.isGenerated) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <GlassCard variant="elevated" className="p-8">
          <Clock className="w-12 h-12 mx-auto mb-4 text-white/30" />
          <h2 className="text-xl font-bold text-white mb-2">No Schedule Yet</h2>
          <p className="text-white/60 mb-6">
            Add tasks and generate a schedule to see your day plan.
          </p>
          <Button variant="glow" onClick={() => setCurrentView("input")}>
            Start Planning
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Encouragement Toast */}
      <AnimatePresence>
        {showEncouragement && encouragement && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <GlassCard variant="elevated" className="px-6 py-4 shadow-glow-lg">
              <div className="flex items-center gap-4">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.4 }}
                  className="text-4xl"
                >
                  {encouragement.emoji}
                </motion.span>
                <div className="flex-1">
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg font-medium text-white"
                  >
                    {encouragement.text}
                  </motion.p>
                </div>
                <button
                  onClick={() => setShowEncouragement(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {format(new Date(selectedDate), "EEEE")}&apos;s Schedule
          </h1>
          <p className="text-white/60">
            {format(new Date(selectedDate), "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setCurrentView("input")}>
            <ArrowLeft className="w-4 h-4" />
            Edit Tasks
          </Button>
          <Button
            variant="secondary"
            onClick={() => regenerateSchedule(selectedDate)}
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {stats && (
        <GlassCard variant="subtle" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">Day Progress</span>
            <span className="text-sm font-medium text-white">
              {stats.completedCount}/{stats.totalCount} tasks ({Math.round(stats.progress)}%)
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                stats.progress === 100
                  ? "bg-gradient-to-r from-emerald-400 to-green-500"
                  : "bg-gradient-to-r from-sky-400 to-purple-500"
              )}
            />
          </div>
          {stats.progress === 100 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-emerald-400 font-medium mt-2"
            >
              🎉 All tasks complete! Amazing work today!
            </motion.p>
          )}
        </GlassCard>
      )}

      {/* Tradeoff Messages */}
      {currentPlan.tradeoffs.length > 0 && (
        <GlassCard
          variant="subtle"
          className={cn(
            "p-4",
            currentPlan.intensity === "high"
              ? "border-red-500/30"
              : currentPlan.intensity === "medium"
              ? "border-amber-500/30"
              : "border-emerald-500/30"
          )}
        >
          <div className="flex items-start gap-3">
            <Info
              className={cn(
                "w-5 h-5 mt-0.5 flex-shrink-0",
                currentPlan.intensity === "high"
                  ? "text-red-400"
                  : currentPlan.intensity === "medium"
                  ? "text-amber-400"
                  : "text-emerald-400"
              )}
            />
            <div className="space-y-1">
              {currentPlan.tradeoffs.map((msg, i) => (
                <p key={i} className="text-sm text-white/80">
                  {msg}
                </p>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Warnings */}
      {currentPlan.warnings.length > 0 && (
        <GlassCard
          variant="subtle"
          className="p-4 border-red-500/30 bg-red-500/5"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              {currentPlan.warnings.map((msg, i) => (
                <p key={i} className="text-sm text-red-200">
                  {msg}
                </p>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Timeline */}
      <GlassCard variant="elevated" className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Timeline</h2>
        
        <div className="space-y-2">
          <AnimatePresence>
            {currentPlan.blocks.map((block, index) => {
              const config = blockConfig[block.type] || blockConfig.essential;
              const Icon = config.icon;
              const duration = differenceInMinutes(
                new Date(block.end),
                new Date(block.start)
              );
              const isSleep = block.type === "sleep";

              return (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => !isSleep && handleBlockComplete(block.id, block.type)}
                  className={cn(
                    "relative flex items-center gap-4 p-4 rounded-xl border transition-all",
                    config.bgColor,
                    config.borderColor,
                    block.isCompleted && "opacity-60",
                    !isSleep && "cursor-pointer hover:brightness-110 active:scale-[0.99]",
                    isSleep && "cursor-default"
                  )}
                >
                  {/* Time Column */}
                  <div className="w-24 flex-shrink-0 text-right">
                    <div className="text-sm font-medium text-white">
                      {format(new Date(block.start), "h:mm a")}
                    </div>
                    <div className="text-xs text-white/50">
                      {duration >= 60
                        ? `${Math.floor(duration / 60)}h ${duration % 60 || ""}${duration % 60 ? "m" : ""}`
                        : `${duration}m`}
                    </div>
                  </div>

                  {/* Completion Indicator */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                      block.isCompleted
                        ? "bg-emerald-500/30"
                        : config.bgColor
                    )}
                  >
                    {block.isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Check className="w-5 h-5 text-emerald-400" />
                      </motion.div>
                    ) : (
                      <Icon className={cn("w-5 h-5", config.color)} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        "font-medium text-white",
                        block.isCompleted && "line-through text-white/60"
                      )}
                    >
                      {block.label}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          block.type === "work"
                            ? "work"
                            : block.type === "break"
                            ? "warning"
                            : block.type === "leisure"
                            ? "rest"
                            : block.type === "movement"
                            ? "movement"
                            : "default"
                        }
                        size="sm"
                      >
                        {block.type}
                      </Badge>
                      {block.isReduced && (
                        <Badge variant="warning" size="sm">
                          Reduced
                        </Badge>
                      )}
                      {block.type === "work" && !block.isCompleted && (
                        <Badge variant="info" size="sm">
                          Protected
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* End Time */}
                  <div className="text-sm text-white/50">
                    → {format(new Date(block.end), "h:mm a")}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Tap hint */}
        <p className="text-center text-xs text-white/40 mt-4">
          Tap a block to mark it complete
        </p>
      </GlassCard>
    </div>
  );
}
