"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DeleteUserUseCase } from "@/core/use-cases/user/delete-user";
import { SupabaseUsersRepository } from "@/infrastructure/repositories/supabase-users-repository";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";

const roleEnum = z.enum(["admin", "user"]);

const createUserSchema = z.object({
  email: z.string().email("Email tidak valid."),
  password: z.string().min(6, "Password minimal 6 karakter."),
  name: z.string().max(200).optional(),
  role: roleEnum,
});

const updateUserSchema = z.object({
  id: z.uuid(),
  name: z.string().max(200),
  role: roleEnum,
});

const deleteSchema = z.object({ id: z.uuid() });

export async function createUserAdminAction(formData: FormData): Promise<ActionResult<{ userId: string }>> {
  try {
    await requireRole(["admin"]);
    const admin = createSupabaseServiceRoleClient();
    if (!admin) {
      return actionError(
        "Variabel lingkungan SUPABASE_SERVICE_ROLE_KEY belum disetel. Tanpa itu, pembuatan user dari admin tidak dapat dilakukan."
      );
    }

    const parsed = createUserSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name") ?? "",
      role: formData.get("role"),
    });
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Input tidak valid.");
    }

    const nameTrim = parsed.data.name?.trim();
    const name = nameTrim === "" ? null : nameTrim;

    const { data: created, error } = await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
    });
    if (error || !created.user) {
      return actionError(error?.message ?? "Gagal membuat pengguna di Auth.");
    }

    const { error: profErr } = await admin.from("profiles").upsert(
      {
        id: created.user.id,
        name,
        role: parsed.data.role,
      },
      { onConflict: "id" }
    );
    if (profErr) {
      await admin.auth.admin.deleteUser(created.user.id);
      return actionError(`Gagal menyimpan profil: ${profErr.message}`);
    }

    revalidatePath("/admin/users");
    return actionOk({ userId: created.user.id });
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Terjadi kesalahan.");
  }
}

export async function updateUserAdminAction(formData: FormData): Promise<ActionResult> {
  try {
    const currentUser = await requireRole(["admin"]);
    const parsed = updateUserSchema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      role: formData.get("role"),
    });
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Input tidak valid.");
    }

    const newPassword = String(formData.get("new_password") ?? "").trim();
    if (newPassword.length > 0 && newPassword.length < 6) {
      return actionError("Password baru minimal 6 karakter.");
    }

    if (parsed.data.id === currentUser.userId && parsed.data.role !== "admin") {
      return actionError("Anda tidak boleh menghapus peran admin dari akun Anda sendiri.");
    }

    const supabase = await createSupabaseServerClient();
    const repo = new SupabaseUsersRepository(supabase);
    const nameTrim = parsed.data.name.trim();
    await repo.updateUserProfile(parsed.data.id, {
      name: nameTrim === "" ? null : nameTrim,
      role: parsed.data.role,
    });

    const pwd = newPassword;
    if (pwd.length > 0) {
      const admin = createSupabaseServiceRoleClient();
      if (!admin) {
        return actionError(
          "Profil diperbarui, tetapi SUPABASE_SERVICE_ROLE_KEY tidak disetel — password tidak diubah."
        );
      }
      const { error } = await admin.auth.admin.updateUserById(parsed.data.id, { password: pwd });
      if (error) return actionError(`Gagal mengatur password: ${error.message}`);
    }

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${parsed.data.id}/edit`);
    return actionOk();
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Terjadi kesalahan.");
  }
}

export async function deleteUserAdminAction(formData: FormData): Promise<ActionResult> {
  try {
    const currentUser = await requireRole(["admin"]);
    const parsed = deleteSchema.safeParse({ id: formData.get("id") });
    if (!parsed.success) return actionError("ID pengguna tidak valid.");
    if (parsed.data.id === currentUser.userId) {
      return actionError("Anda tidak dapat menghapus akun Anda sendiri.");
    }

    const supabase = await createSupabaseServerClient();
    const repo = new SupabaseUsersRepository(supabase);
    const useCase = new DeleteUserUseCase(repo);
    await useCase.execute(parsed.data.id);
    revalidatePath("/admin/users");
    return actionOk();
  } catch (e) {
    return actionError(e instanceof Error ? e.message : "Terjadi kesalahan.");
  }
}
