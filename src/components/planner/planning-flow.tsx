"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Clock,
  Zap,
  Coffee,
  Moon,
  Users,
  Dumbbell,
  Brain,
  Heart,
  ArrowRight,
  ArrowLeft,
  Check,
  Sun,
  Flame,
  Wind,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TimeWindow, EnergyLevel, MoodState, TaskCategory } from "@/types";

/**
 * PlanningFlow - Interactive AI-style planning questionnaire
 * Guides users through creating an optimized day plan
 */

interface PlanningOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  value: string | number;
}

interface PlanningStep {
  id: string;
  title: string;
  subtitle: string;
  type: "choice" | "multiChoice" | "slider" | "balance";
  options?: PlanningOption[];
  sliderConfig?: {
    min: number;
    max: number;
    step: number;
    labels: string[];
  };
}

const planningSteps: PlanningStep[] = [
  {
    id: "date",
    title: "When are we planning for?",
    subtitle: "Choose which day you'd like to orchestrate",
    type: "choice",
    options: [
      { id: "today", label: "Today", icon: Sun, description: "Make the most of what's left", value: "today" },
      { id: "tomorrow", label: "Tomorrow", icon: Moon, description: "Get ahead for tomorrow", value: "tomorrow" },
      { id: "next-week", label: "Pick a day", icon: Clock, description: "Plan ahead for next week", value: "pick" },
    ],
  },
  {
    id: "timeWindow",
    title: "How much time do you have?",
    subtitle: "Select your available planning window",
    type: "choice",
    options: [
      { id: "3h", label: "3 Hours", icon: Clock, description: "Quick sprint", value: 3 },
      { id: "6h", label: "6 Hours", icon: Clock, description: "Half day focus", value: 6 },
      { id: "12h", label: "12 Hours", icon: Clock, description: "Full day mode", value: 12 },
      { id: "24h", label: "Full Day", icon: Sun, description: "Wake to sleep", value: 24 },
    ],
  },
  {
    id: "energy",
    title: "How's your energy today?",
    subtitle: "Be honest — it helps us pace your day",
    type: "choice",
    options: [
      { id: "high", label: "Fully Charged", icon: Zap, description: "Ready to conquer", value: "high" },
      { id: "medium", label: "Steady State", icon: Coffee, description: "Average energy", value: "medium" },
      { id: "low", label: "Running Low", icon: Moon, description: "Need gentle pacing", value: "low" },
    ],
  },
  {
    id: "mood",
    title: "What's your mood vibe?",
    subtitle: "This helps us suggest the right flow",
    type: "choice",
    options: [
      { id: "energized", label: "Energized", icon: Flame, description: "Feeling motivated", value: "energized" },
      { id: "calm", label: "Calm", icon: Wind, description: "Peaceful state", value: "calm" },
      { id: "stressed", label: "Stressed", icon: Brain, description: "Mind is busy", value: "stressed" },
      { id: "tired", label: "Tired", icon: Coffee, description: "Need rest", value: "tired" },
      { id: "neutral", label: "Neutral", icon: Heart, description: "Balanced mood", value: "neutral" },
    ],
  },
  {
    id: "activities",
    title: "What activities interest you today?",
    subtitle: "Select all that apply — we'll balance them",
    type: "multiChoice",
    options: [
      { id: "work", label: "Deep Work", icon: Brain, description: "Focus tasks", value: "work" },
      { id: "rest", label: "Rest & Recharge", icon: Coffee, description: "Recovery time", value: "rest" },
      { id: "social", label: "Social Time", icon: Users, description: "Connection", value: "social" },
      { id: "movement", label: "Movement", icon: Dumbbell, description: "Physical activity", value: "movement" },
    ],
  },
  {
    id: "intensity",
    title: "How should we pace the day?",
    subtitle: "Adjust the intensity slider",
    type: "slider",
    sliderConfig: {
      min: 0,
      max: 100,
      step: 10,
      labels: ["Gentle", "Balanced", "Intense"],
    },
  },
];

interface PlanningFlowProps {
  onComplete: (data: PlanningData) => void;
  onCancel: () => void;
}

export interface PlanningData {
  targetDate: string;
  timeWindow: TimeWindow;
  energy: EnergyLevel;
  mood: MoodState;
  activities: TaskCategory[];
  intensity: number;
}

export function PlanningFlow({ onComplete, onCancel }: PlanningFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, unknown>>({
    date: "today",
    timeWindow: 12,
    energy: "medium",
    mood: "neutral",
    activities: ["work"],
    intensity: 50,
  });

  const step = planningSteps[currentStep];
  const isLastStep = currentStep === planningSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleOptionSelect = useCallback((value: unknown) => {
    setResponses((prev) => ({ ...prev, [step.id]: value }));
  }, [step.id]);

  const handleMultiSelect = useCallback((value: string) => {
    setResponses((prev) => {
      const current = (prev.activities as string[]) || [];
      if (current.includes(value)) {
        return { ...prev, activities: current.filter((v) => v !== value) };
      }
      return { ...prev, activities: [...current, value] };
    });
  }, []);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      // Convert date response to actual date
      let targetDate: string;
      if (responses.date === "today") {
        targetDate = format(new Date(), "yyyy-MM-dd");
      } else if (responses.date === "tomorrow") {
        targetDate = format(addDays(new Date(), 1), "yyyy-MM-dd");
      } else {
        targetDate = format(new Date(), "yyyy-MM-dd"); // Default to today for now
      }

      onComplete({
        targetDate,
        timeWindow: responses.timeWindow as TimeWindow,
        energy: responses.energy as EnergyLevel,
        mood: responses.mood as MoodState,
        activities: responses.activities as TaskCategory[],
        intensity: responses.intensity as number,
      });
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [isLastStep, responses, onComplete]);

  const handleBack = useCallback(() => {
    if (isFirstStep) {
      onCancel();
    } else {
      setCurrentStep((s) => s - 1);
    }
  }, [isFirstStep, onCancel]);

  const progress = ((currentStep + 1) / planningSteps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-white/60 mb-2">
          <span>Step {currentStep + 1} of {planningSteps.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pace-400 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard variant="elevated" className="p-8" glow>
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pace-400/20 to-purple-500/20 border border-white/10 mb-4"
              >
                <Sparkles className="w-8 h-8 text-pace-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
              <p className="text-white/60">{step.subtitle}</p>
            </div>

            {/* Options Grid */}
            {(step.type === "choice" || step.type === "multiChoice") && step.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {step.options.map((option, index) => {
                  const isSelected = step.type === "multiChoice"
                    ? (responses.activities as string[])?.includes(option.value as string)
                    : responses[step.id] === option.value;

                  return (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() =>
                        step.type === "multiChoice"
                          ? handleMultiSelect(option.value as string)
                          : handleOptionSelect(option.value)
                      }
                      className={cn(
                        "relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left",
                        isSelected
                          ? "bg-pace-500/20 border-pace-400/50 shadow-glow-sm"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      )}
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                          isSelected ? "bg-pace-500/30" : "bg-white/10"
                        )}
                      >
                        <option.icon className={cn("w-6 h-6", isSelected ? "text-pace-400" : "text-white/70")} />
                      </div>
                      <div className="flex-1">
                        <div className={cn("font-medium", isSelected ? "text-white" : "text-white/80")}>
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-sm text-white/50">{option.description}</div>
                        )}
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-pace-500 flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Slider */}
            {step.type === "slider" && step.sliderConfig && (
              <div className="space-y-8 py-8">
                <div className="px-4">
                  <Slider
                    value={[responses.intensity as number]}
                    onValueChange={([value]) => handleOptionSelect(value)}
                    min={step.sliderConfig.min}
                    max={step.sliderConfig.max}
                    step={step.sliderConfig.step}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  {step.sliderConfig.labels.map((label, i) => (
                    <span
                      key={label}
                      className={cn(
                        "text-white/60",
                        i === 0 && (responses.intensity as number) <= 33 && "text-pace-400 font-medium",
                        i === 1 && (responses.intensity as number) > 33 && (responses.intensity as number) <= 66 && "text-pace-400 font-medium",
                        i === 2 && (responses.intensity as number) > 66 && "text-pace-400 font-medium"
                      )}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <div className="text-center">
                  <Badge variant="info" size="lg">
                    Intensity: {String(responses.intensity)}%
                  </Badge>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <Button variant="ghost" onClick={handleBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {isFirstStep ? "Cancel" : "Back"}
              </Button>
              <Button variant="glow" onClick={handleNext} className="gap-2">
                {isLastStep ? "Generate Plan" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Step Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {planningSteps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => i < currentStep && setCurrentStep(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              i === currentStep
                ? "w-6 bg-pace-400"
                : i < currentStep
                ? "bg-pace-400/50 hover:bg-pace-400/70"
                : "bg-white/20"
            )}
          />
        ))}
      </div>
    </div>
  );
}

