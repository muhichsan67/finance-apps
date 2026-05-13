"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SOURCE_TYPES } from "@/core/domain/source";
import { CreateSourceUseCase } from "@/core/use-cases/source/create-source";
import { DeleteSourceUseCase } from "@/core/use-cases/source/delete-source";
import { SupabaseSourceRepository } from "@/infrastructure/repositories/supabase-source-repository";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(SOURCE_TYPES),
});
const deleteSchema = z.object({ id: z.coerce.number().int().positive() });

export async function createSourceAction(formData: FormData) {
  const { userId } = await requireRole(["admin"]);
  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  const supabase = await createSupabaseServerClient();
  const repo = new SupabaseSourceRepository(supabase);
  const useCase = new CreateSourceUseCase(repo);
  await useCase.execute({ ...parsed.data, actorUserId: userId });
  revalidatePath("/admin/sources");
}

export async function deleteSourceAction(formData: FormData) {
  const { userId } = await requireRole(["admin"]);
  const parsed = deleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) throw new Error("Invalid source id");

  const supabase = await createSupabaseServerClient();
  const repo = new SupabaseSourceRepository(supabase);
  const useCase = new DeleteSourceUseCase(repo);
  await useCase.execute(parsed.data.id, userId);
  revalidatePath("/admin/sources");
}
