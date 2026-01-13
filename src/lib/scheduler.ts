/**
 * PACE Scheduling Engine
 * 
 * Rule-based scheduling system that assigns ALL times automatically.
 * User NEVER assigns times or durations - the system handles everything.
 * 
 * Work is ALWAYS protected. When intensity is HIGH, non-work activities shrink.
 * 
 * PRIORITY ORDER:
 * 1. Work (NEVER reduced)
 * 2. Essential personal tasks  
 * 3. Breaks
 * 4. Phone / social
 * 5. Leisure
 * 6. Sleep (protected minimum 6.5h)
 */

import { addMinutes, setHours, setMinutes, differenceInMinutes } from "date-fns";

// ============================================================================
// TYPES
// ============================================================================

export type Intensity = "low" | "medium" | "high";

export type BlockType = 
  | "work"
  | "essential"
  | "break"
  | "phone"
  | "social"
  | "leisure"
  | "sleep"
  | "meal"
  | "movement";

export interface Task {
  id: string;
  title: string;
  type: BlockType;
  estimatedMinutes: number; // System-assigned, not user-assigned
  isFlexible: boolean;
  // Work tasks can have optional time range (in hours)
  // User says "I need 2-4 hours for this"
  // System uses intensity to pick duration from range
  minHours?: number;
  maxHours?: number;
}

export interface TimeBlock {
  id: string;
  start: Date;
  end: Date;
  label: string;
  type: BlockType;
  taskId?: string;
  isReduced: boolean;
  originalMinutes?: number;
}

export interface ScheduleConfig {
  wakeTime: string;
  targetSleepTime: string;
  intensity: Intensity;
  date: Date;
}

export interface ScheduleResult {
  blocks: TimeBlock[];
  tradeoffs: string[];
  warnings: string[];
  stats: ScheduleStats;
}

export interface ScheduleStats {
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  totalPhoneMinutes: number;
  totalLeisureMinutes: number;
  sleepHours: number;
  sleepReduced: boolean;
}

// ============================================================================
// INTENSITY CONFIGURATION
// ============================================================================

interface IntensityConfig {
  breakDuration: number;
  breakFrequency: number;
  maxPhoneMinutes: number;
  maxLeisureMinutes: number;
  sleepReductionMinutes: number;
  minSleepHours: number;
}

const INTENSITY_CONFIG: Record<Intensity, IntensityConfig> = {
  low: {
    breakDuration: 20,
    breakFrequency: 90,
    maxPhoneMinutes: 60,
    maxLeisureMinutes: 120,
    sleepReductionMinutes: 0,
    minSleepHours: 8,
  },
  medium: {
    breakDuration: 15,
    breakFrequency: 90,
    maxPhoneMinutes: 30,
    maxLeisureMinutes: 60,
    sleepReductionMinutes: 0,
    minSleepHours: 7.5,
  },
  high: {
    breakDuration: 10,
    breakFrequency: 120,
    maxPhoneMinutes: 15,
    maxLeisureMinutes: 30,
    sleepReductionMinutes: 60,
    minSleepHours: 6.5,
  },
};

// Work block constraints
const DEFAULT_WORK_BLOCK = 90; // Default if no range specified
const MEAL_DURATION = 30;
const MORNING_ROUTINE = 30;

/**
 * Calculate work duration based on intensity and optional time range
 * 
 * If user sets a range (e.g., 2-4 hours):
 * - LOW intensity: use minHours (2h) - easier day
 * - MEDIUM intensity: use midpoint (3h)  
 * - HIGH intensity: use maxHours (4h) - push harder
 */
function calculateWorkDuration(
  task: Task,
  intensity: Intensity
): number {
  // If no range specified, use default
  if (task.minHours === undefined || task.maxHours === undefined) {
    return DEFAULT_WORK_BLOCK;
  }
  
  const minMinutes = task.minHours * 60;
  const maxMinutes = task.maxHours * 60;
  
  switch (intensity) {
    case "low":
      // Use minimum - easier day, less time on work
      return minMinutes;
    case "medium":
      // Use midpoint - balanced
      return Math.round((minMinutes + maxMinutes) / 2);
    case "high":
      // Use maximum - push harder, maximize work time
      return maxMinutes;
    default:
      return DEFAULT_WORK_BLOCK;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function parseTime(timeStr: string, date: Date): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return setMinutes(setHours(date, hours), minutes);
}

// ============================================================================
// MAIN SCHEDULER
// ============================================================================

export function generateSchedule(
  tasks: Task[],
  config: ScheduleConfig
): ScheduleResult {
  const { wakeTime, targetSleepTime, intensity, date } = config;
  const intensityConfig = INTENSITY_CONFIG[intensity];
  
  const blocks: TimeBlock[] = [];
  const tradeoffs: string[] = [];
  const warnings: string[] = [];
  
  // Parse times
  const wakeDate = parseTime(wakeTime, date);
  let targetSleep = parseTime(targetSleepTime, date);
  
  // Calculate available minutes
  let availableMinutes = differenceInMinutes(targetSleep, wakeDate);
  
  // Separate tasks by type
  const workTasks = tasks.filter(t => t.type === "work");
  const essentialTasks = tasks.filter(t => t.type === "essential" || t.type === "movement");
  const phoneTasks = tasks.filter(t => t.type === "phone" || t.type === "social");
  const leisureTasks = tasks.filter(t => t.type === "leisure");
  
  // Calculate work durations based on intensity and time ranges
  // Each work task gets duration based on:
  // - If range set: pick from range based on intensity
  // - If no range: default 90 min block
  const workDurations = workTasks.map(task => ({
    task,
    duration: calculateWorkDuration(task, intensity),
  }));
  
  const totalWorkMinutes = workDurations.reduce((sum, wd) => sum + wd.duration, 0);
  const workBlocksNeeded = workTasks.length;
  
  // Essential tasks get their system-assigned time
  const totalEssentialMinutes = essentialTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  
  // Calculate breaks needed
  const breaksNeeded = Math.max(0, workBlocksNeeded);
  let totalBreakMinutes = breaksNeeded * intensityConfig.breakDuration;
  
  // Fixed time blocks
  const fixedTime = MORNING_ROUTINE + MEAL_DURATION; // Morning + Lunch
  
  // Calculate minimum required
  const minimumRequired = totalWorkMinutes + totalEssentialMinutes + totalBreakMinutes + fixedTime;
  
  // Track reductions
  let phoneReduced = false;
  let leisureReduced = false;
  let breaksReduced = false;
  let sleepReduced = false;
  
  // Calculate flexible time
  let flexibleTime = availableMinutes - minimumRequired;
  
  // If time is tight, start reducing
  if (flexibleTime < 0) {
    // First, reduce breaks (up to 50%)
    const maxBreakReduction = totalBreakMinutes * 0.5;
    const breakReduction = Math.min(Math.abs(flexibleTime), maxBreakReduction);
    if (breakReduction > 0) {
      totalBreakMinutes -= breakReduction;
      flexibleTime += breakReduction;
      breaksReduced = true;
    }
    
    // If still tight and HIGH intensity, reduce sleep
    if (flexibleTime < 0 && intensity === "high") {
      const maxSleepReduction = intensityConfig.sleepReductionMinutes;
      const sleepReduction = Math.min(Math.abs(flexibleTime), maxSleepReduction);
      if (sleepReduction > 0) {
        targetSleep = addMinutes(targetSleep, sleepReduction);
        availableMinutes += sleepReduction;
        flexibleTime += sleepReduction;
        sleepReduced = true;
      }
    }
    
    if (flexibleTime < 0) {
      warnings.push(
        `You have ${Math.abs(Math.round(flexibleTime / 60 * 10) / 10)}h more work than time allows. ` +
        `Consider removing a task or starting earlier.`
      );
    }
  }
  
  // Allocate flexible time to phone and leisure
  let phoneMinutes = 0;
  let leisureMinutes = 0;
  
  if (flexibleTime > 0) {
    // Phone gets up to max based on intensity
    phoneMinutes = Math.min(intensityConfig.maxPhoneMinutes, flexibleTime * 0.3);
    flexibleTime -= phoneMinutes;
    
    // Leisure gets up to max based on intensity  
    leisureMinutes = Math.min(intensityConfig.maxLeisureMinutes, flexibleTime * 0.5);
  }
  
  // Check if we're reducing requested activities
  if (phoneTasks.length > 0 && phoneMinutes < 30) {
    phoneReduced = true;
  }
  if (leisureTasks.length > 0 && leisureMinutes < 30) {
    leisureReduced = true;
  }
  
  // Check if any work tasks have time ranges
  const rangedWorkTasks = workDurations.filter(wd => 
    wd.task.minHours !== undefined && wd.task.maxHours !== undefined
  );
  
  // Generate tradeoff messages
  if (intensity === "high") {
    tradeoffs.push("🔥 High intensity mode. Work blocks are fully protected.");
    if (rangedWorkTasks.length > 0) {
      tradeoffs.push("⏰ Work time ranges set to maximum for maximum productivity.");
    }
    if (breaksReduced) {
      tradeoffs.push("⏱️ Breaks shortened to maximize productive time.");
    }
    if (phoneReduced || phoneTasks.length > 0) {
      tradeoffs.push("📱 Phone/social time minimized.");
    }
    if (leisureReduced || leisureTasks.length > 0) {
      tradeoffs.push("🎮 Leisure time reduced to protect work.");
    }
    if (sleepReduced) {
      const sleepHours = differenceInMinutes(
        addMinutes(parseTime(wakeTime, date), 24 * 60),
        targetSleep
      ) / 60;
      tradeoffs.push(
        `😴 Sleep adjusted to ${sleepHours.toFixed(1)}h (minimum ${intensityConfig.minSleepHours}h protected).`
      );
    }
  } else if (intensity === "medium") {
    tradeoffs.push("⚡ Medium intensity. Balanced schedule with focused work time.");
    if (rangedWorkTasks.length > 0) {
      tradeoffs.push("⏰ Work time ranges set to midpoint for balance.");
    }
    if (phoneReduced) {
      tradeoffs.push("📱 Phone time slightly limited.");
    }
  } else {
    tradeoffs.push("🌿 Low intensity day. Full recovery and balance prioritized.");
    if (rangedWorkTasks.length > 0) {
      tradeoffs.push("⏰ Work time ranges set to minimum — more time for you.");
    }
  }
  
  // ========================================================================
  // BUILD THE SCHEDULE
  // ========================================================================
  
  let currentTime = wakeDate;
  const breakDuration = breaksReduced 
    ? Math.round(intensityConfig.breakDuration * 0.6)
    : intensityConfig.breakDuration;
  
  // Morning routine
  blocks.push({
    id: generateId(),
    start: currentTime,
    end: addMinutes(currentTime, MORNING_ROUTINE),
    label: "Morning Routine",
    type: "essential",
    isReduced: false,
  });
  currentTime = addMinutes(currentTime, MORNING_ROUTINE);
  
  // Schedule work blocks with breaks
  workDurations.forEach(({ task, duration }, index) => {
    // Check if it's lunch time (around noon-1pm)
    const currentHour = currentTime.getHours();
    if (currentHour >= 12 && currentHour < 14 && !blocks.some(b => b.label === "Lunch")) {
      blocks.push({
        id: generateId(),
        start: currentTime,
        end: addMinutes(currentTime, MEAL_DURATION),
        label: "Lunch",
        type: "meal",
        isReduced: false,
      });
      currentTime = addMinutes(currentTime, MEAL_DURATION);
    }
    
    // Work block with calculated duration
    const durationHours = duration / 60;
    const hasRange = task.minHours !== undefined && task.maxHours !== undefined;
    const blockLabel = hasRange 
      ? `${task.title} (${durationHours.toFixed(1)}h)`
      : task.title;
    
    blocks.push({
      id: generateId(),
      start: currentTime,
      end: addMinutes(currentTime, duration),
      label: blockLabel,
      type: "work",
      taskId: task.id,
      isReduced: false,
    });
    currentTime = addMinutes(currentTime, duration);
    
    // Break after work block (except last one)
    // Longer breaks for longer work blocks
    const adjustedBreak = duration > 120 ? breakDuration + 5 : breakDuration;
    
    if (index < workDurations.length - 1) {
      blocks.push({
        id: generateId(),
        start: currentTime,
        end: addMinutes(currentTime, adjustedBreak),
        label: "Break",
        type: "break",
        isReduced: breaksReduced,
        originalMinutes: breaksReduced ? intensityConfig.breakDuration : undefined,
      });
      currentTime = addMinutes(currentTime, adjustedBreak);
    }
  });
  
  // Add lunch if not added yet
  if (!blocks.some(b => b.label === "Lunch")) {
    blocks.push({
      id: generateId(),
      start: currentTime,
      end: addMinutes(currentTime, MEAL_DURATION),
      label: "Lunch",
      type: "meal",
      isReduced: false,
    });
    currentTime = addMinutes(currentTime, MEAL_DURATION);
  }
  
  // Schedule essential tasks
  essentialTasks.forEach((task) => {
    blocks.push({
      id: generateId(),
      start: currentTime,
      end: addMinutes(currentTime, task.estimatedMinutes),
      label: task.title,
      type: task.type,
      taskId: task.id,
      isReduced: false,
    });
    currentTime = addMinutes(currentTime, task.estimatedMinutes);
  });
  
  // Phone/social time (if allocated)
  if (phoneMinutes >= 10) {
    const originalRequest = phoneTasks.length > 0 ? 60 : undefined;
    blocks.push({
      id: generateId(),
      start: currentTime,
      end: addMinutes(currentTime, phoneMinutes),
      label: phoneTasks.length > 0 ? phoneTasks[0].title : "Phone / Social Time",
      type: "phone",
      isReduced: phoneReduced,
      originalMinutes: phoneReduced ? originalRequest : undefined,
    });
    currentTime = addMinutes(currentTime, phoneMinutes);
  }
  
  // Leisure time (if allocated)
  if (leisureMinutes >= 15) {
    const originalRequest = leisureTasks.length > 0 ? 60 : undefined;
    blocks.push({
      id: generateId(),
      start: currentTime,
      end: addMinutes(currentTime, leisureMinutes),
      label: leisureTasks.length > 0 ? leisureTasks[0].title : "Free Time",
      type: "leisure",
      isReduced: leisureReduced,
      originalMinutes: leisureReduced ? originalRequest : undefined,
    });
    currentTime = addMinutes(currentTime, leisureMinutes);
  }
  
  // Evening wind-down (remaining time before sleep)
  const timeUntilSleep = differenceInMinutes(targetSleep, currentTime);
  if (timeUntilSleep > 15) {
    blocks.push({
      id: generateId(),
      start: currentTime,
      end: addMinutes(currentTime, Math.min(30, timeUntilSleep)),
      label: "Evening Wind-down",
      type: "leisure",
      isReduced: false,
    });
    currentTime = addMinutes(currentTime, Math.min(30, timeUntilSleep));
  }
  
  // Sleep
  const nextDayWake = addMinutes(wakeDate, 24 * 60);
  const actualSleepMinutes = differenceInMinutes(nextDayWake, currentTime);
  const actualSleepHours = actualSleepMinutes / 60;
  
  blocks.push({
    id: generateId(),
    start: currentTime,
    end: nextDayWake,
    label: `Sleep (${actualSleepHours.toFixed(1)}h)`,
    type: "sleep",
    isReduced: sleepReduced,
  });
  
  // Calculate stats
  const stats: ScheduleStats = {
    totalWorkMinutes: blocks.filter(b => b.type === "work")
      .reduce((sum, b) => sum + differenceInMinutes(b.end, b.start), 0),
    totalBreakMinutes: blocks.filter(b => b.type === "break")
      .reduce((sum, b) => sum + differenceInMinutes(b.end, b.start), 0),
    totalPhoneMinutes: blocks.filter(b => b.type === "phone" || b.type === "social")
      .reduce((sum, b) => sum + differenceInMinutes(b.end, b.start), 0),
    totalLeisureMinutes: blocks.filter(b => b.type === "leisure")
      .reduce((sum, b) => sum + differenceInMinutes(b.end, b.start), 0),
    sleepHours: actualSleepHours,
    sleepReduced,
  };
  
  return {
    blocks,
    tradeoffs,
    warnings,
    stats,
  };
}
