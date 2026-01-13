import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { format, parseISO, addMinutes } from "date-fns";
import {
  Task,
  DayPlan,
  TimeBlock,
  UserPreferences,
  PlanningSession,
  PlanningResponse,
  NavigationState,
  AppSettings,
  EnergyLevel,
  MoodState,
  TimeWindow,
  CalendarView,
  ThemeMode,
} from "@/types";
import { generateId, getOptimalTimeSlot } from "@/lib/utils";

/**
 * Main application state interface
 * Manages all state for the Pace Day Orchestrator
 */
interface PaceState {
  // Day Plans
  dayPlans: Record<string, DayPlan>; // Keyed by date string YYYY-MM-DD
  currentPlanId: string | null;

  // Planning Session
  planningSession: PlanningSession | null;

  // User Preferences
  preferences: UserPreferences;

  // Navigation
  navigation: NavigationState;

  // Settings
  settings: AppSettings;

  // Actions - Day Plans
  createDayPlan: (date: string, timeWindow: TimeWindow, energy: EnergyLevel, mood: MoodState) => DayPlan;
  updateDayPlan: (planId: string, updates: Partial<DayPlan>) => void;
  deleteDayPlan: (planId: string) => void;
  getDayPlan: (date: string) => DayPlan | undefined;

  // Actions - Tasks
  addTask: (planId: string, task: Omit<Task, "id" | "isCompleted">) => Task;
  updateTask: (planId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (planId: string, taskId: string) => void;
  toggleTaskComplete: (planId: string, taskId: string) => void;
  reorderTasks: (planId: string, taskIds: string[]) => void;

  // Actions - Time Blocks
  generateTimeBlocks: (planId: string) => void;
  updateTimeBlock: (planId: string, blockId: string, updates: Partial<TimeBlock>) => void;
  addBreak: (planId: string, afterBlockId: string, breakType: TimeBlock["breakType"]) => void;

  // Actions - Planning Session
  startPlanningSession: (targetDate: string) => void;
  addPlanningResponse: (response: PlanningResponse) => void;
  nextPlanningStep: () => void;
  prevPlanningStep: () => void;
  completePlanningSession: () => void;
  cancelPlanningSession: () => void;

  // Actions - Navigation
  setCurrentView: (view: NavigationState["currentView"]) => void;
  setSelectedDate: (date: string) => void;
  setCalendarView: (view: CalendarView) => void;

  // Actions - Settings & Preferences
  updateSettings: (updates: Partial<AppSettings>) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  setTheme: (theme: ThemeMode) => void;

  // Utility
  reset: () => void;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  wakeTime: "07:00",
  sleepTime: "23:00",
  preferredWorkHours: [9, 10, 11, 14, 15, 16],
  breakFrequencyMinutes: 90,
  breakDurationMinutes: 15,
  balancePreference: {
    work: 40,
    rest: 20,
    social: 20,
    movement: 20,
  },
};

// Default settings
const defaultSettings: AppSettings = {
  theme: "dark",
  notifications: true,
  soundEffects: true,
  animationsEnabled: true,
};

// Default navigation
const defaultNavigation: NavigationState = {
  currentView: "planner",
  selectedDate: format(new Date(), "yyyy-MM-dd"),
  calendarView: "day",
};

/**
 * Main Zustand store with persistence
 * Uses localStorage for data persistence across sessions
 */
export const useStore = create<PaceState>()(
  persist(
    (set, get) => ({
      // Initial State
      dayPlans: {},
      currentPlanId: null,
      planningSession: null,
      preferences: defaultPreferences,
      navigation: defaultNavigation,
      settings: defaultSettings,

      // Day Plan Actions
      createDayPlan: (date, timeWindow, energy, mood) => {
        const plan: DayPlan = {
          id: generateId(),
          date,
          tasks: [],
          timeBlocks: [],
          timeWindow,
          energyLevel: energy,
          mood,
          isGenerated: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          dayPlans: { ...state.dayPlans, [date]: plan },
          currentPlanId: plan.id,
        }));

        return plan;
      },

      updateDayPlan: (planId, updates) => {
        set((state) => {
          const plan = Object.values(state.dayPlans).find((p) => p.id === planId);
          if (!plan) return state;

          return {
            dayPlans: {
              ...state.dayPlans,
              [plan.date]: { ...plan, ...updates, updatedAt: new Date() },
            },
          };
        });
      },

      deleteDayPlan: (planId) => {
        set((state) => {
          const plan = Object.values(state.dayPlans).find((p) => p.id === planId);
          if (!plan) return state;

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [plan.date]: _, ...rest } = state.dayPlans;
          return {
            dayPlans: rest,
            currentPlanId: state.currentPlanId === planId ? null : state.currentPlanId,
          };
        });
      },

      getDayPlan: (date) => {
        return get().dayPlans[date];
      },

      // Task Actions
      addTask: (planId, taskData) => {
        const task: Task = {
          ...taskData,
          id: generateId(),
          isCompleted: false,
        };

        set((state) => {
          const plan = Object.values(state.dayPlans).find((p) => p.id === planId);
          if (!plan) return state;

          return {
            dayPlans: {
              ...state.dayPlans,
              [plan.date]: {
                ...plan,
                tasks: [...plan.tasks, task],
                updatedAt: new Date(),
              },
            },
          };
        });

        return task;
      },

      updateTask: (planId, taskId, updates) => {
        set((state) => {
          const plan = Object.values(state.dayPlans).find((p) => p.id === planId);
          if (!plan) return state;

          return {
            dayPlans: {
              ...state.dayPlans,
              [plan.date]: {
                ...plan,
                tasks: plan.tasks.map((t) =>
                  t.id === taskId ? { ...t, ...updates } : t
                ),
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      deleteTask: (planId, taskId) => {
        set((state) => {
          const plan = Object.values(state.dayPlans).find((p) => p.id === planId);
          if (!plan) return state;

          return {
            dayPlans: {
              ...state.dayPlans,
              [plan.date]: {
                ...plan,
                tasks: plan.tasks.filter((t) => t.id !== taskId),
                timeBlocks: plan.timeBlocks.filter((b) => b.taskId !== taskId),
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      toggleTaskComplete: (planId, taskId) => {
        set((state) => {
          const plan = Object.values(state.dayPlans).find((p) => p.id === planId);
          if (!plan) return state;

          return {
            dayPlans: {
              ...state.dayPlans,
              [plan.date]: {
                ...plan,
                tasks: plan.tasks.map((t) =>
                  t.id === taskId
                    ? {
                        ...t,
                        isCompleted: !t.isCompleted,
                        completedAt: !t.isCompleted ? new Date() : undefined,
                      }
                    : t
                ),
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      reorderTasks: (planId, taskIds) => {
        set((state) => {
          const plan = Object.values(state.dayPlans).find((p) => p.id === planId);
          if (!plan) return state;

          const taskMap = new Map(plan.tasks.map((t) => [t.id, t]));
          const reorderedTasks = taskIds
            .map((id) => taskMap.get(id))
            .filter((t): t is Task => t !== undefined);

          return {
            dayPlans: {
              ...state.dayPlans,
              [plan.date]: {
                ...plan,
                tasks: reorderedTasks,
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      // Time Block Actions
      generateTimeBlocks: (planId) => {
        set((state) => {
          const plan = Object.values(state.dayPlans).find((p) => p.id === planId);
          if (!plan) return state;

          const { preferences } = state;
          const planDate = parseISO(plan.date);
          const [wakeHour, wakeMin] = preferences.wakeTime.split(":").map(Number);
          const [sleepHour, sleepMin] = preferences.sleepTime.split(":").map(Number);

          let currentTime = new Date(planDate);
          currentTime.setHours(wakeHour, wakeMin, 0, 0);

          const endTime = new Date(planDate);
          endTime.setHours(sleepHour, sleepMin, 0, 0);

          // Sort tasks by optimal time slot
          const sortedTasks = [...plan.tasks].sort((a, b) => {
            const slotA = getOptimalTimeSlot(a.category, plan.energyLevel);
            const slotB = getOptimalTimeSlot(b.category, plan.energyLevel);
            return slotA.preferredHour - slotB.preferredHour;
          });

          const timeBlocks: TimeBlock[] = [];
          let minutesSinceBreak = 0;

          for (const task of sortedTasks) {
            // Check if we need a break
            if (
              minutesSinceBreak >= preferences.breakFrequencyMinutes &&
              currentTime < endTime
            ) {
              const breakBlock: TimeBlock = {
                id: generateId(),
                taskId: "break",
                startTime: new Date(currentTime),
                endTime: addMinutes(currentTime, preferences.breakDurationMinutes),
                isBreak: true,
                breakType: "stretch",
              };
              timeBlocks.push(breakBlock);
              currentTime = breakBlock.endTime;
              minutesSinceBreak = 0;
            }

            // Add task block
            if (currentTime < endTime) {
              const taskEndTime = addMinutes(currentTime, task.estimatedMinutes);
              const block: TimeBlock = {
                id: generateId(),
                taskId: task.id,
                startTime: new Date(currentTime),
                endTime: taskEndTime > endTime ? endTime : taskEndTime,
                isBreak: false,
              };
              timeBlocks.push(block);
              currentTime = block.endTime;
              minutesSinceBreak += task.estimatedMinutes;
            }
          }

          return {
            dayPlans: {
              ...state.dayPlans,
              [plan.date]: {
                ...plan,
                timeBlocks,
                isGenerated: true,
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      updateTimeBlock: (planId, blockId, updates) => {
        set((state) => {
          const plan = Object.values(state.dayPlans).find((p) => p.id === planId);
          if (!plan) return state;

          return {
            dayPlans: {
              ...state.dayPlans,
              [plan.date]: {
                ...plan,
                timeBlocks: plan.timeBlocks.map((b) =>
                  b.id === blockId ? { ...b, ...updates } : b
                ),
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      addBreak: (planId, afterBlockId, breakType) => {
        set((state) => {
          const plan = Object.values(state.dayPlans).find((p) => p.id === planId);
          if (!plan) return state;

          const blockIndex = plan.timeBlocks.findIndex((b) => b.id === afterBlockId);
          if (blockIndex === -1) return state;

          const afterBlock = plan.timeBlocks[blockIndex];
          const breakDuration = state.preferences.breakDurationMinutes;

          const breakBlock: TimeBlock = {
            id: generateId(),
            taskId: "break",
            startTime: afterBlock.endTime,
            endTime: addMinutes(afterBlock.endTime, breakDuration),
            isBreak: true,
            breakType,
          };

          // Shift subsequent blocks
          const updatedBlocks = [...plan.timeBlocks];
          updatedBlocks.splice(blockIndex + 1, 0, breakBlock);

          // Adjust times for blocks after the new break
          for (let i = blockIndex + 2; i < updatedBlocks.length; i++) {
            const block = updatedBlocks[i];
            const duration =
              (block.endTime.getTime() - block.startTime.getTime()) / 60000;
            block.startTime = addMinutes(updatedBlocks[i - 1].endTime, 0);
            block.endTime = addMinutes(block.startTime, duration);
          }

          return {
            dayPlans: {
              ...state.dayPlans,
              [plan.date]: {
                ...plan,
                timeBlocks: updatedBlocks,
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      // Planning Session Actions
      startPlanningSession: (targetDate) => {
        set({
          planningSession: {
            id: generateId(),
            targetDate,
            currentStep: 0,
            responses: [],
            isComplete: false,
            startedAt: new Date(),
          },
        });
      },

      addPlanningResponse: (response) => {
        set((state) => {
          if (!state.planningSession) return state;

          const existingIndex = state.planningSession.responses.findIndex(
            (r) => r.questionId === response.questionId
          );

          let updatedResponses: PlanningResponse[];
          if (existingIndex !== -1) {
            updatedResponses = [...state.planningSession.responses];
            updatedResponses[existingIndex] = response;
          } else {
            updatedResponses = [...state.planningSession.responses, response];
          }

          return {
            planningSession: {
              ...state.planningSession,
              responses: updatedResponses,
            },
          };
        });
      },

      nextPlanningStep: () => {
        set((state) => {
          if (!state.planningSession) return state;
          return {
            planningSession: {
              ...state.planningSession,
              currentStep: state.planningSession.currentStep + 1,
            },
          };
        });
      },

      prevPlanningStep: () => {
        set((state) => {
          if (!state.planningSession) return state;
          return {
            planningSession: {
              ...state.planningSession,
              currentStep: Math.max(0, state.planningSession.currentStep - 1),
            },
          };
        });
      },

      completePlanningSession: () => {
        set((state) => {
          if (!state.planningSession) return state;
          return {
            planningSession: {
              ...state.planningSession,
              isComplete: true,
            },
          };
        });
      },

      cancelPlanningSession: () => {
        set({ planningSession: null });
      },

      // Navigation Actions
      setCurrentView: (view) => {
        set((state) => ({
          navigation: { ...state.navigation, currentView: view },
        }));
      },

      setSelectedDate: (date) => {
        set((state) => ({
          navigation: { ...state.navigation, selectedDate: date },
        }));
      },

      setCalendarView: (view) => {
        set((state) => ({
          navigation: { ...state.navigation, calendarView: view },
        }));
      },

      // Settings Actions
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

      setTheme: (theme) => {
        set((state) => ({
          settings: { ...state.settings, theme },
        }));
      },

      // Reset
      reset: () => {
        set({
          dayPlans: {},
          currentPlanId: null,
          planningSession: null,
          preferences: defaultPreferences,
          navigation: defaultNavigation,
          settings: defaultSettings,
        });
      },
    }),
    {
      name: "pace-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dayPlans: state.dayPlans,
        preferences: state.preferences,
        settings: state.settings,
        navigation: {
          ...state.navigation,
          selectedDate: format(new Date(), "yyyy-MM-dd"), // Always start on today
        },
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useDayPlan = (date: string) =>
  useStore((state) => state.dayPlans[date]);

export const useCurrentPlan = () =>
  useStore((state) => {
    const { selectedDate } = state.navigation;
    return state.dayPlans[selectedDate];
  });

export const useSettings = () => useStore((state) => state.settings);
export const usePreferences = () => useStore((state) => state.preferences);
export const useNavigation = () => useStore((state) => state.navigation);
export const usePlanningSession = () => useStore((state) => state.planningSession);

