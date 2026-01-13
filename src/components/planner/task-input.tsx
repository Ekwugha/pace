"use client";

import { useState, useCallback, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Brain,
  Coffee,
  Users,
  Dumbbell,
  Sparkles,
  X,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TaskCategory, Task } from "@/types";

/**
 * TaskInput - Component for adding new tasks
 * Includes category selection and duration estimation
 */

interface TaskInputProps {
  onAddTask: (task: Omit<Task, "id" | "isCompleted">) => void;
}

const categories: { id: TaskCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "work", label: "Work", icon: Brain },
  { id: "rest", label: "Rest", icon: Coffee },
  { id: "social", label: "Social", icon: Users },
  { id: "movement", label: "Movement", icon: Dumbbell },
];

const durations = [15, 30, 45, 60, 90, 120];

export function TaskInput({ onAddTask }: TaskInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("work");
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");

  const handleSubmit = useCallback(() => {
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      category,
      estimatedMinutes: duration,
      priority,
    });

    // Reset form
    setTitle("");
    setDuration(30);
    setPriority("medium");
    setIsExpanded(false);
  }, [title, category, duration, priority, onAddTask]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setIsExpanded(false);
      setTitle("");
    }
  };

  const selectedCategory = categories.find((c) => c.id === category)!;

  return (
    <GlassCard variant="subtle" className="p-4">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center gap-3 py-2 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-colors">
              <Plus className="w-5 h-5 text-white/60 group-hover:text-white" />
            </div>
            <span className="text-white/60 group-hover:text-white/80 transition-colors">
              Add a task...
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Title Input */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border",
                  category === "work" && "bg-work/20 border-work/30",
                  category === "rest" && "bg-rest/20 border-rest/30",
                  category === "social" && "bg-social/20 border-social/30",
                  category === "movement" && "bg-movement/20 border-movement/30"
                )}
              >
                <selectedCategory.icon
                  className={cn(
                    "w-5 h-5",
                    category === "work" && "text-work-light",
                    category === "rest" && "text-rest-light",
                    category === "social" && "text-social-light",
                    category === "movement" && "text-movement-light"
                  )}
                />
              </div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What do you want to do?"
                variant="glass"
                autoFocus
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setIsExpanded(false);
                  setTitle("");
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-xs text-white/50 uppercase tracking-wider">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                      category === cat.id
                        ? cat.id === "work"
                          ? "bg-work/20 border-work/40 text-work-light"
                          : cat.id === "rest"
                          ? "bg-rest/20 border-rest/40 text-rest-light"
                          : cat.id === "social"
                          ? "bg-social/20 border-social/40 text-social-light"
                          : "bg-movement/20 border-movement/40 text-movement-light"
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                    )}
                  >
                    <cat.icon className="w-4 h-4" />
                    <span className="text-sm">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            <div className="space-y-2">
              <label className="text-xs text-white/50 uppercase tracking-wider">Duration</label>
              <div className="flex flex-wrap gap-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={cn(
                      "px-3 py-2 rounded-lg border text-sm transition-all",
                      duration === d
                        ? "bg-pace-500/20 border-pace-400/40 text-pace-400"
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                    )}
                  >
                    {d >= 60 ? `${d / 60}h` : `${d}m`}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Selection */}
            <div className="space-y-2">
              <label className="text-xs text-white/50 uppercase tracking-wider">Priority</label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "px-3 py-2 rounded-lg border text-sm transition-all capitalize",
                      priority === p
                        ? p === "high"
                          ? "bg-red-500/20 border-red-400/40 text-red-400"
                          : p === "medium"
                          ? "bg-amber-500/20 border-amber-400/40 text-amber-400"
                          : "bg-emerald-500/20 border-emerald-400/40 text-emerald-400"
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setIsExpanded(false)}>
                Cancel
              </Button>
              <Button variant="glow" onClick={handleSubmit} disabled={!title.trim()}>
                <Sparkles className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

