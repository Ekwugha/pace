"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Layout Components
import { AmbientBackground } from "@/components/layout/ambient-background";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/layout/command-palette";

// Views
import { TaskInputView } from "@/components/task-input/task-input-view";
import { ScheduleView } from "@/components/schedule/schedule-view";
import { CalendarView } from "@/components/calendar/calendar-view";

// Store
import { useStore, useNavigation } from "@/store/useStore";

/**
 * PACE - AI Day Orchestrator
 * 
 * An intelligent scheduling system that protects work time while
 * dynamically adjusting breaks, phone time, and leisure based on intensity.
 * 
 * PRIORITY ORDER:
 * 1. Work (ALWAYS protected)
 * 2. Essential personal tasks
 * 3. Breaks
 * 4. Phone / social
 * 5. Leisure
 * 6. Sleep (minimum 6.5h)
 */

export default function Home() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const navigation = useNavigation();
  const { dayPlans, setSelectedDate, setCurrentView } = useStore();

  // Render content based on current view
  const renderContent = () => {
    switch (navigation.currentView) {
      case "input":
        return (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TaskInputView />
          </motion.div>
        );

      case "schedule":
        return (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ScheduleView />
          </motion.div>
        );

      case "calendar":
        return (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CalendarView
              plans={dayPlans}
              selectedDate={navigation.selectedDate}
              view="day"
              onSelectDate={setSelectedDate}
              onViewChange={() => {}}
              onStartPlanning={(date) => {
                setSelectedDate(date);
                setCurrentView("input");
              }}
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
