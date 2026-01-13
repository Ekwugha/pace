"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DayPlan, CalendarView as CalendarViewType } from "@/types";

/**
 * CalendarView - Monthly/Weekly calendar for viewing and selecting days
 * Shows plan status and allows date selection
 */

interface CalendarViewProps {
  plans: Record<string, DayPlan>;
  selectedDate: string;
  view: CalendarViewType;
  onSelectDate: (date: string) => void;
  onViewChange: (view: CalendarViewType) => void;
  onStartPlanning: (date: string) => void;
}

export function CalendarView({
  plans,
  selectedDate,
  view,
  onSelectDate,
  onViewChange,
  onStartPlanning,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const selected = parseISO(selectedDate);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);

    const days = [];
    let day = calStart;

    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentMonth]);

  // Navigate months
  const prevMonth = useCallback(() => setCurrentMonth((m) => subMonths(m, 1)), []);
  const nextMonth = useCallback(() => setCurrentMonth((m) => addMonths(m, 1)), []);
  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
    onSelectDate(format(new Date(), "yyyy-MM-dd"));
  }, [onSelectDate]);

  // Get plan status for a date
  const getPlanStatus = useCallback(
    (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const plan = plans[dateStr];
      if (!plan) return null;

      const completedTasks = plan.tasks.filter((t) => t.isCompleted).length;
      const totalTasks = plan.tasks.length;
      const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return { completedTasks, totalTasks, percentage, plan };
    },
    [plans]
  );

  const selectedPlan = plans[selectedDate];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <GlassCard variant="elevated" className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon-sm" onClick={prevMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-bold text-white">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <Button variant="ghost" size="icon-sm" onClick={nextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={goToToday}>
                Today
              </Button>
              <div className="flex rounded-lg bg-white/5 p-1">
                <button
                  onClick={() => onViewChange("day")}
                  className={cn(
                    "px-3 py-1 rounded text-sm transition-colors",
                    view === "day"
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  Day
                </button>
                <button
                  onClick={() => onViewChange("week")}
                  className={cn(
                    "px-3 py-1 rounded text-sm transition-colors",
                    view === "week"
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  Week
                </button>
              </div>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-white/40 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const status = getPlanStatus(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selected);
              const today = isToday(day);

              return (
                <motion.button
                  key={i}
                  onClick={() => onSelectDate(dateStr)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "relative aspect-square p-2 rounded-xl transition-all",
                    isCurrentMonth ? "text-white" : "text-white/30",
                    isSelected
                      ? "bg-pace-500/30 ring-2 ring-pace-400"
                      : "hover:bg-white/10",
                    today && !isSelected && "ring-1 ring-white/30"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      today && "text-pace-400"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Plan Indicator */}
                  {status && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {status.percentage === 100 ? (
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      ) : status.totalTasks > 0 ? (
                        <div className="w-2 h-2 rounded-full bg-pace-400" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-white/60">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pace-400" />
              <span className="text-xs text-white/60">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/30" />
              <span className="text-xs text-white/60">Planned</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Selected Day Detail */}
      <div>
        <GlassCard variant="elevated" className="p-6 sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/60 text-sm">{format(selected, "EEEE")}</p>
              <h3 className="text-2xl font-bold text-white">
                {format(selected, "MMMM d")}
              </h3>
            </div>
            {isToday(selected) && (
              <Badge variant="info">Today</Badge>
            )}
          </div>

          {selectedPlan ? (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold text-white">
                    {selectedPlan.tasks.filter((t) => t.isCompleted).length}
                  </div>
                  <div className="text-xs text-white/60">Completed</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold text-white">
                    {selectedPlan.tasks.length}
                  </div>
                  <div className="text-xs text-white/60">Total Tasks</div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Progress</span>
                  <span className="text-white font-medium">
                    {Math.round(
                      (selectedPlan.tasks.filter((t) => t.isCompleted).length /
                        Math.max(selectedPlan.tasks.length, 1)) *
                        100
                    )}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-pace-400 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (selectedPlan.tasks.filter((t) => t.isCompleted).length /
                          Math.max(selectedPlan.tasks.length, 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Task Preview */}
              <div className="space-y-2">
                <p className="text-sm text-white/60">Tasks</p>
                {selectedPlan.tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg bg-white/5",
                      task.isCompleted && "opacity-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        task.isCompleted
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-white/30"
                      )}
                    >
                      {task.isCompleted && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span
                      className={cn(
                        "text-sm text-white truncate",
                        task.isCompleted && "line-through text-white/50"
                      )}
                    >
                      {task.title}
                    </span>
                  </div>
                ))}
                {selectedPlan.tasks.length > 5 && (
                  <p className="text-xs text-white/40 text-center">
                    +{selectedPlan.tasks.length - 5} more tasks
                  </p>
                )}
              </div>

              <Button variant="secondary" className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                View Timeline
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-white/30" />
              </div>
              <p className="text-white/60 mb-4">No plan for this day yet</p>
              <Button
                variant="glow"
                onClick={() => onStartPlanning(format(selected, "yyyy-MM-dd"))}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Plan This Day
              </Button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

