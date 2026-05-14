import { AdminUserCreateForm } from "@/components/admin-user-create-form";
import { SectionHeader } from "@/components/section-header";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminNewUserPage() {
  await requireRole(["admin"]);
  return (
    <section className="grid gap-4">
      <SectionHeader
        title="New user"
        description="Create an account and profile. Service role key must be configured on the server."
      />
      <AdminUserCreateForm />
    </section>
  );
}
