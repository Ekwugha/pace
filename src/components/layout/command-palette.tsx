"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  Moon,
  Sun,
  Sparkles,
  Clock,
  Trash2,
  ChevronRight,
  ListTodo,
  Zap,
  Flame,
  Leaf,
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
  category: "navigation" | "intensity" | "settings";
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const settings = useStore((state) => state.settings);
  const selectedDate = useStore((state) => state.navigation.selectedDate);
  const {
    setCurrentView,
    setSelectedDate,
    updateSettings,
    setIntensity,
    getOrCreatePlan,
    reset,
  } = useStore();

  // Define all available commands
  const commands: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: "nav-tasks",
        label: "Go to Tasks",
        description: "Add and manage tasks",
        icon: ListTodo,
        category: "navigation",
        action: () => {
          setCurrentView("input");
          onOpenChange(false);
        },
      },
      {
        id: "nav-schedule",
        label: "Go to Schedule",
        description: "View generated timeline",
        icon: Clock,
        category: "navigation",
        action: () => {
          setCurrentView("schedule");
          onOpenChange(false);
        },
      },
      {
        id: "nav-calendar",
        label: "Go to Calendar",
        description: "View all days",
        icon: Calendar,
        category: "navigation",
        action: () => {
          setCurrentView("calendar");
          onOpenChange(false);
        },
      },
      {
        id: "plan-today",
        label: "Plan Today",
        description: "Start planning for today",
        icon: Sparkles,
        category: "navigation",
        shortcut: "⌘N",
        action: () => {
          const today = format(new Date(), "yyyy-MM-dd");
          setSelectedDate(today);
          getOrCreatePlan(today);
          setCurrentView("input");
          onOpenChange(false);
        },
      },
      {
        id: "plan-tomorrow",
        label: "Plan Tomorrow",
        description: "Prepare for tomorrow",
        icon: Calendar,
        category: "navigation",
        action: () => {
          const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
          setSelectedDate(tomorrow);
          getOrCreatePlan(tomorrow);
          setCurrentView("input");
          onOpenChange(false);
        },
      },
      // Intensity
      {
        id: "intensity-low",
        label: "Set Low Intensity",
        description: "Full recovery, balanced day",
        icon: Leaf,
        category: "intensity",
        action: () => {
          setIntensity(selectedDate, "low");
          onOpenChange(false);
        },
      },
      {
        id: "intensity-medium",
        label: "Set Medium Intensity",
        description: "Focused but balanced",
        icon: Zap,
        category: "intensity",
        action: () => {
          setIntensity(selectedDate, "medium");
          onOpenChange(false);
        },
      },
      {
        id: "intensity-high",
        label: "Set High Intensity",
        description: "Maximum productivity, reduced breaks",
        icon: Flame,
        category: "intensity",
        action: () => {
          setIntensity(selectedDate, "high");
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
          updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
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
    [settings.theme, selectedDate, setCurrentView, setSelectedDate, setIntensity, getOrCreatePlan, updateSettings, reset, onOpenChange]
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
    navigation: "Navigation",
    intensity: "Intensity",
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
                          isSelected ? "bg-sky-500/20" : "bg-white/5"
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
