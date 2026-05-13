"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CATEGORY_TYPES } from "@/core/domain/category";
import { CreateCategoryUseCase } from "@/core/use-cases/category/create-category";
import { DeleteCategoryUseCase } from "@/core/use-cases/category/delete-category";
import { SupabaseCategoryRepository } from "@/infrastructure/repositories/supabase-category-repository";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(CATEGORY_TYPES),
});

const deleteSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export async function createCategoryAction(formData: FormData) {
  const { userId } = await requireRole(["admin"]);
  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const supabase = await createSupabaseServerClient();
  const repository = new SupabaseCategoryRepository(supabase);
  const useCase = new CreateCategoryUseCase(repository);
  await useCase.execute({
    name: parsed.data.name,
    type: parsed.data.type,
    actorUserId: userId,
  });

  revalidatePath("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  const { userId } = await requireRole(["admin"]);
  const parsed = deleteSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    throw new Error("Invalid category id");
  }

  const supabase = await createSupabaseServerClient();
  const repository = new SupabaseCategoryRepository(supabase);
  const useCase = new DeleteCategoryUseCase(repository);
  await useCase.execute(parsed.data.id, userId);

  revalidatePath("/admin/categories");
}
