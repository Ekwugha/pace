/**
 * Core type definitions for the Pace Day Orchestrator
 */

// Task category types for different activities
export type TaskCategory = "work" | "rest" | "social" | "movement";

// Energy levels that affect task scheduling
export type EnergyLevel = "high" | "medium" | "low";

// Mood states that influence the planning flow
export type MoodState = "energized" | "calm" | "tired" | "stressed" | "neutral";

// Time window options for day planning
export type TimeWindow = 3 | 6 | 12 | 24;

// Individual task representation
export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  estimatedMinutes: number;
  priority: "high" | "medium" | "low";
  isCompleted: boolean;
  completedAt?: Date;
  notes?: string;
}

// Time block in the schedule
export interface TimeBlock {
  id: string;
  taskId: string;
  startTime: Date;
  endTime: Date;
  isBreak: boolean;
  breakType?: "walk" | "phone" | "nap" | "stretch" | "snack";
}

// User preferences for day planning
export interface UserPreferences {
  wakeTime: string; // HH:mm format
  sleepTime: string; // HH:mm format
  preferredWorkHours: number[];
  breakFrequencyMinutes: number;
  breakDurationMinutes: number;
  balancePreference: {
    work: number; // 0-100 percentage
    rest: number;
    social: number;
    movement: number;
  };
}

// Day plan representing a complete planned day
export interface DayPlan {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  tasks: Task[];
  timeBlocks: TimeBlock[];
  timeWindow: TimeWindow;
  energyLevel: EnergyLevel;
  mood: MoodState;
  isGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Planning flow question types
export interface PlanningQuestion {
  id: string;
  type: "choice" | "slider" | "multiSelect" | "timeInput" | "text";
  question: string;
  subtext?: string;
  options?: PlanningOption[];
  min?: number;
  max?: number;
  defaultValue?: string | number | string[];
}

export interface PlanningOption {
  id: string;
  label: string;
  value: string;
  icon?: string;
  description?: string;
}

// User response to a planning question
export interface PlanningResponse {
  questionId: string;
  value: string | number | string[];
}

// Planning session state
export interface PlanningSession {
  id: string;
  targetDate: string;
  currentStep: number;
  responses: PlanningResponse[];
  isComplete: boolean;
  startedAt: Date;
}

// Calendar view types
export type CalendarView = "day" | "week";

// Navigation state
export interface NavigationState {
  currentView: "planner" | "timeline" | "calendar";
  selectedDate: string;
  calendarView: CalendarView;
}

// Command palette action
export interface CommandAction {
  id: string;
  label: string;
  shortcut?: string;
  icon?: string;
  category: "navigation" | "planning" | "settings" | "quick-add";
  action: () => void;
}

// Theme mode
export type ThemeMode = "light" | "dark" | "system";

// App settings
export interface AppSettings {
  theme: ThemeMode;
  notifications: boolean;
  soundEffects: boolean;
  animationsEnabled: boolean;
}

// Statistics for tracking
export interface DayStats {
  tasksCompleted: number;
  totalTasks: number;
  minutesWorked: number;
  minutesRested: number;
  minutesSocial: number;
  minutesMovement: number;
  completionRate: number;
}

// Break suggestion based on current state
export interface BreakSuggestion {
  type: "walk" | "phone" | "nap" | "stretch" | "snack" | "water";
  duration: number;
  reason: string;
  priority: "suggested" | "recommended" | "needed";
}

