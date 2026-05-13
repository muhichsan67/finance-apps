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
    <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-border/60 bg-muted/40 px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">Wide layout</span>
      <Switch
        checked={desktopMode}
        onCheckedChange={onDesktopModeChange}
        aria-label="Toggle desktop/mobile layout"
        className="transition-transform duration-200 active:scale-95"
      />
    </div>
  );
}
