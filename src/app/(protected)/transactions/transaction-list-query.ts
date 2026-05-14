export const TRANSACTION_LIST_PAGE_SIZE = 10;

export type TransactionListFilters = {
  dateFrom: string | null;
  dateTo: string | null;
  sourceId: number | null;
  categoryType: "inbound" | "outbound" | null;
};

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function parseTransactionListParams(
  searchParams: Record<string, string | string[] | undefined>
): { filters: TransactionListFilters; page: number } {
  const pageRaw = first(searchParams.page);
  const page = Math.max(1, Math.floor(Number.parseInt(pageRaw ?? "1", 10)) || 1);

  const from = first(searchParams.from)?.trim() || null;
  const to = first(searchParams.to)?.trim() || null;
  const sourceRaw = first(searchParams.source)?.trim();
  const sourceIdParsed = sourceRaw ? Number.parseInt(sourceRaw, 10) : NaN;
  const sourceId = Number.isFinite(sourceIdParsed) && sourceIdParsed > 0 ? sourceIdParsed : null;

  const flow = first(searchParams.flow)?.trim();
  const categoryType =
    flow === "inbound" || flow === "outbound" ? (flow as "inbound" | "outbound") : null;

  return {
    filters: {
      dateFrom: from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? from : null,
      dateTo: to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? to : null,
      sourceId,
      categoryType,
    },
    page,
  };
}

export function buildTransactionsListHref(
  filters: TransactionListFilters,
  page: number
): string {
  const p = new URLSearchParams();
  if (filters.dateFrom) p.set("from", filters.dateFrom);
  if (filters.dateTo) p.set("to", filters.dateTo);
  if (filters.sourceId != null) p.set("source", String(filters.sourceId));
  if (filters.categoryType) p.set("flow", filters.categoryType);
  if (page > 1) p.set("page", String(page));
  const q = p.toString();
  return q ? `/transactions?${q}` : "/transactions";
}
