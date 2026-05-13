export const CATEGORY_TYPES = ["inbound", "outbound"] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

export interface Category {
  id: number;
  user_id: string | null;
  name: string;
  type: CategoryType;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
}

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  actorUserId: string;
}

export interface CategoryRepository {
  listActiveCategories(): Promise<Category[]>;
  createCategory(input: CreateCategoryInput): Promise<void>;
  softDeleteCategory(id: number, actorUserId: string): Promise<void>;
}
