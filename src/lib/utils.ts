import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with proper precedence
 * Uses clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format time in 12-hour format with AM/PM
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Get time of day category based on hour
 */
export function getTimeOfDay(hour: number): "morning" | "day" | "evening" | "night" {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "day";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate optimal task order based on energy levels
 * High energy tasks go in the morning, creative in afternoon, routine in evening
 */
export function getOptimalTimeSlot(
  taskType: "work" | "rest" | "social" | "movement",
  energy: "high" | "medium" | "low"
): { preferredHour: number; flexibilityHours: number } {
  const slots = {
    work: {
      high: { preferredHour: 9, flexibilityHours: 2 },
      medium: { preferredHour: 14, flexibilityHours: 3 },
      low: { preferredHour: 16, flexibilityHours: 2 },
    },
    rest: {
      high: { preferredHour: 13, flexibilityHours: 4 },
      medium: { preferredHour: 15, flexibilityHours: 3 },
      low: { preferredHour: 12, flexibilityHours: 2 },
    },
    social: {
      high: { preferredHour: 19, flexibilityHours: 3 },
      medium: { preferredHour: 18, flexibilityHours: 2 },
      low: { preferredHour: 20, flexibilityHours: 1 },
    },
    movement: {
      high: { preferredHour: 7, flexibilityHours: 2 },
      medium: { preferredHour: 12, flexibilityHours: 3 },
      low: { preferredHour: 17, flexibilityHours: 2 },
    },
  };

  return slots[taskType][energy];
}

/**
 * Get encouraging message based on completion percentage
 */
export function getEncouragingMessage(completedPercent: number): string {
  const messages = {
    0: [
      "Let's get started! Your day awaits ✨",
      "Ready to make today count?",
      "Every journey begins with a single step",
    ],
    25: [
      "Great momentum! Keep it going 🚀",
      "You're building unstoppable energy!",
      "The hardest part is starting - you've got this!",
    ],
    50: [
      "Halfway there! You're crushing it 💪",
      "Look at you go! Amazing progress",
      "Your future self is thanking you right now",
    ],
    75: [
      "Almost there! The finish line is in sight 🎯",
      "You're in the home stretch now!",
      "Incredible dedication - keep pushing!",
    ],
    100: [
      "You did it! What a day! 🎉",
      "Absolute champion! Take a bow 👏",
      "Mission accomplished. You're unstoppable!",
    ],
  };

  let bracket: keyof typeof messages;
  if (completedPercent === 0) bracket = 0;
  else if (completedPercent < 50) bracket = 25;
  else if (completedPercent < 75) bracket = 50;
  else if (completedPercent < 100) bracket = 75;
  else bracket = 100;

  const bracketMessages = messages[bracket];
  return bracketMessages[Math.floor(Math.random() * bracketMessages.length)];
}

/**
 * Get task-specific completion messages
 */
export function getTaskCompletionMessage(taskType: "work" | "rest" | "social" | "movement"): string {
  const messages = {
    work: [
      "Focused work complete! Your brain thanks you 🧠",
      "Another task conquered! You're on fire 🔥",
      "Productive excellence! Keep the momentum",
    ],
    rest: [
      "Well rested! You've recharged your batteries 🔋",
      "Self-care is not selfish - great choice!",
      "Rest complete - ready for what's next!",
    ],
    social: [
      "Connection matters! Great social time 💫",
      "Relationships nurtured - beautiful!",
      "Quality time well spent!",
    ],
    movement: [
      "Body moving, endorphins flowing! 🏃",
      "Movement is medicine - well done!",
      "Physical activity complete - feeling good!",
    ],
  };

  const taskMessages = messages[taskType];
  return taskMessages[Math.floor(Math.random() * taskMessages.length)];
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

