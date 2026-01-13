/**
 * Core type definitions for the Pace Day Orchestrator
 * 
 * PACE uses intensity-based scheduling where work is ALWAYS protected.
 * Non-work activities shrink based on intensity level.
 */

// Intensity levels that control schedule compression
export type Intensity = "low" | "medium" | "high";

// Block types in priority order (higher = more protected)
export type BlockType = 
  | "work"       // Priority 1 - NEVER reduced
  | "essential"  // Priority 2 - Meals, hygiene, must-dos
  | "break"      // Priority 3 - Can be shortened
  | "phone"      // Priority 4 - Can be heavily reduced  
  | "social"     // Priority 4 - Can be heavily reduced
  | "leisure"    // Priority 5 - First to go
  | "sleep"      // Priority 6 - Protected minimum 6.5h
  | "meal"       // Subset of essential
  | "movement";  // Exercise, walks

// User-input task (before scheduling)
export interface Task {
  id: string;
  title: string;
  type: BlockType;
  estimatedMinutes: number;
  isFlexible: boolean; // Can be reduced when time is tight
  addedAt: Date;
  isCompleted?: boolean; // For tracking completion in calendar view
}

// Scheduled time block (after scheduling)
export interface TimeBlock {
  id: string;
  start: Date;
  end: Date;
  label: string;
  type: BlockType;
  taskId?: string;
  isReduced: boolean; // Was shortened due to intensity
  originalMinutes?: number; // Pre-reduction duration
  isCompleted?: boolean;
}

// Day plan containing all scheduled blocks
export interface DayPlan {
  id: string;
  date: string; // YYYY-MM-DD
  intensity: Intensity;
  wakeTime: string; // HH:mm
  sleepTime: string; // HH:mm
  tasks: Task[];
  blocks: TimeBlock[];
  tradeoffs: string[]; // Explanations of schedule adjustments
  warnings: string[];
  isGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schedule statistics
export interface ScheduleStats {
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  totalPhoneMinutes: number;
  totalLeisureMinutes: number;
  sleepHours: number;
  sleepReduced: boolean;
}

// User preferences
export interface UserPreferences {
  defaultWakeTime: string;
  defaultSleepTime: string;
  defaultIntensity: Intensity;
}

// Navigation state
export interface NavigationState {
  currentView: "input" | "schedule" | "calendar";
  selectedDate: string;
}

// Calendar view type
export type CalendarView = "day" | "week";

// App settings
export interface AppSettings {
  theme: "light" | "dark" | "system";
  soundEffects: boolean;
  animationsEnabled: boolean;
}

// Command palette action
export interface CommandAction {
  id: string;
  label: string;
  shortcut?: string;
  icon?: string;
  action: () => void;
}
