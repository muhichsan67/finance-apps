"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { TransactionListItem } from "@/core/domain/transaction";
import { TransactionList } from "@/components/transaction-list";
import { ViewportToggle } from "@/components/viewport-toggle";

export function TransactionsListShell({ transactions }: { transactions: TransactionListItem[] }) {
  const [desktopMode, setDesktopMode] = useState(false);

  return (
    <section className={`grid gap-4 ${desktopMode ? "max-w-5xl" : ""}`}>
      <div className="app-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Tap a card for full details and attachments.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <ViewportToggle desktopMode={desktopMode} onDesktopModeChange={setDesktopMode} />
          <Link
            href="/transactions/new"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:brightness-105 hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="size-4" aria-hidden />
            New
          </Link>
        </div>
      </div>

      <TransactionList transactions={transactions} />
    </section>
  );
}
