"use client";

import { useState } from "react";
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Bell,
  Volume2,
  VolumeX,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useStore, useSettings, usePreferences } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { ThemeMode } from "@/types";

/**
 * SettingsDialog - User preferences and app settings
 */

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const settings = useSettings();
  const preferences = usePreferences();
  const { updateSettings, updatePreferences, reset } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);

  const themeOptions: { id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];

  const handleThemeChange = (theme: ThemeMode) => {
    updateSettings({ theme });
  };

  const handleReset = () => {
    if (confirmReset) {
      reset();
      onOpenChange(false);
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Customize your Pace experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Appearance</label>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleThemeChange(option.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                    settings.theme === option.id
                      ? "bg-pace-500/20 border-pace-400/50"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  )}
                >
                  <option.icon
                    className={cn(
                      "w-5 h-5",
                      settings.theme === option.id
                        ? "text-pace-400"
                        : "text-white/60"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm",
                      settings.theme === option.id
                        ? "text-white"
                        : "text-white/60"
                    )}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-white/60" />
                <div>
                  <p className="text-sm font-medium text-white">Notifications</p>
                  <p className="text-xs text-white/50">Get reminded about tasks</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) =>
                  updateSettings({ notifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.soundEffects ? (
                  <Volume2 className="w-5 h-5 text-white/60" />
                ) : (
                  <VolumeX className="w-5 h-5 text-white/60" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">Sound Effects</p>
                  <p className="text-xs text-white/50">Audio feedback on actions</p>
                </div>
              </div>
              <Switch
                checked={settings.soundEffects}
                onCheckedChange={(checked) =>
                  updateSettings({ soundEffects: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-white/60" />
                <div>
                  <p className="text-sm font-medium text-white">Animations</p>
                  <p className="text-xs text-white/50">Enable motion effects</p>
                </div>
              </div>
              <Switch
                checked={settings.animationsEnabled}
                onCheckedChange={(checked) =>
                  updateSettings({ animationsEnabled: checked })
                }
              />
            </div>
          </div>

          {/* Default Times */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Default Schedule</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-white/50">Wake Time</label>
                <input
                  type="time"
                  value={preferences.wakeTime}
                  onChange={(e) =>
                    updatePreferences({ wakeTime: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-pace-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/50">Sleep Time</label>
                <input
                  type="time"
                  value={preferences.sleepTime}
                  onChange={(e) =>
                    updatePreferences({ sleepTime: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-pace-400"
                />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-white/10">
            <Button
              variant={confirmReset ? "destructive" : "secondary"}
              className="w-full"
              onClick={handleReset}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {confirmReset ? "Click again to confirm" : "Reset All Data"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

