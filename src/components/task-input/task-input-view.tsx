"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Brain,
  Coffee,
  Users,
  Dumbbell,
  Clock,
  Sparkles,
  Trash2,
  Zap,
  Flame,
  Leaf,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore, useCurrentPlan } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { BlockType, Intensity } from "@/types";

/**
 * TaskInputView - One-by-one task input interface
 * 
 * Users add tasks WITHOUT assigning times or durations.
 * The system handles ALL scheduling automatically.
 */

// Default durations assigned by the SYSTEM (user never sees these)
const SYSTEM_DURATIONS: Record<BlockType, number> = {
  work: 90,      // 90 min work blocks
  essential: 30, // 30 min for essentials
  movement: 45,  // 45 min for exercise
  phone: 30,     // 30 min phone time (will be reduced by intensity)
  social: 60,    // 60 min social (will be reduced)
  leisure: 60,   // 60 min leisure (will be reduced)
  break: 15,     // System managed
  sleep: 480,    // System managed
  meal: 30,      // System managed
};

const taskTypes: {
  id: BlockType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  example: string;
}[] = [
  { 
    id: "work", 
    label: "Work", 
    icon: Brain, 
    color: "indigo", 
    description: "Deep focus tasks",
    example: "e.g., Write report, Code feature, Design mockup"
  },
  { 
    id: "essential", 
    label: "Essential", 
    icon: Clock, 
    color: "sky", 
    description: "Must-do personal tasks",
    example: "e.g., Doctor appointment, Pick up kids"
  },
  { 
    id: "movement", 
    label: "Movement", 
    icon: Dumbbell, 
    color: "emerald", 
    description: "Physical activity",
    example: "e.g., Gym, Run, Yoga, Walk"
  },
  { 
    id: "phone", 
    label: "Phone/Social", 
    icon: Users, 
    color: "orange", 
    description: "Calls & social media",
    example: "e.g., Call mom, Check Instagram"
  },
  { 
    id: "leisure", 
    label: "Leisure", 
    icon: Coffee, 
    color: "purple", 
    description: "Free time & hobbies",
    example: "e.g., Read, Watch TV, Gaming"
  },
];

const intensityOptions: {
  id: Intensity;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  detail: string;
  color: string;
}[] = [
  { 
    id: "low", 
    label: "Low", 
    icon: Leaf, 
    description: "Recovery day", 
    detail: "Full breaks, full phone time, full leisure",
    color: "emerald" 
  },
  { 
    id: "medium", 
    label: "Medium", 
    icon: Zap, 
    description: "Balanced", 
    detail: "Normal breaks, limited phone time",
    color: "amber" 
  },
  { 
    id: "high", 
    label: "High", 
    icon: Flame, 
    description: "Max productivity", 
    detail: "Short breaks, minimal phone/leisure, sleep -1h",
    color: "red" 
  },
];

export function TaskInputView() {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType] = useState<BlockType>("work");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentPlan = useCurrentPlan();
  const selectedDate = useStore((state) => state.navigation.selectedDate);
  const {
    addTask,
    removeTask,
    setIntensity,
    setWakeTime,
    setSleepTime,
    generateSchedule,
    getOrCreatePlan,
  } = useStore();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure plan exists
  const plan = currentPlan || getOrCreatePlan(selectedDate);

  // System assigns duration based on task type - hooks must be before conditional returns
  const handleAddTask = useCallback(() => {
    if (!taskTitle.trim()) return;
    
    // SYSTEM assigns duration - user never chooses
    const systemDuration = SYSTEM_DURATIONS[taskType];
    
    addTask(selectedDate, taskTitle.trim(), taskType, systemDuration);
    setTaskTitle("");
    setTaskType("work");
    setIsAddingTask(false);
  }, [taskTitle, taskType, selectedDate, addTask]);

  const handleGenerateSchedule = useCallback(() => {
    generateSchedule(selectedDate);
  }, [selectedDate, generateSchedule]);

  // Show loading skeleton during hydration - AFTER all hooks
  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="h-9 w-32 bg-white/10 rounded mx-auto mb-2 animate-pulse" />
          <div className="h-5 w-48 bg-white/5 rounded mx-auto animate-pulse" />
        </div>
        <div className="h-48 bg-white/5 rounded-2xl animate-pulse" />
        <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Count tasks by type
  const workCount = plan.tasks.filter(t => t.type === "work").length;
  const otherCount = plan.tasks.filter(t => t.type !== "work").length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          {format(new Date(selectedDate), "EEEE")}
        </h1>
        <p className="text-white/60">
          {format(new Date(selectedDate), "MMMM d, yyyy")}
        </p>
      </motion.div>

      {/* Intensity Selector */}
      <GlassCard variant="elevated" className="p-6">
        <h2 className="text-lg font-semibold text-white mb-2">
          How intense is today?
        </h2>
        <p className="text-sm text-white/50 mb-4">
          This controls how aggressively we protect your work time
        </p>
        <div className="grid grid-cols-3 gap-3">
          {intensityOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setIntensity(selectedDate, option.id)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left",
                plan.intensity === option.id
                  ? option.color === "emerald"
                    ? "bg-emerald-500/20 border-emerald-500/50"
                    : option.color === "amber"
                    ? "bg-amber-500/20 border-amber-500/50"
                    : "bg-red-500/20 border-red-500/50"
                  : "bg-white/[0.05] border-white/[0.1] hover:bg-white/[0.1]"
              )}
            >
              <option.icon
                className={cn(
                  "w-6 h-6 mb-2",
                  plan.intensity === option.id
                    ? option.color === "emerald"
                      ? "text-emerald-400"
                      : option.color === "amber"
                      ? "text-amber-400"
                      : "text-red-400"
                    : "text-white/60"
                )}
              />
              <div className="font-medium text-white">{option.label}</div>
              <div className="text-xs text-white/50 mt-1">{option.detail}</div>
            </button>
          ))}
        </div>
        
        {plan.intensity === "high" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-200">
                <strong>High intensity:</strong> Breaks shortened, phone/leisure minimized, 
                sleep may reduce by 1h (min 6.5h). Work is ALWAYS protected.
              </p>
            </div>
          </motion.div>
        )}
      </GlassCard>

      {/* Time Settings */}
      <GlassCard variant="subtle" className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-white/60 block mb-2">Wake Time</label>
            <input
              type="time"
              value={plan.wakeTime}
              onChange={(e) => setWakeTime(selectedDate, e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-sky-400"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 block mb-2">Target Bedtime</label>
            <input
              type="time"
              value={plan.sleepTime}
              onChange={(e) => setSleepTime(selectedDate, e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>
      </GlassCard>

      {/* Task List */}
      <GlassCard variant="elevated" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">What do you need to do?</h2>
          <div className="flex items-center gap-2">
            {workCount > 0 && (
              <Badge variant="work">{workCount} work</Badge>
            )}
            {otherCount > 0 && (
              <Badge variant="default">{otherCount} other</Badge>
            )}
          </div>
        </div>

        {/* Existing Tasks */}
        <div className="space-y-2 mb-4">
          <AnimatePresence mode="popLayout">
            {plan.tasks.map((task) => {
              const typeInfo = taskTypes.find((t) => t.id === task.type);
              const Icon = typeInfo?.icon || Brain;
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.05] border border-white/[0.1]"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      task.type === "work" && "bg-indigo-500/20",
                      task.type === "essential" && "bg-sky-500/20",
                      task.type === "movement" && "bg-emerald-500/20",
                      task.type === "phone" && "bg-orange-500/20",
                      task.type === "social" && "bg-orange-500/20",
                      task.type === "leisure" && "bg-purple-500/20"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        task.type === "work" && "text-indigo-400",
                        task.type === "essential" && "text-sky-400",
                        task.type === "movement" && "text-emerald-400",
                        task.type === "phone" && "text-orange-400",
                        task.type === "social" && "text-orange-400",
                        task.type === "leisure" && "text-purple-400"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">
                      {task.title}
                    </div>
                    <div className="text-xs text-white/50">
                      {typeInfo?.label}
                      {task.type !== "work" && (
                        <span className="text-amber-400/70"> · May be adjusted</span>
                      )}
                      {task.type === "work" && (
                        <span className="text-indigo-400/70"> · Protected</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeTask(selectedDate, task.id)}
                    className="text-white/40 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {plan.tasks.length === 0 && !isAddingTask && (
            <div className="text-center py-8 text-white/40">
              <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No tasks yet</p>
              <p className="text-sm mt-1">Add what you need to accomplish today</p>
            </div>
          )}
        </div>

        {/* Add Task Form */}
        <AnimatePresence mode="wait">
          {isAddingTask ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4 border-t border-white/[0.1]"
            >
              {/* Task Title */}
              <div>
                <label className="text-sm text-white/60 block mb-2">What do you need to do?</label>
                <Input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Describe your task..."
                  variant="glass"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && taskTitle.trim()) handleAddTask();
                    if (e.key === "Escape") setIsAddingTask(false);
                  }}
                />
              </div>

              {/* Task Type */}
              <div className="space-y-2">
                <label className="text-sm text-white/60">What type of task is this?</label>
                <div className="grid grid-cols-1 gap-2">
                  {taskTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setTaskType(type.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                        taskType === type.id
                          ? type.color === "indigo"
                            ? "bg-indigo-500/20 border-indigo-500/50"
                            : type.color === "sky"
                            ? "bg-sky-500/20 border-sky-500/50"
                            : type.color === "emerald"
                            ? "bg-emerald-500/20 border-emerald-500/50"
                            : type.color === "orange"
                            ? "bg-orange-500/20 border-orange-500/50"
                            : "bg-purple-500/20 border-purple-500/50"
                          : "bg-white/[0.03] border-white/[0.1] hover:bg-white/[0.08]"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        taskType === type.id
                          ? type.color === "indigo"
                            ? "bg-indigo-500/30"
                            : type.color === "sky"
                            ? "bg-sky-500/30"
                            : type.color === "emerald"
                            ? "bg-emerald-500/30"
                            : type.color === "orange"
                            ? "bg-orange-500/30"
                            : "bg-purple-500/30"
                          : "bg-white/[0.1]"
                      )}>
                        <type.icon className={cn(
                          "w-5 h-5",
                          taskType === type.id
                            ? type.color === "indigo"
                              ? "text-indigo-300"
                              : type.color === "sky"
                              ? "text-sky-300"
                              : type.color === "emerald"
                              ? "text-emerald-300"
                              : type.color === "orange"
                              ? "text-orange-300"
                              : "text-purple-300"
                            : "text-white/50"
                        )} />
                      </div>
                      <div className="flex-1">
                        <div className={cn(
                          "font-medium",
                          taskType === type.id ? "text-white" : "text-white/70"
                        )}>
                          {type.label}
                          {type.id === "work" && (
                            <span className="ml-2 text-xs text-indigo-400">Always protected</span>
                          )}
                        </div>
                        <div className="text-xs text-white/40">{type.example}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setIsAddingTask(false)}>
                  Cancel
                </Button>
                <Button
                  variant="glow"
                  onClick={handleAddTask}
                  disabled={!taskTitle.trim()}
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setIsAddingTask(true)}
              >
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Generate Schedule Button */}
      {plan.tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="glow"
            size="lg"
            className="w-full"
            onClick={handleGenerateSchedule}
          >
            <Sparkles className="w-5 h-5" />
            Build My Schedule
            <ChevronRight className="w-5 h-5" />
          </Button>
          <p className="text-center text-xs text-white/40 mt-3">
            We&apos;ll assign all times and durations automatically
          </p>
        </motion.div>
      )}
    </div>
  );
}
