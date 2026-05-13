"use client";

import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function ThemeToggle({ variant = "default" }: { variant?: "default" | "menu" }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        variant === "menu" && "justify-between rounded-2xl px-1 py-0.5"
      )}
    >
      <span
        className={cn(
          "text-muted-foreground",
          variant === "default" ? "text-sm" : "text-xs font-medium"
        )}
      >
        Dark mode
      </span>
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
        className="transition-transform duration-200 active:scale-95"
      />
    </div>
  );
}
