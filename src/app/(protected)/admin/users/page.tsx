import { ListUsersUseCase } from "@/core/use-cases/user/list-users";
import { SupabaseUsersRepository } from "@/infrastructure/repositories/supabase-users-repository";
import { SectionHeader } from "@/components/section-header";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteUserAction, updateUserRoleAction } from "./actions";

export default async function AdminUsersPage() {
  const currentUser = await requireRole(["admin"]);
  const supabase = await createSupabaseServerClient();
  const repository = new SupabaseUsersRepository(supabase);
  const useCase = new ListUsersUseCase(repository);
  const users = await useCase.execute();

  return (
    <section className="grid gap-4">
      <SectionHeader
        title="Users Management"
        description="Create users, update roles, and control account access."
      />
      <div className="rounded-lg border border-border p-4">
        <h3 className="font-medium">Users List</h3>
        {users.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No active users found.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[1fr_auto_auto]"
              >
                <div>
                  <p className="font-medium">{user.name ?? "(No Name)"}</p>
                  <p className="text-xs text-muted-foreground">{user.id}</p>
                </div>
                <form action={updateUserRoleAction} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={user.id} />
                  <select
                    name="role"
                    defaultValue={user.role}
                    className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                    disabled={user.id === currentUser.userId}
                  >
                    <option value="admin">admin</option>
                    <option value="user">user</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-md border border-border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
                    disabled={user.id === currentUser.userId}
                  >
                    Update
                  </button>
                </form>
                <form action={deleteUserAction}>
                  <input type="hidden" name="id" value={user.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
                    disabled={user.id === currentUser.userId}
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
