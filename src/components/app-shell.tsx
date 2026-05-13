"use client";

import * as React from "react";
import { Bell, UserRound } from "lucide-react";
import type { AppRole } from "@/core/domain/auth";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AppNav } from "@/components/app-nav";

export function AppShell({
  role,
  children,
}: {
  role: AppRole;
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell-gradient min-h-dvh">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b px-4 pt-[env(safe-area-inset-top)]",
          "border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl"
        )}
      >
        <div className="mx-auto grid h-14 max-w-lg grid-cols-[1fr_auto_1fr] items-center">
          <div aria-hidden className="min-w-0" />
          <h1 className="text-center text-base font-semibold tracking-tight text-foreground">
            Finance
          </h1>
          <div className="flex min-w-0 items-center justify-end gap-0.5">
            <button
              type="button"
              className={cn(
                "rounded-2xl p-2.5 text-muted-foreground transition-all duration-200",
                "hover:bg-primary/15 hover:text-foreground active:scale-95"
              )}
              aria-label="Notifications"
            >
              <Bell className="size-5 stroke-[1.75]" />
            </button>
            <details className="group relative">
              <summary
                className={cn(
                  "flex cursor-pointer list-none items-center rounded-2xl p-2.5 text-muted-foreground transition-all duration-200",
                  "marker:hidden hover:bg-primary/15 hover:text-foreground open:bg-primary/10 open:text-foreground",
                  "[&::-webkit-details-marker]:hidden"
                )}
                aria-label="Account menu"
              >
                <UserRound className="size-5 stroke-[1.75]" />
              </summary>
              <div
                className={cn(
                  "absolute right-0 top-[calc(100%+0.35rem)] z-50 w-56 rounded-[1.25rem] border p-3 shadow-lg",
                  "border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl",
                  "animate-in fade-in zoom-in-95 duration-200"
                )}
              >
                <p className="border-b border-border/60 px-1 pb-2 text-xs text-muted-foreground">
                  Signed in as <span className="font-medium text-foreground">{role}</span>
                </p>
                <div className="mt-3 space-y-3 px-1">
                  <ThemeToggle variant="menu" />
                  <SignOutButton className="w-full rounded-2xl border-border/80 transition-all duration-200 hover:border-primary/40 hover:bg-primary/10 active:scale-[0.98]" />
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 pb-28 pt-[calc(3.5rem+env(safe-area-inset-top))]">
        {children}
      </main>

      <AppNav role={role} />
    </div>
  );
}
