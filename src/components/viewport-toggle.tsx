"use client";

import { Switch } from "@/components/ui/switch";

interface ViewportToggleProps {
  desktopMode: boolean;
  onDesktopModeChange: (value: boolean) => void;
}

export function ViewportToggle({
  desktopMode,
  onDesktopModeChange,
}: ViewportToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Desktop View</span>
      <Switch
        checked={desktopMode}
        onCheckedChange={onDesktopModeChange}
        aria-label="Toggle desktop/mobile layout"
      />
    </div>
  );
}
