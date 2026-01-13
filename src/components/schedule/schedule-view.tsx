"use client";

import { useMemo } from "react";
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
} from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore, useCurrentPlan } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { BlockType } from "@/types";

/**
 * ScheduleView - Displays the generated schedule with tradeoff explanations
 * 
 * Shows time blocks in a timeline format with clear indicators for
 * blocks that were reduced due to intensity settings.
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
  const currentPlan = useCurrentPlan();
  const { setCurrentView, markBlockComplete, regenerateSchedule } = useStore();
  const selectedDate = useStore((state) => state.navigation.selectedDate);

  const stats = useMemo(() => {
    if (!currentPlan) return null;
    
    const workBlocks = currentPlan.blocks.filter((b) => b.type === "work");
    const breakBlocks = currentPlan.blocks.filter((b) => b.type === "break");
    const reducedBlocks = currentPlan.blocks.filter((b) => b.isReduced);
    
    return {
      totalWork: workBlocks.reduce(
        (sum, b) => sum + differenceInMinutes(new Date(b.end), new Date(b.start)),
        0
      ),
      totalBreaks: breakBlocks.reduce(
        (sum, b) => sum + differenceInMinutes(new Date(b.end), new Date(b.start)),
        0
      ),
      reducedCount: reducedBlocks.length,
      completedCount: currentPlan.blocks.filter((b) => b.isCompleted).length,
    };
  }, [currentPlan]);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {format(new Date(selectedDate), "EEEE's")} Schedule
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

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          <GlassCard variant="subtle" className="p-3 text-center">
            <div className="text-2xl font-bold text-white">
              {Math.floor(stats.totalWork / 60)}h {stats.totalWork % 60}m
            </div>
            <div className="text-xs text-white/50">Work Time</div>
          </GlassCard>
          <GlassCard variant="subtle" className="p-3 text-center">
            <div className="text-2xl font-bold text-white">
              {stats.totalBreaks}m
            </div>
            <div className="text-xs text-white/50">Break Time</div>
          </GlassCard>
          <GlassCard variant="subtle" className="p-3 text-center">
            <div className="text-2xl font-bold text-white">
              {currentPlan.blocks.length}
            </div>
            <div className="text-xs text-white/50">Blocks</div>
          </GlassCard>
          <GlassCard variant="subtle" className="p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {stats.completedCount}/{currentPlan.blocks.length}
            </div>
            <div className="text-xs text-white/50">Completed</div>
          </GlassCard>
        </div>
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

              return (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => markBlockComplete(selectedDate, block.id)}
                  className={cn(
                    "relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                    config.bgColor,
                    config.borderColor,
                    block.isCompleted && "opacity-50",
                    "hover:brightness-110"
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

                  {/* Icon */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      config.bgColor
                    )}
                  >
                    {block.isCompleted ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Icon className={cn("w-5 h-5", config.color)} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        "font-medium text-white",
                        block.isCompleted && "line-through"
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
                            : "default"
                        }
                        size="sm"
                      >
                        {block.type}
                      </Badge>
                      {block.isReduced && (
                        <Badge variant="warning" size="sm">
                          Reduced
                          {block.originalMinutes &&
                            ` (was ${block.originalMinutes}m)`}
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
      </GlassCard>
    </div>
  );
}

