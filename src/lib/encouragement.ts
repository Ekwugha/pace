/**
 * PACE Encouragement System
 * 
 * Provides contextual, motivational messages when users complete tasks.
 * Messages are tailored to:
 * - Task type (work, movement, leisure, etc.)
 * - Time of day
 * - Progress through the day
 * - Intensity level
 */

import { BlockType, Intensity } from "@/types";

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export interface EncouragementMessage {
  text: string;
  emoji: string;
  type: "celebration" | "motivation" | "acknowledgment" | "humor";
}

// ============================================================================
// WORK COMPLETION MESSAGES
// ============================================================================

const workMessages: EncouragementMessage[] = [
  { text: "Deep work done! Your brain is a powerhouse.", emoji: "🧠", type: "celebration" },
  { text: "Focus block crushed. That's how champions work.", emoji: "💪", type: "motivation" },
  { text: "Another task conquered. You're unstoppable today.", emoji: "🔥", type: "celebration" },
  { text: "Excellent focus session. The results will show.", emoji: "✨", type: "acknowledgment" },
  { text: "Work complete! Your future self just sent a thank you.", emoji: "🙏", type: "humor" },
  { text: "Boom! One less thing standing between you and success.", emoji: "💥", type: "celebration" },
  { text: "Productive energy is flowing. Keep riding the wave!", emoji: "🌊", type: "motivation" },
  { text: "That task never stood a chance against you.", emoji: "⚡", type: "humor" },
  { text: "Focus mode: activated and dominated.", emoji: "🎯", type: "celebration" },
  { text: "You just made progress most people only dream about.", emoji: "🚀", type: "motivation" },
];

// ============================================================================
// BREAK COMPLETION MESSAGES
// ============================================================================

const breakMessages: EncouragementMessage[] = [
  { text: "Recharged and ready. Let's go again!", emoji: "🔋", type: "motivation" },
  { text: "Rest is part of the process. Smart move.", emoji: "🧘", type: "acknowledgment" },
  { text: "Break well spent. Your brain thanks you.", emoji: "☕", type: "acknowledgment" },
  { text: "Refreshed! Now back to being awesome.", emoji: "✨", type: "humor" },
  { text: "Strategic pause complete. Energy restored.", emoji: "⚡", type: "acknowledgment" },
];

// ============================================================================
// MOVEMENT COMPLETION MESSAGES
// ============================================================================

const movementMessages: EncouragementMessage[] = [
  { text: "Body moving, mind grooving! Great job.", emoji: "🏃", type: "celebration" },
  { text: "Exercise complete! Endorphins are your friend now.", emoji: "💪", type: "celebration" },
  { text: "Movement done. You just invested in yourself.", emoji: "🌟", type: "motivation" },
  { text: "Physical activity crushed. Mind and body aligned!", emoji: "🧠", type: "celebration" },
  { text: "Your body just thanked you in endorphins.", emoji: "🎉", type: "humor" },
  { text: "Movement matters, and you showed up. Respect.", emoji: "👏", type: "acknowledgment" },
];

// ============================================================================
// ESSENTIAL TASK MESSAGES
// ============================================================================

const essentialMessages: EncouragementMessage[] = [
  { text: "Life admin handled. One less thing to worry about.", emoji: "✅", type: "acknowledgment" },
  { text: "Essential task done! Adulting level: expert.", emoji: "🎓", type: "humor" },
  { text: "Responsibility completed. You're on top of things.", emoji: "📋", type: "acknowledgment" },
  { text: "That needed doing, and you did it. Simple excellence.", emoji: "💫", type: "acknowledgment" },
  { text: "Checked off! Your organized self is showing.", emoji: "📝", type: "acknowledgment" },
];

// ============================================================================
// PHONE/SOCIAL MESSAGES
// ============================================================================

const phoneMessages: EncouragementMessage[] = [
  { text: "Connected and present. Social battery charged.", emoji: "📱", type: "acknowledgment" },
  { text: "Good conversations fuel the soul.", emoji: "💬", type: "acknowledgment" },
  { text: "Human connection time well spent.", emoji: "🤝", type: "acknowledgment" },
  { text: "Social time done! Back to the mission.", emoji: "🎯", type: "motivation" },
];

// ============================================================================
// LEISURE MESSAGES
// ============================================================================

const leisureMessages: EncouragementMessage[] = [
  { text: "You deserve this downtime. Enjoy it guilt-free.", emoji: "🌴", type: "acknowledgment" },
  { text: "Rest is productive too. Balance achieved.", emoji: "⚖️", type: "acknowledgment" },
  { text: "Free time well utilized. Refreshed and ready.", emoji: "🎮", type: "acknowledgment" },
  { text: "Leisure complete. You've earned every minute.", emoji: "🏆", type: "celebration" },
];

// ============================================================================
// MEAL MESSAGES
// ============================================================================

const mealMessages: EncouragementMessage[] = [
  { text: "Fueled up! Your body has the energy it needs.", emoji: "🍽️", type: "acknowledgment" },
  { text: "Good food, good mood. Back to greatness.", emoji: "😋", type: "humor" },
  { text: "Nutrition check: complete. Energy levels: rising.", emoji: "📈", type: "acknowledgment" },
];

// ============================================================================
// PROGRESS-BASED MESSAGES
// ============================================================================

const progressMessages: Record<string, EncouragementMessage[]> = {
  first: [
    { text: "First one down! The momentum starts now.", emoji: "🚀", type: "motivation" },
    { text: "And so it begins. You're officially crushing it.", emoji: "💥", type: "celebration" },
    { text: "Task #1 complete. This is going to be a good day.", emoji: "🌅", type: "motivation" },
  ],
  halfway: [
    { text: "Halfway there! You're in the zone now.", emoji: "🎯", type: "celebration" },
    { text: "50% done. The second half is all downhill.", emoji: "⛷️", type: "motivation" },
    { text: "Half your day conquered. Keep this energy going!", emoji: "⚡", type: "celebration" },
  ],
  almostDone: [
    { text: "Almost there! The finish line is in sight.", emoji: "🏁", type: "motivation" },
    { text: "Just a little more. You've got this!", emoji: "💪", type: "motivation" },
    { text: "So close! Push through to the end.", emoji: "🔥", type: "motivation" },
  ],
  complete: [
    { text: "ALL DONE! You absolutely crushed today.", emoji: "🏆", type: "celebration" },
    { text: "100% complete. You're officially a legend.", emoji: "👑", type: "celebration" },
    { text: "Every single task done. Take a bow!", emoji: "🎉", type: "celebration" },
    { text: "Day complete! Rest well, you've earned it.", emoji: "🌙", type: "acknowledgment" },
  ],
};

// ============================================================================
// HIGH INTENSITY MESSAGES
// ============================================================================

const highIntensityMessages: EncouragementMessage[] = [
  { text: "High intensity mode paying off. Warrior status.", emoji: "⚔️", type: "motivation" },
  { text: "Pushing hard today. The results will be worth it.", emoji: "💎", type: "motivation" },
  { text: "Maximum effort, maximum results. Keep going!", emoji: "🔥", type: "celebration" },
];

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export function getEncouragementMessage(
  blockType: BlockType,
  completedCount: number,
  totalCount: number,
  intensity: Intensity
): EncouragementMessage {
  // Calculate progress
  const progress = completedCount / totalCount;
  
  // Check for milestone messages first
  if (completedCount === 1) {
    return randomChoice(progressMessages.first);
  }
  
  if (progress === 1) {
    return randomChoice(progressMessages.complete);
  }
  
  if (progress >= 0.9 && progress < 1) {
    return randomChoice(progressMessages.almostDone);
  }
  
  if (progress >= 0.45 && progress <= 0.55) {
    return randomChoice(progressMessages.halfway);
  }
  
  // High intensity bonus messages (20% chance)
  if (intensity === "high" && Math.random() < 0.2) {
    return randomChoice(highIntensityMessages);
  }
  
  // Get type-specific message
  const typeMessages = getMessagesByType(blockType);
  return randomChoice(typeMessages);
}

function getMessagesByType(blockType: BlockType): EncouragementMessage[] {
  switch (blockType) {
    case "work":
      return workMessages;
    case "break":
      return breakMessages;
    case "movement":
      return movementMessages;
    case "essential":
      return essentialMessages;
    case "phone":
    case "social":
      return phoneMessages;
    case "leisure":
      return leisureMessages;
    case "meal":
      return mealMessages;
    default:
      return essentialMessages;
  }
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// ============================================================================
// STREAK MESSAGES (for consecutive completions)
// ============================================================================

export function getStreakMessage(streak: number): EncouragementMessage | null {
  if (streak < 3) return null;
  
  const streakMessages: EncouragementMessage[] = [
    { text: `${streak} in a row! You're on fire!`, emoji: "🔥", type: "celebration" },
    { text: `${streak}-task streak! Unstoppable energy.`, emoji: "⚡", type: "celebration" },
    { text: `Streak of ${streak}! Who's going to stop you?`, emoji: "💪", type: "motivation" },
  ];
  
  return randomChoice(streakMessages);
}

