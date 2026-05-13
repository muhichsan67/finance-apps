import { ListSourcesUseCase } from "@/core/use-cases/source/list-sources";
import { SupabaseSourceRepository } from "@/infrastructure/repositories/supabase-source-repository";
import { SectionHeader } from "@/components/section-header";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSourceAction, deleteSourceAction } from "./actions";

export default async function AdminSourcesPage() {
  await requireRole(["admin"]);
  const supabase = await createSupabaseServerClient();
  const repository = new SupabaseSourceRepository(supabase);
  const useCase = new ListSourcesUseCase(repository);
  const sources = await useCase.execute();

  return (
    <section className="grid gap-4">
      <SectionHeader
        title="Sources Master Data"
        description="Manage transaction sources such as cash, bank, e-wallet."
      />
      <div className="app-card p-5">
        <h3 className="font-semibold tracking-tight">Add Source</h3>
        <form action={createSourceAction} className="mt-3 grid gap-2 sm:grid-cols-4">
          <input
            name="name"
            placeholder="Source name"
            className="h-11 rounded-2xl border border-border/80 bg-card/80 px-3 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/25 sm:col-span-2"
            required
          />
          <select
            name="type"
            defaultValue="cash"
            className="h-11 rounded-2xl border border-border/80 bg-card/80 px-3 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/25"
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="ewallet">E-Wallet</option>
            <option value="others">Others</option>
          </select>
          <button
            type="submit"
            className="h-11 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:brightness-105 hover:shadow-md active:scale-[0.98]"
          >
            Add
          </button>
        </form>
      </div>

      <div className="app-card p-5">
        <h3 className="font-semibold tracking-tight">Source List</h3>
        {sources.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No active sources found.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/25 p-3"
              >
                <div>
                  <p className="font-medium">{source.name}</p>
                  <p className="text-xs uppercase text-muted-foreground">{source.type}</p>
                </div>
                <form action={deleteSourceAction}>
                  <input type="hidden" name="id" value={source.id} />
                  <button
                    type="submit"
                    className="rounded-xl border border-border/80 px-3 py-2 text-sm font-medium transition-all duration-200 hover:border-primary/35 hover:bg-primary/10 active:scale-[0.98]"
                  >
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
