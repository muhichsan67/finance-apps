import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Category,
  CategoryRepository,
  CreateCategoryInput,
} from "@/core/domain/category";

export class SupabaseCategoryRepository implements CategoryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listActiveCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to load categories: ${error.message}`);
    }

    return (data ?? []) as Category[];
  }

  async createCategory(input: CreateCategoryInput): Promise<void> {
    const { error } = await this.supabase.from("categories").insert({
      user_id: null,
      name: input.name,
      type: input.type,
      created_by: input.actorUserId,
      updated_by: input.actorUserId,
    });

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }

  async softDeleteCategory(id: number, actorUserId: string): Promise<void> {
    const { error } = await this.supabase
      .from("categories")
      .update({
        deleted_at: new Date().toISOString(),
        updated_by: actorUserId,
      })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  }
}
