import { ListCategoriesUseCase } from "@/core/use-cases/category/list-categories";
import { SupabaseCategoryRepository } from "@/infrastructure/repositories/supabase-category-repository";
import { SectionHeader } from "@/components/section-header";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCategoryAction, deleteCategoryAction } from "./actions";

export default async function AdminCategoriesPage() {
  await requireRole(["admin"]);
  const supabase = await createSupabaseServerClient();
  const repository = new SupabaseCategoryRepository(supabase);
  const useCase = new ListCategoriesUseCase(repository);
  const categories = await useCase.execute();

  return (
    <section className="grid gap-4">
      <SectionHeader
        title="Category Master Data"
        description="Manage transaction categories for all users."
      />

      <div className="app-card p-5">
        <h3 className="font-semibold tracking-tight">Add Category</h3>
        <form action={createCategoryAction} className="mt-3 grid gap-2 sm:grid-cols-4">
          <input
            name="name"
            placeholder="Category name"
            className="h-11 rounded-2xl border border-border/80 bg-card/80 px-3 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/25 sm:col-span-2"
            required
          />
          <select
            name="type"
            defaultValue="inbound"
            className="h-11 rounded-2xl border border-border/80 bg-card/80 px-3 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/25"
          >
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
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
        <h3 className="font-semibold tracking-tight">Category List</h3>
        {categories.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No active categories found.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/25 p-3"
              >
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs uppercase text-muted-foreground">
                    {category.type}
                  </p>
                </div>
                <form action={deleteCategoryAction}>
                  <input type="hidden" name="id" value={category.id} />
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
