import { notFound } from "next/navigation";
import { GetTransactionDetailForUserUseCase } from "@/core/use-cases/transaction/get-transaction-detail-for-user";
import { SupabaseTransactionRepository } from "@/infrastructure/repositories/supabase-transaction-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/auth/get-current-user-role";
import { TransactionDetailClient } from "@/components/transaction-detail-client";

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: raw } = await params;
  const id = Number.parseInt(raw, 10);
  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  const { userId } = await getCurrentUserRole();
  const supabase = await createSupabaseServerClient();
  const repository = new SupabaseTransactionRepository(supabase);
  const useCase = new GetTransactionDetailForUserUseCase(repository);
  const detail = await useCase.execute(userId, id);

  if (!detail) {
    notFound();
  }

  return <TransactionDetailClient detail={detail} />;
}
