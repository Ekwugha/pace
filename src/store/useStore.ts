import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { format } from "date-fns";
import {
  Task,
  DayPlan,
  UserPreferences,
  NavigationState,
  AppSettings,
  Intensity,
  BlockType,
} from "@/types";
import { generateSchedule } from "@/lib/scheduler";

/**
 * PACE Store
 * 
 * Manages all application state with localStorage persistence.
 * The scheduling logic is intensity-aware - work is ALWAYS protected,
 * and non-work activities shrink based on intensity level.
 */

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface PaceState {
  // Day Plans (keyed by date string YYYY-MM-DD)
  dayPlans: Record<string, DayPlan>;
  
  // User Preferences
  preferences: UserPreferences;
  
  // Navigation
  navigation: NavigationState;
  
  // Settings
  settings: AppSettings;
  
  // ========== ACTIONS ==========
  
  // Day Plan Actions
  getOrCreatePlan: (date: string) => DayPlan;
  setIntensity: (date: string, intensity: Intensity) => void;
  setWakeTime: (date: string, time: string) => void;
  setSleepTime: (date: string, time: string) => void;
  
  // Task Actions (one at a time input)
  addTask: (date: string, title: string, type: BlockType, estimatedMinutes: number) => Task;
  removeTask: (date: string, taskId: string) => void;
  updateTask: (date: string, taskId: string, updates: Partial<Task>) => void;
  
  // Schedule Generation
  generateSchedule: (date: string) => void;
  regenerateSchedule: (date: string) => void;
  
  // Block Actions
  markBlockComplete: (date: string, blockId: string) => void;
  
  // Navigation
  setCurrentView: (view: NavigationState["currentView"]) => void;
  setSelectedDate: (date: string) => void;
  
  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  
  // Reset
  reset: () => void;
}

// ============================================================================
// DEFAULTS
// ============================================================================

const defaultPreferences: UserPreferences = {
  defaultWakeTime: "07:00",
  defaultSleepTime: "23:00",
  defaultIntensity: "medium",
};

const defaultSettings: AppSettings = {
  theme: "dark",
  soundEffects: true,
  animationsEnabled: true,
};

const defaultNavigation: NavigationState = {
  currentView: "input",
  selectedDate: format(new Date(), "yyyy-MM-dd"),
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createEmptyPlan(date: string, preferences: UserPreferences): DayPlan {
  return {
    id: generateId(),
    date,
    intensity: preferences.defaultIntensity,
    wakeTime: preferences.defaultWakeTime,
    sleepTime: preferences.defaultSleepTime,
    tasks: [],
    blocks: [],
    tradeoffs: [],
    warnings: [],
    isGenerated: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================================================
// STORE
// ============================================================================

export const useStore = create<PaceState>()(
  persist(
    (set, get) => ({
      // Initial State
      dayPlans: {},
      preferences: defaultPreferences,
      navigation: defaultNavigation,
      settings: defaultSettings,

      // ========== DAY PLAN ACTIONS ==========
      
      getOrCreatePlan: (date) => {
        const state = get();
        if (state.dayPlans[date]) {
          return state.dayPlans[date];
        }
        
        const plan = createEmptyPlan(date, state.preferences);
        set((s) => ({
          dayPlans: { ...s.dayPlans, [date]: plan },
        }));
        return plan;
      },

      setIntensity: (date, intensity) => {
        set((state) => {
          const plan = state.dayPlans[date];
          if (!plan) return state;
          
          return {
            dayPlans: {
              ...state.dayPlans,
              [date]: {
                ...plan,
                intensity,
                isGenerated: false, // Need to regenerate
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      setWakeTime: (date, time) => {
        set((state) => {
          const plan = state.dayPlans[date];
          if (!plan) return state;
          
          return {
            dayPlans: {
              ...state.dayPlans,
              [date]: {
                ...plan,
                wakeTime: time,
                isGenerated: false,
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      setSleepTime: (date, time) => {
        set((state) => {
          const plan = state.dayPlans[date];
          if (!plan) return state;
          
          return {
            dayPlans: {
              ...state.dayPlans,
              [date]: {
                ...plan,
                sleepTime: time,
                isGenerated: false,
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      // ========== TASK ACTIONS ==========

      addTask: (date, title, type, estimatedMinutes) => {
        const task: Task = {
          id: generateId(),
          title,
          type,
          estimatedMinutes,
          isFlexible: type !== "work" && type !== "essential",
          addedAt: new Date(),
        };

        set((state) => {
          let plan = state.dayPlans[date];
          if (!plan) {
            plan = createEmptyPlan(date, state.preferences);
          }

          return {
            dayPlans: {
              ...state.dayPlans,
              [date]: {
                ...plan,
                tasks: [...plan.tasks, task],
                isGenerated: false,
                updatedAt: new Date(),
              },
            },
          };
        });

        return task;
      },

      removeTask: (date, taskId) => {
        set((state) => {
          const plan = state.dayPlans[date];
          if (!plan) return state;

          return {
            dayPlans: {
              ...state.dayPlans,
              [date]: {
                ...plan,
                tasks: plan.tasks.filter((t) => t.id !== taskId),
                isGenerated: false,
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      updateTask: (date, taskId, updates) => {
        set((state) => {
          const plan = state.dayPlans[date];
          if (!plan) return state;

          return {
            dayPlans: {
              ...state.dayPlans,
              [date]: {
                ...plan,
                tasks: plan.tasks.map((t) =>
                  t.id === taskId ? { ...t, ...updates } : t
                ),
                isGenerated: false,
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      // ========== SCHEDULE GENERATION ==========

      generateSchedule: (date) => {
        set((state) => {
          const plan = state.dayPlans[date];
          if (!plan || plan.tasks.length === 0) return state;

          const result = generateSchedule(
            plan.tasks.map((t) => ({
              id: t.id,
              title: t.title,
              type: t.type,
              estimatedMinutes: t.estimatedMinutes,
              isFlexible: t.isFlexible,
            })),
            {
              wakeTime: plan.wakeTime,
              targetSleepTime: plan.sleepTime,
              intensity: plan.intensity,
              date: new Date(date),
            }
          );

          return {
            dayPlans: {
              ...state.dayPlans,
              [date]: {
                ...plan,
                blocks: result.blocks,
                tradeoffs: result.tradeoffs,
                warnings: result.warnings,
                isGenerated: true,
                updatedAt: new Date(),
              },
            },
            navigation: {
              ...state.navigation,
              currentView: "schedule",
            },
          };
        });
      },

      regenerateSchedule: (date) => {
        const state = get();
        const plan = state.dayPlans[date];
        if (!plan) return;
        
        // Clear existing schedule and regenerate
        set((s) => ({
          dayPlans: {
            ...s.dayPlans,
            [date]: { ...plan, isGenerated: false, blocks: [] },
          },
        }));
        
        get().generateSchedule(date);
      },

      // ========== BLOCK ACTIONS ==========

      markBlockComplete: (date, blockId) => {
        set((state) => {
          const plan = state.dayPlans[date];
          if (!plan) return state;

          return {
            dayPlans: {
              ...state.dayPlans,
              [date]: {
                ...plan,
                blocks: plan.blocks.map((b) =>
                  b.id === blockId ? { ...b, isCompleted: !b.isCompleted } : b
                ),
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      // ========== NAVIGATION ==========

      setCurrentView: (view) => {
        set((state) => ({
          navigation: { ...state.navigation, currentView: view },
        }));
      },

      setSelectedDate: (date) => {
        // Ensure plan exists for this date
        get().getOrCreatePlan(date);
        
        set((state) => ({
          navigation: { ...state.navigation, selectedDate: date },
        }));
      },

      // ========== SETTINGS ==========

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      updatePreferences: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        }));
      },

      // ========== RESET ==========

      reset: () => {
        set({
          dayPlans: {},
          preferences: defaultPreferences,
          navigation: defaultNavigation,
          settings: defaultSettings,
        });
      },
    }),
    {
      name: "pace-storage-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dayPlans: state.dayPlans,
        preferences: state.preferences,
        settings: state.settings,
      }),
    }
  )
);

// ============================================================================
// SELECTOR HOOKS
// ============================================================================

export const useCurrentPlan = () => {
  const selectedDate = useStore((state) => state.navigation.selectedDate);
  return useStore((state) => state.dayPlans[selectedDate]);
};

export const useSettings = () => useStore((state) => state.settings);
export const usePreferences = () => useStore((state) => state.preferences);
export const useNavigation = () => useStore((state) => state.navigation);
