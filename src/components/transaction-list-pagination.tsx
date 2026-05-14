import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  buildTransactionsListHref,
  type TransactionListFilters,
} from "@/app/(protected)/transactions/transaction-list-query";

export function TransactionListPagination({
  filters,
  page,
  pageSize,
  total,
}: {
  filters: TransactionListFilters;
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  if (total === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm">
      <p className="text-muted-foreground">
        Page <span className="font-semibold text-foreground">{page}</span> of{" "}
        <span className="font-semibold text-foreground">{totalPages}</span>
        <span className="mx-2 text-border">·</span>
        <span className="tabular-nums">{total}</span> total
      </p>
      <div className="flex gap-2">
        <Link
          href={buildTransactionsListHref(filters, hasPrev ? page - 1 : 1)}
          aria-disabled={!hasPrev}
          className={
            !hasPrev
              ? "pointer-events-none inline-flex h-10 items-center gap-1 rounded-xl border border-border/50 px-3 opacity-40"
              : "inline-flex h-10 items-center gap-1 rounded-xl border border-border/80 bg-card px-3 font-medium transition-colors hover:border-primary/40 hover:bg-primary/10"
          }
        >
          <ChevronLeft className="size-4" aria-hidden />
          Prev
        </Link>
        <Link
          href={buildTransactionsListHref(filters, hasNext ? page + 1 : totalPages)}
          aria-disabled={!hasNext}
          className={
            !hasNext
              ? "pointer-events-none inline-flex h-10 items-center gap-1 rounded-xl border border-border/50 px-3 opacity-40"
              : "inline-flex h-10 items-center gap-1 rounded-xl border border-border/80 bg-card px-3 font-medium transition-colors hover:border-primary/40 hover:bg-primary/10"
          }
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
