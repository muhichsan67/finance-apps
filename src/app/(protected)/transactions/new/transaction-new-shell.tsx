"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { Category } from "@/core/domain/category";
import type { Source } from "@/core/domain/source";
import { TransactionCreateForm } from "@/components/transaction-create-form";
import { ViewportToggle } from "@/components/viewport-toggle";

export function TransactionNewShell({
  categories,
  sources,
  defaultTransactionDate,
}: {
  categories: Category[];
  sources: Source[];
  defaultTransactionDate: string;
}) {
  const [desktopMode, setDesktopMode] = useState(false);

  return (
    <section className={`grid gap-4 ${desktopMode ? "max-w-5xl" : ""}`}>
      <div className="app-card flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href="/transactions"
            className="inline-flex w-fit items-center gap-1.5 rounded-2xl border border-border/80 bg-card/80 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:bg-primary/10 hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to list
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight">New transaction</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Save a movement with optional receipts.
            </p>
          </div>
        </div>
        <ViewportToggle desktopMode={desktopMode} onDesktopModeChange={setDesktopMode} />
      </div>

      <TransactionCreateForm
        categories={categories}
        sources={sources}
        defaultTransactionDate={defaultTransactionDate}
      />
    </section>
  );
}
