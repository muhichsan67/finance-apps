"use client";

import Link from "next/link";
import { Calendar, ChevronRight, Paperclip, Tag, Wallet } from "lucide-react";
import type { TransactionListItem } from "@/core/domain/transaction";

const money = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatDisplayDate(isoDate: string) {
  const d = new Date(isoDate + "T12:00:00");
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('id-ID', {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TransactionList({ transactions }: { transactions: TransactionListItem[] }) {
  if (transactions.length === 0) {
    return (
      <div className="app-card p-6 text-center text-sm text-muted-foreground">
        No transactions yet.{" "}
        <Link href="/transactions/new" className="font-medium text-primary underline-offset-2 hover:underline">
          Create your first one
        </Link>
        .
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {transactions.map((tx) => (
        <li key={tx.id}>
          <Link
            href={`/transactions/${tx.id}`}
            className="block rounded-[1.25rem] outline-none transition-transform duration-200 hover:opacity-[0.98] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <article className="app-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-lg font-semibold tabular-nums text-foreground">
                    {money.format(Number(tx.amount))}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    <Calendar className="size-3.5 shrink-0" aria-hidden />
                    {formatDisplayDate(tx.transactionDate)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Tag className="size-3.5 shrink-0" aria-hidden />
                    {tx.categoryName ?? (tx.categoryId != null ? `Category #${tx.categoryId}` : "—")}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Wallet className="size-3.5 shrink-0" aria-hidden />
                    {tx.sourceName ?? (tx.sourceId != null ? `Source #${tx.sourceId}` : "—")}
                  </span>
                  {tx.attachmentCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-primary">
                      <Paperclip className="size-3.5 shrink-0" aria-hidden />
                      {tx.attachmentCount} file{tx.attachmentCount === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                {tx.description ? (
                  <p className="line-clamp-2 text-sm leading-relaxed text-foreground/90">{tx.description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto sm:flex-col sm:items-end">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  #{tx.id}
                </span>
                <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
              </div>
            </article>
          </Link>
        </li>
      ))}
    </ul>
  );
}
