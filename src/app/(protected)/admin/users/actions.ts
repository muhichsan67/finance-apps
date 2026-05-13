"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DeleteUserUseCase } from "@/core/use-cases/user/delete-user";
import { UpdateUserRoleUseCase } from "@/core/use-cases/user/update-user-role";
import { SupabaseUsersRepository } from "@/infrastructure/repositories/supabase-users-repository";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const updateRoleSchema = z.object({
  id: z.uuid(),
  role: z.enum(["admin", "user"]),
});
const deleteSchema = z.object({ id: z.uuid() });

export async function updateUserRoleAction(formData: FormData) {
  const currentUser = await requireRole(["admin"]);
  const parsed = updateRoleSchema.safeParse({
    id: formData.get("id"),
    role: formData.get("role"),
  });
  if (!parsed.success) throw new Error("Invalid user role payload");

  if (parsed.data.id === currentUser.userId && parsed.data.role !== "admin") {
    throw new Error("You cannot remove your own admin role.");
  }

  const supabase = await createSupabaseServerClient();
  const repo = new SupabaseUsersRepository(supabase);
  const useCase = new UpdateUserRoleUseCase(repo);
  await useCase.execute(parsed.data.id, parsed.data.role);
  revalidatePath("/admin/users");
}

export async function deleteUserAction(formData: FormData) {
  const currentUser = await requireRole(["admin"]);
  const parsed = deleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) throw new Error("Invalid user id");
  if (parsed.data.id === currentUser.userId) {
    throw new Error("You cannot delete your own profile.");
  }

  const supabase = await createSupabaseServerClient();
  const repo = new SupabaseUsersRepository(supabase);
  const useCase = new DeleteUserUseCase(repo);
  await useCase.execute(parsed.data.id);
  revalidatePath("/admin/users");
}
