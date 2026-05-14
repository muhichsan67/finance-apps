"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import type { Source } from "@/core/domain/source";
import type { TransactionListPage } from "@/core/domain/transaction";
import { TransactionList } from "@/components/transaction-list";
import { TransactionFiltersForm } from "@/components/transaction-list-filters";
import { TransactionListPagination } from "@/components/transaction-list-pagination";
import {
  TRANSACTION_LIST_PAGE_SIZE,
  type TransactionListFilters,
} from "@/app/(protected)/transactions/transaction-list-query";

function transactionFiltersFormKey(f: TransactionListFilters): string {
  return [f.dateFrom ?? "", f.dateTo ?? "", f.sourceId ?? "", f.categoryType ?? ""].join("|");
}

export function TransactionsListShell({
  listPage,
  sources,
  filters,
  page,
}: {
  listPage: TransactionListPage;
  sources: Source[];
  filters: TransactionListFilters;
  page: number;
}) {
  return (
    <section className="grid gap-4">
      <div className="app-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Filter by date, source, or inbound/outbound flow. Tap a card for details.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <Link
            href="/transactions/new"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:brightness-105 hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="size-4" aria-hidden />
            New
          </Link>
        </div>
      </div>

      <TransactionFiltersForm
        key={transactionFiltersFormKey(filters)}
        sources={sources}
        filters={filters}
      />

      <TransactionListPagination
        filters={filters}
        page={page}
        pageSize={TRANSACTION_LIST_PAGE_SIZE}
        total={listPage.total}
      />

      <TransactionList transactions={listPage.items} />
    </section>
  );
}
