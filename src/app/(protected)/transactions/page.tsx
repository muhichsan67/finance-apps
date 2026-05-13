import { ListTransactionsForUserUseCase } from "@/core/use-cases/transaction/list-transactions-for-user";
import { SupabaseTransactionRepository } from "@/infrastructure/repositories/supabase-transaction-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/auth/get-current-user-role";
import { TransactionsListShell } from "./transactions-list-shell";

export default async function TransactionsPage() {
  const supabase = await createSupabaseServerClient();
  const { userId } = await getCurrentUserRole();
  const txRepository = new SupabaseTransactionRepository(supabase);
  const listTx = new ListTransactionsForUserUseCase(txRepository);
  const transactions = await listTx.execute(userId);

  return <TransactionsListShell transactions={transactions} />;
}
