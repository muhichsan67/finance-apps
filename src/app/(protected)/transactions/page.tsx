import { ListTransactionsForUserUseCase } from "@/core/use-cases/transaction/list-transactions-for-user";
import { SupabaseSourceRepository } from "@/infrastructure/repositories/supabase-source-repository";
import { SupabaseTransactionRepository } from "@/infrastructure/repositories/supabase-transaction-repository";
import { getCurrentUserRole } from "@/lib/auth/get-current-user-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TransactionsListShell } from "./transactions-list-shell";
import {
  TRANSACTION_LIST_PAGE_SIZE,
  parseTransactionListParams,
} from "./transaction-list-query";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { filters, page } = parseTransactionListParams(sp);
  const supabase = await createSupabaseServerClient();
  const { userId } = await getCurrentUserRole();
  const txRepository = new SupabaseTransactionRepository(supabase);
  const sourceRepository = new SupabaseSourceRepository(supabase);
  const listTx = new ListTransactionsForUserUseCase(txRepository);

  const [listPage, sources] = await Promise.all([
    listTx.execute({
      userId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      sourceId: filters.sourceId,
      categoryType: filters.categoryType,
      page,
      pageSize: TRANSACTION_LIST_PAGE_SIZE,
    }),
    sourceRepository.listActiveSources(),
  ]);

  return (
    <TransactionsListShell
      listPage={listPage}
      sources={sources}
      filters={filters}
      page={page}
    />
  );
}
