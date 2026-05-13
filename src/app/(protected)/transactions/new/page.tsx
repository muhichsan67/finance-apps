import { SupabaseCategoryRepository } from "@/infrastructure/repositories/supabase-category-repository";
import { SupabaseSourceRepository } from "@/infrastructure/repositories/supabase-source-repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TransactionNewShell } from "./transaction-new-shell";

export default async function NewTransactionPage() {
  const supabase = await createSupabaseServerClient();
  const categoryRepository = new SupabaseCategoryRepository(supabase);
  const sourceRepository = new SupabaseSourceRepository(supabase);
  const [categories, sources] = await Promise.all([
    categoryRepository.listActiveCategories(),
    sourceRepository.listActiveSources(),
  ]);

  const defaultTransactionDate = new Date().toISOString().slice(0, 10);

  return (
    <TransactionNewShell
      categories={categories}
      sources={sources}
      defaultTransactionDate={defaultTransactionDate}
    />
  );
}
