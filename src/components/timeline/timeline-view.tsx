"use client";

import { useMemo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Brain,
  Coffee,
  Users,
  Dumbbell,
  Play,
  Pause,
  Plus,
} from "lucide-react";
import { format, addHours, startOfDay, differenceInMinutes } from "date-fns";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatTime, formatDuration } from "@/lib/utils";
import { DayPlan, TimeBlock, Task, TaskCategory } from "@/types";

/**
 * TimelineView - Visual timeline of the day's schedule
 * Shows time blocks, breaks, and allows adjustments
 */

interface TimelineViewProps {
  plan: DayPlan | null;
  onToggleComplete: (taskId: string) => void;
  onAddBreak: (afterBlockId: string) => void;
}

const categoryIcons: Record<TaskCategory | "break", React.ComponentType<{ className?: string }>> = {
  work: Brain,
  rest: Coffee,
  social: Users,
  movement: Dumbbell,
  break: Coffee,
};

const categoryColors: Record<TaskCategory | "break", { bg: string; border: string; text: string }> = {
  work: { bg: "bg-work/20", border: "border-work/40", text: "text-work-light" },
  rest: { bg: "bg-rest/20", border: "border-rest/40", text: "text-rest-light" },
  social: { bg: "bg-social/20", border: "border-social/40", text: "text-social-light" },
  movement: { bg: "bg-movement/20", border: "border-movement/40", text: "text-movement-light" },
  break: { bg: "bg-amber-500/20", border: "border-amber-500/40", text: "text-amber-400" },
};

// Helper to get time-appropriate icon (available for future use)
// function getTimeIcon(hour: number) {
//   if (hour >= 5 && hour < 12) return Sunrise;
//   if (hour >= 12 && hour < 18) return Clock;
//   if (hour >= 18 && hour < 21) return Sunset;
//   return MoonIcon;
// }

export function TimelineView({ plan, onToggleComplete, onAddBreak }: TimelineViewProps) {
  const [currentHour] = useState(new Date().getHours());
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  // Generate hour markers for the timeline
  const hourMarkers = useMemo(() => {
    const markers = [];
    for (let h = 6; h <= 23; h++) {
      markers.push({
        hour: h,
        label: format(addHours(startOfDay(new Date()), h), "ha"),
        isNow: h === currentHour,
      });
    }
    return markers;
  }, [currentHour]);

  // Map tasks by ID for quick lookup
  const tasksById = useMemo(() => {
    if (!plan) return new Map<string, Task>();
    return new Map(plan.tasks.map((t) => [t.id, t]));
  }, [plan]);

  // Calculate position and height for each block
  const getBlockStyle = useCallback((block: TimeBlock) => {
    const dayStart = addHours(startOfDay(new Date(block.startTime)), 6);
    const topOffset = differenceInMinutes(new Date(block.startTime), dayStart);
    const height = differenceInMinutes(new Date(block.endTime), new Date(block.startTime));

    return {
      top: `${(topOffset / 60) * 80}px`,
      height: `${Math.max(height * 1.33, 60)}px`,
    };
  }, []);

  if (!plan || plan.timeBlocks.length === 0) {
    return (
      <GlassCard variant="elevated" className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
          <Clock className="w-8 h-8 text-white/30" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Timeline Yet</h3>
        <p className="text-white/60 mb-6">
          Complete the planning flow and add tasks to generate your timeline
        </p>
        <Button variant="glow">
          Start Planning
        </Button>
      </GlassCard>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Day</h2>
          <p className="text-white/60">{format(new Date(plan.date), "EEEE, MMMM d")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">
            {plan.tasks.filter((t) => t.isCompleted).length}/{plan.tasks.length} completed
          </Badge>
        </div>
      </div>

      {/* Timeline */}
      <GlassCard variant="subtle" className="p-6 overflow-hidden">
        <div className="relative min-h-[800px]">
          {/* Hour Grid */}
          <div className="absolute left-0 top-0 w-16 h-full">
            {hourMarkers.map((marker, i) => {
              return (
                <div
                  key={marker.hour}
                  className="absolute left-0 w-16 flex items-start gap-2"
                  style={{ top: `${i * 80}px` }}
                >
                  <div
                    className={cn(
                      "text-xs font-medium",
                      marker.isNow ? "text-pace-400" : "text-white/40"
                    )}
                  >
                    {marker.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hour Lines */}
          <div className="absolute left-16 right-0 top-0 h-full">
            {hourMarkers.map((marker, i) => (
              <div
                key={marker.hour}
                className={cn(
                  "absolute left-0 right-0 border-t",
                  marker.isNow
                    ? "border-pace-400/50"
                    : "border-white/5"
                )}
                style={{ top: `${i * 80}px` }}
              >
                {marker.isNow && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -left-2 -top-1.5 w-3 h-3 rounded-full bg-pace-400 shadow-glow-sm"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Time Blocks */}
          <div className="absolute left-20 right-4 top-0">
            <AnimatePresence>
              {plan.timeBlocks.map((block) => {
                const task = block.isBreak ? null : tasksById.get(block.taskId);
                const category = block.isBreak ? "break" : (task?.category || "work");
                const Icon = categoryIcons[category];
                const colors = categoryColors[category];
                const style = getBlockStyle(block);
                const isExpanded = expandedBlock === block.id;
                const duration = differenceInMinutes(
                  new Date(block.endTime),
                  new Date(block.startTime)
                );

                return (
                  <motion.div
                    key={block.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                    className={cn(
                      "absolute left-0 right-0 rounded-xl border cursor-pointer transition-all",
                      colors.bg,
                      colors.border,
                      isExpanded && "ring-2 ring-white/20",
                      task?.isCompleted && "opacity-50"
                    )}
                    style={style}
                  >
                    <div className="p-3 h-full flex flex-col">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors.bg)}>
                            <Icon className={cn("w-4 h-4", colors.text)} />
                          </div>
                          <div>
                            <div className={cn("font-medium text-white", task?.isCompleted && "line-through")}>
                              {block.isBreak
                                ? `${block.breakType || "Break"} Time`
                                : task?.title || "Task"}
                            </div>
                            <div className="text-xs text-white/50">
                              {formatTime(new Date(block.startTime))} - {formatTime(new Date(block.endTime))}
                            </div>
                          </div>
                        </div>
                        <Badge variant={category === "break" ? "warning" : category} size="sm">
                          {formatDuration(duration)}
                        </Badge>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-white/10"
                          >
                            <div className="flex items-center gap-2">
                              {!block.isBreak && task && (
                                <Button
                                  variant={task.isCompleted ? "secondary" : "success"}
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleComplete(task.id);
                                  }}
                                >
                                  {task.isCompleted ? (
                                    <>
                                      <Pause className="w-3 h-3" />
                                      Mark Incomplete
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3 h-3" />
                                      Complete
                                    </>
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddBreak(block.id);
                                }}
                              >
                                <Plus className="w-3 h-3" />
                                Add Break After
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

