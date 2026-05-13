"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Users,
  MoreHorizontal,
  Tags,
  Database,
  SlidersHorizontal,
} from "lucide-react";
import type { AppRole } from "@/core/domain/auth";
import { cn } from "@/lib/utils";

type IconNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: (pathname: string) => boolean;
};

const adminMainItems: IconNavItem[] = [
  {
    href: "/admin",
    label: "Home",
    icon: LayoutDashboard,
    isActive: (p) => p === "/admin",
  },
  {
    href: "/transactions",
    label: "Wallet",
    icon: Wallet,
    isActive: (p) => p.startsWith("/transactions"),
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    isActive: (p) => p.startsWith("/admin/users"),
  },
];

const adminMoreLinks: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/sources", label: "Sources", icon: Database },
  { href: "/admin/system-settings", label: "Settings", icon: SlidersHorizontal },
];

const userItems: IconNavItem[] = [
  {
    href: "/transactions",
    label: "Transactions",
    icon: Wallet,
    isActive: (p) => p.startsWith("/transactions"),
  },
];

function NavLink({
  item,
  pathname,
}: {
  item: IconNavItem;
  pathname: string;
}) {
  const active = item.isActive ? item.isActive(pathname) : pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[0.65rem] font-medium transition-all duration-200",
        active
          ? "bg-primary/30 text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-primary/10 hover:text-foreground active:scale-95"
      )}
    >
      <Icon
        className={cn(
          "size-5 stroke-[1.75] transition-transform duration-200",
          active && "scale-105"
        )}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function AdminMoreMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = React.useState(false);
  const moreActive = adminMoreLinks.some((l) => pathname.startsWith(l.href));

  return (
    <div className="relative flex min-w-0 flex-1 flex-col items-stretch">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[0.65rem] font-medium transition-all duration-200",
          open || moreActive
            ? "bg-primary/30 text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-primary/10 hover:text-foreground active:scale-95"
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <MoreHorizontal className="size-5 stroke-[1.75]" />
        <span>More</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "absolute bottom-[calc(100%+0.5rem)] left-1/2 z-50 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-[1.25rem] border p-2 shadow-lg",
              "border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl",
              "animate-in fade-in slide-in-from-bottom-3 duration-200"
            )}
            role="dialog"
          >
            <p className="px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground">Manage</p>
            <ul className="grid gap-1">
              {adminMoreLinks.map((link) => {
                const Icon = link.icon;
                const active = pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-primary/20 text-foreground"
                          : "text-muted-foreground hover:bg-primary/10 hover:text-foreground active:scale-[0.99]"
                      )}
                    >
                      <Icon className="size-4 shrink-0 stroke-[1.75]" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export function AppNav({ role }: { role: AppRole }) {
  const pathname = usePathname();

  if (role === "admin") {
    return (
      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 border-t pb-[env(safe-area-inset-bottom)]",
          "border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl",
          "shadow-[var(--nav-shadow)]"
        )}
      >
        <div className="mx-auto flex max-w-lg items-stretch gap-1 px-2 py-2">
          {adminMainItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
          <AdminMoreMenu key={pathname} pathname={pathname} />
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t pb-[env(safe-area-inset-bottom)]",
        "border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl",
        "shadow-[var(--nav-shadow)]"
      )}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-center px-6 py-2">
        {userItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    </nav>
  );
}
