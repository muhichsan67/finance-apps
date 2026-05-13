"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppRole } from "@/core/domain/auth";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

const adminItems: NavItem[] = [
  { href: "/admin", label: "Admin Home" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/sources", label: "Sources" },
  { href: "/admin/system-settings", label: "System Settings" },
  { href: "/transactions", label: "Transactions (User View)" },
];

const userItems: NavItem[] = [
  { href: "/transactions", label: "Transactions" },
];

export function AppNav({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const items = role === "admin" ? adminItems : userItems;

  return (
    <nav className="mb-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-md border border-border px-3 py-2 text-sm",
            pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-black/5 dark:hover:bg-white/10"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
