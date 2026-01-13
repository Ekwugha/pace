"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Check,
  GripVertical,
  Trash2,
  Clock,
  Brain,
  Coffee,
  Users,
  Dumbbell,
  Star,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDuration, getTaskCompletionMessage } from "@/lib/utils";
import { Task, TaskCategory } from "@/types";

/**
 * TaskList - Displays and manages task items
 * Supports reordering, completion, and deletion
 */

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onReorderTasks: (taskIds: string[]) => void;
}

const categoryIcons: Record<TaskCategory, React.ComponentType<{ className?: string }>> = {
  work: Brain,
  rest: Coffee,
  social: Users,
  movement: Dumbbell,
};

const categoryColors: Record<TaskCategory, string> = {
  work: "work",
  rest: "rest",
  social: "social",
  movement: "movement",
};

export function TaskList({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onReorderTasks,
}: TaskListProps) {
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [reorderItems, setReorderItems] = useState(tasks);

  // Sync reorder items when tasks change externally
  useState(() => {
    setReorderItems(tasks);
  });

  const handleToggleComplete = useCallback(
    (task: Task) => {
      if (!task.isCompleted) {
        const message = getTaskCompletionMessage(task.category);
        setCompletionMessage(message);
        setTimeout(() => setCompletionMessage(null), 3000);
      }
      onToggleComplete(task.id);
    },
    [onToggleComplete]
  );

  const handleReorder = useCallback(
    (newOrder: Task[]) => {
      setReorderItems(newOrder);
      onReorderTasks(newOrder.map((t) => t.id));
    },
    [onReorderTasks]
  );

  if (tasks.length === 0) {
    return (
      <GlassCard variant="subtle" className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
          <Star className="w-8 h-8 text-white/30" />
        </div>
        <h3 className="text-lg font-medium text-white/80 mb-2">No tasks yet</h3>
        <p className="text-white/50">Add your first task to get started</p>
      </GlassCard>
    );
  }

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <Badge variant="info">
            {completedCount}/{tasks.length} done
          </Badge>
          <Badge variant="default" className="gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(totalMinutes)}
          </Badge>
        </div>
        <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pace-400 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / tasks.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Completion Message Toast */}
      <AnimatePresence>
        {completionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <GlassCard variant="elevated" className="px-6 py-3 shadow-glow-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-white font-medium">{completionMessage}</span>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List */}
      <Reorder.Group
        axis="y"
        values={reorderItems}
        onReorder={handleReorder}
        className="space-y-2"
      >
        <AnimatePresence mode="popLayout">
          {reorderItems.map((task) => {
            const Icon = categoryIcons[task.category];
            const colorClass = categoryColors[task.category];

            return (
              <Reorder.Item
                key={task.id}
                value={task}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                whileDrag={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
              >
                <GlassCard
                  variant={task.isCompleted ? "subtle" : "default"}
                  className={cn(
                    "p-4 transition-all",
                    task.isCompleted && "opacity-60"
                  )}
                  hover={!task.isCompleted}
                >
                  <div className="flex items-center gap-4">
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing text-white/30 hover:text-white/50 touch-none">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        task.isCompleted
                          ? `bg-${colorClass} border-${colorClass}`
                          : `border-${colorClass}/50 hover:border-${colorClass}`,
                        task.category === "work" &&
                          (task.isCompleted
                            ? "bg-work border-work"
                            : "border-work/50 hover:border-work"),
                        task.category === "rest" &&
                          (task.isCompleted
                            ? "bg-rest border-rest"
                            : "border-rest/50 hover:border-rest"),
                        task.category === "social" &&
                          (task.isCompleted
                            ? "bg-social border-social"
                            : "border-social/50 hover:border-social"),
                        task.category === "movement" &&
                          (task.isCompleted
                            ? "bg-movement border-movement"
                            : "border-movement/50 hover:border-movement")
                      )}
                    >
                      {task.isCompleted && <Check className="w-4 h-4 text-white" />}
                    </button>

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "font-medium text-white transition-all",
                          task.isCompleted && "line-through text-white/50"
                        )}
                      >
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={task.category} size="sm">
                          <Icon className="w-3 h-3 mr-1" />
                          {task.category}
                        </Badge>
                        <span className="text-xs text-white/40">
                          {formatDuration(task.estimatedMinutes)}
                        </span>
                        {task.priority === "high" && (
                          <Badge variant="error" size="sm">
                            High Priority
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDeleteTask(task.id)}
                        className="text-white/40 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}

