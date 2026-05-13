"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DeleteSystemSettingUseCase } from "@/core/use-cases/system-setting/delete-system-setting";
import { ListSystemSettingsUseCase } from "@/core/use-cases/system-setting/list-system-settings";
import { UpsertSystemSettingUseCase } from "@/core/use-cases/system-setting/upsert-system-setting";
import { SupabaseSystemSettingRepository } from "@/infrastructure/repositories/supabase-system-setting-repository";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const upsertSchema = z.object({
  key_name: z.string().min(1).max(100),
  value: z.string().min(1).max(500),
  setting_group: z.string().max(100).optional(),
});
const deleteSchema = z.object({ id: z.coerce.number().int().positive() });

export async function upsertSystemSettingAction(formData: FormData) {
  const { userId } = await requireRole(["admin"]);
  const parsed = upsertSchema.safeParse({
    key_name: formData.get("key_name"),
    value: formData.get("value"),
    setting_group: formData.get("setting_group") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  const supabase = await createSupabaseServerClient();
  const repo = new SupabaseSystemSettingRepository(supabase);
  const useCase = new UpsertSystemSettingUseCase(repo);
  await useCase.execute({
    ...parsed.data,
    setting_group: parsed.data.setting_group ?? null,
    actorUserId: userId,
  });
  revalidatePath("/admin/system-settings");
}

export async function deleteSystemSettingAction(formData: FormData) {
  const { userId } = await requireRole(["admin"]);
  const parsed = deleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) throw new Error("Invalid setting id");

  const supabase = await createSupabaseServerClient();
  const repo = new SupabaseSystemSettingRepository(supabase);
  const useCase = new DeleteSystemSettingUseCase(repo);
  await useCase.execute(parsed.data.id, userId);
  revalidatePath("/admin/system-settings");
}

export async function listSystemSettings() {
  await requireRole(["admin"]);
  const supabase = await createSupabaseServerClient();
  const repo = new SupabaseSystemSettingRepository(supabase);
  const useCase = new ListSystemSettingsUseCase(repo);
  return useCase.execute();
}
