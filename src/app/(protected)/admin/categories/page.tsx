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

      <div className="rounded-lg border border-border p-4">
        <h3 className="font-medium">Add Category</h3>
        <form action={createCategoryAction} className="mt-3 grid gap-2 sm:grid-cols-4">
          <input
            name="name"
            placeholder="Category name"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm sm:col-span-2"
            required
          />
          <select
            name="type"
            defaultValue="inbound"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>
          <button
            type="submit"
            className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Add
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-border p-4">
        <h3 className="font-medium">Category List</h3>
        {categories.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No active categories found.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-md border border-border p-3"
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
                    className="rounded-md border border-border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
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
