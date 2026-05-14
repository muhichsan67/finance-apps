import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminUserDeleteButton } from "@/components/admin-user-delete-button";
import { AdminUserEditForm } from "@/components/admin-user-edit-form";
import { SectionHeader } from "@/components/section-header";
import { SupabaseUsersRepository } from "@/infrastructure/repositories/supabase-users-repository";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminEditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUser = await requireRole(["admin"]);
  const supabase = await createSupabaseServerClient();
  const repo = new SupabaseUsersRepository(supabase);
  const user = await repo.getActiveUserById(id);
  if (!user) notFound();

  return (
    <section className="grid gap-4">
      <SectionHeader
        title="Edit user"
        description="Update display name, role, or set a new password (optional)."
      />
      <Link
        href="/admin/users"
        className="w-fit text-sm font-medium text-primary underline-offset-2 hover:underline"
      >
        ← Back to users
      </Link>
      <AdminUserEditForm user={user} currentUserId={currentUser.userId} />
      <div className="max-w-lg border-t border-border/60 pt-4">
        <AdminUserDeleteButton userId={user.id} disabled={user.id === currentUser.userId} />
      </div>
    </section>
  );
}
