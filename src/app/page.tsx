"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Sparkles, ArrowRight, Plus, Clock, Calendar } from "lucide-react";

// Layout Components
import { AmbientBackground } from "@/components/layout/ambient-background";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/layout/command-palette";

// Feature Components
import { PlanningFlow, PlanningData } from "@/components/planner/planning-flow";
import { TaskInput } from "@/components/planner/task-input";
import { TaskList } from "@/components/planner/task-list";
import { TimelineView } from "@/components/timeline/timeline-view";
import { CalendarView } from "@/components/calendar/calendar-view";
import { EncouragementCard } from "@/components/encouragement/encouragement-card";

// UI Components
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Store
import { useStore, useNavigation, useCurrentPlan } from "@/store/useStore";
import { Task, CalendarView as CalendarViewType } from "@/types";

/**
 * Main application page
 * Orchestrates all views and manages the overall app flow
 */

export default function Home() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isPlanningMode, setIsPlanningMode] = useState(false);

  // Store hooks
  const navigation = useNavigation();
  const currentPlan = useCurrentPlan();
  const {
    dayPlans,
    createDayPlan,
    addTask,
    toggleTaskComplete,
    deleteTask,
    reorderTasks,
    generateTimeBlocks,
    addBreak,
    setSelectedDate,
    setCalendarView,
    setCurrentView,
  } = useStore();

  // Handle planning completion
  const handlePlanningComplete = useCallback(
    (data: PlanningData) => {
      createDayPlan(
        data.targetDate,
        data.timeWindow,
        data.energy,
        data.mood
      );
      setSelectedDate(data.targetDate);
      setIsPlanningMode(false);
    },
    [createDayPlan, setSelectedDate]
  );

  // Start planning flow
  const handleStartPlanning = useCallback(
    (date?: string) => {
      if (date) setSelectedDate(date);
      setIsPlanningMode(true);
    },
    [setSelectedDate]
  );

  // Handle adding a task
  const handleAddTask = useCallback(
    (taskData: Omit<Task, "id" | "isCompleted">) => {
      if (!currentPlan) {
        // Create a plan if none exists
        const today = format(new Date(), "yyyy-MM-dd");
        createDayPlan(today, 12, "medium", "neutral");
      }
      if (currentPlan) {
        addTask(currentPlan.id, taskData);
      }
    },
    [currentPlan, addTask, createDayPlan]
  );

  // Handle task completion toggle
  const handleToggleComplete = useCallback(
    (taskId: string) => {
      if (currentPlan) {
        toggleTaskComplete(currentPlan.id, taskId);
      }
    },
    [currentPlan, toggleTaskComplete]
  );

  // Handle task deletion
  const handleDeleteTask = useCallback(
    (taskId: string) => {
      if (currentPlan) {
        deleteTask(currentPlan.id, taskId);
      }
    },
    [currentPlan, deleteTask]
  );

  // Handle task reordering
  const handleReorderTasks = useCallback(
    (taskIds: string[]) => {
      if (currentPlan) {
        reorderTasks(currentPlan.id, taskIds);
      }
    },
    [currentPlan, reorderTasks]
  );

  // Handle generating timeline
  const handleGenerateTimeline = useCallback(() => {
    if (currentPlan) {
      generateTimeBlocks(currentPlan.id);
      setCurrentView("timeline");
    }
  }, [currentPlan, generateTimeBlocks, setCurrentView]);

  // Handle adding a break
  const handleAddBreak = useCallback(
    (afterBlockId: string) => {
      if (currentPlan) {
        addBreak(currentPlan.id, afterBlockId, "stretch");
      }
    },
    [currentPlan, addBreak]
  );

  // Handle calendar view change
  const handleCalendarViewChange = useCallback(
    (view: CalendarViewType) => {
      setCalendarView(view);
    },
    [setCalendarView]
  );

  // Render main content based on current view
  const renderContent = () => {
    // Show planning flow if in planning mode
    if (isPlanningMode) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="py-8"
        >
          <PlanningFlow
            onComplete={handlePlanningComplete}
            onCancel={() => setIsPlanningMode(false)}
          />
        </motion.div>
      );
    }

    switch (navigation.currentView) {
      case "planner":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Encouragement Card */}
            <EncouragementCard plan={currentPlan || null} />

            {/* Quick Start if no plan */}
            {!currentPlan && (
              <GlassCard variant="elevated" className="p-8 text-center" glow>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pace-400/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-pace-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    Let&apos;s orchestrate your day
                  </h2>
                  <p className="text-white/60 mb-8 max-w-md mx-auto">
                    Answer a few questions about your energy, mood, and goals. We&apos;ll
                    create a balanced, realistic plan that actually works for you.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button
                      variant="glow"
                      size="lg"
                      onClick={() => handleStartPlanning()}
                      animated
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Planning
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() =>
                        handleStartPlanning(
                          format(
                            new Date(Date.now() + 86400000),
                            "yyyy-MM-dd"
                          )
                        )
                      }
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Plan Tomorrow
                    </Button>
                  </div>
                </motion.div>
              </GlassCard>
            )}

            {/* Task Management */}
            {currentPlan && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tasks Column */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                      Today&apos;s Tasks
                    </h2>
                    <Badge variant="info">
                      {currentPlan.timeWindow}h window
                    </Badge>
                  </div>

                  <TaskInput onAddTask={handleAddTask} />

                  <TaskList
                    tasks={currentPlan.tasks}
                    onToggleComplete={handleToggleComplete}
                    onDeleteTask={handleDeleteTask}
                    onReorderTasks={handleReorderTasks}
                  />

                  {currentPlan.tasks.length > 0 && !currentPlan.isGenerated && (
                    <Button
                      variant="glow"
                      className="w-full"
                      onClick={handleGenerateTimeline}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Generate Timeline
                    </Button>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Day Stats */}
                  <GlassCard variant="subtle" className="p-4">
                    <h3 className="font-medium text-white mb-3">Today&apos;s Balance</h3>
                    <div className="space-y-3">
                      {(["work", "rest", "social", "movement"] as const).map(
                        (category) => {
                          const categoryTasks = currentPlan.tasks.filter(
                            (t) => t.category === category
                          );
                          const totalMinutes = categoryTasks.reduce(
                            (sum, t) => sum + t.estimatedMinutes,
                            0
                          );
                          const percentage =
                            (totalMinutes /
                              Math.max(
                                currentPlan.tasks.reduce(
                                  (sum, t) => sum + t.estimatedMinutes,
                                  0
                                ),
                                1
                              )) *
                            100;

                          return (
                            <div key={category} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60 capitalize">
                                  {category}
                                </span>
                                <span className="text-white">
                                  {Math.round(percentage)}%
                                </span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  className={`h-full ${
                                    category === "work"
                                      ? "bg-work"
                                      : category === "rest"
                                      ? "bg-rest"
                                      : category === "social"
                                      ? "bg-social"
                                      : "bg-movement"
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </GlassCard>

                  {/* Quick Actions */}
                  <GlassCard variant="subtle" className="p-4">
                    <h3 className="font-medium text-white mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button
                        variant="secondary"
                        className="w-full justify-start"
                        onClick={() => setCurrentView("timeline")}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        View Timeline
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full justify-start"
                        onClick={() => setCurrentView("calendar")}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Calendar View
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full justify-start"
                        onClick={() => handleStartPlanning()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Plan
                      </Button>
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}
          </motion.div>
        );

      case "timeline":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4"
          >
            <TimelineView
              plan={currentPlan || null}
              onToggleComplete={handleToggleComplete}
              onAddBreak={handleAddBreak}
            />
          </motion.div>
        );

      case "calendar":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-4"
          >
            <CalendarView
              plans={dayPlans}
              selectedDate={navigation.selectedDate}
              view={navigation.calendarView}
              onSelectDate={setSelectedDate}
              onViewChange={handleCalendarViewChange}
              onStartPlanning={handleStartPlanning}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Ambient Background */}
      <AmbientBackground />

      {/* Main App */}
      <div className="min-h-screen">
        {/* Header */}
        <Header onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 max-w-6xl">
          <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
        </main>

        {/* Command Palette */}
        <CommandPalette
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
        />
      </div>
    </>
  );
}
