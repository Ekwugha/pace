"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  Plus,
  Moon,
  Sun,
  Sparkles,
  Clock,
  Trash2,
  Settings,
  ChevronRight,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

/**
 * CommandPalette - Quick action command palette (⌘K)
 * Provides fast access to all app features
 */

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "navigation" | "planning" | "settings" | "quick";
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const settings = useStore((state) => state.settings);
  const {
    setCurrentView,
    setSelectedDate,
    setTheme,
    startPlanningSession,
    reset,
  } = useStore();

  // Define all available commands
  const commands: CommandItem[] = useMemo(
    () => [
      // Quick Actions
      {
        id: "new-plan-today",
        label: "Plan Today",
        description: "Start planning your day",
        icon: Sparkles,
        category: "quick",
        shortcut: "⌘N",
        action: () => {
          const today = format(new Date(), "yyyy-MM-dd");
          setSelectedDate(today);
          startPlanningSession(today);
          setCurrentView("planner");
          onOpenChange(false);
        },
      },
      {
        id: "new-plan-tomorrow",
        label: "Plan Tomorrow",
        description: "Prepare for tomorrow",
        icon: Clock,
        category: "quick",
        action: () => {
          const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
          setSelectedDate(tomorrow);
          startPlanningSession(tomorrow);
          setCurrentView("planner");
          onOpenChange(false);
        },
      },
      {
        id: "quick-task",
        label: "Add Quick Task",
        description: "Add a task to today's plan",
        icon: Plus,
        category: "quick",
        shortcut: "⌘T",
        action: () => {
          setCurrentView("planner");
          onOpenChange(false);
        },
      },
      // Navigation
      {
        id: "nav-planner",
        label: "Go to Planner",
        icon: Sparkles,
        category: "navigation",
        action: () => {
          setCurrentView("planner");
          onOpenChange(false);
        },
      },
      {
        id: "nav-timeline",
        label: "Go to Timeline",
        icon: Clock,
        category: "navigation",
        action: () => {
          setCurrentView("timeline");
          onOpenChange(false);
        },
      },
      {
        id: "nav-calendar",
        label: "Go to Calendar",
        icon: Calendar,
        category: "navigation",
        action: () => {
          setCurrentView("calendar");
          onOpenChange(false);
        },
      },
      // Settings
      {
        id: "toggle-theme",
        label: settings.theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        icon: settings.theme === "dark" ? Sun : Moon,
        category: "settings",
        shortcut: "⌘D",
        action: () => {
          setTheme(settings.theme === "dark" ? "light" : "dark");
          onOpenChange(false);
        },
      },
      {
        id: "open-settings",
        label: "Open Settings",
        icon: Settings,
        category: "settings",
        shortcut: "⌘,",
        action: () => {
          // TODO: Open settings modal
          onOpenChange(false);
        },
      },
      {
        id: "reset-app",
        label: "Reset All Data",
        description: "Clear all plans and start fresh",
        icon: Trash2,
        category: "settings",
        action: () => {
          if (confirm("Are you sure you want to reset all data?")) {
            reset();
            onOpenChange(false);
          }
        },
      },
    ],
    [settings.theme, setCurrentView, setSelectedDate, startPlanningSession, setTheme, reset, onOpenChange]
  );

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    const lower = search.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lower) ||
        cmd.description?.toLowerCase().includes(lower) ||
        cmd.category.toLowerCase().includes(lower)
    );
  }, [commands, search]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % filteredCommands.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) =>
            i === 0 ? filteredCommands.length - 1 : i - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case "Escape":
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    },
    [filteredCommands, selectedIndex, onOpenChange]
  );

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Reset search when closing
  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [open, onOpenChange]);

  const categoryLabels: Record<string, string> = {
    quick: "Quick Actions",
    navigation: "Navigation",
    planning: "Planning",
    settings: "Settings",
  };

  let currentIndex = 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b border-white/10">
          <Search className="w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-14 bg-transparent text-white placeholder:text-white/40 focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded bg-white/10 px-2 text-xs text-white/50">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {Object.entries(groupedCommands).map(([category, items]) => (
            <div key={category} className="mb-4 last:mb-0">
              <div className="px-2 py-1 text-xs font-medium text-white/40 uppercase tracking-wider">
                {categoryLabels[category] || category}
              </div>
              <div className="mt-1 space-y-1">
                {items.map((cmd) => {
                  const index = currentIndex++;
                  const isSelected = index === selectedIndex;

                  return (
                    <motion.button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                        isSelected
                          ? "bg-white/10 text-white"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      )}
                      initial={false}
                      animate={{ backgroundColor: isSelected ? "rgba(255,255,255,0.1)" : "transparent" }}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          isSelected ? "bg-pace-500/20" : "bg-white/5"
                        )}
                      >
                        <cmd.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-white/40 truncate">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded bg-white/10 px-2 text-xs text-white/50">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="py-8 text-center text-white/40">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

