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
      <div className="app-card p-5">
        <h3 className="font-medium">Users List</h3>
        {users.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No active users found.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="grid gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:grid-cols-[1fr_auto_auto]"
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
                    className="h-10 rounded-xl border border-border/80 bg-card px-2 text-sm transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/25"
                    disabled={user.id === currentUser.userId}
                  >
                    <option value="admin">admin</option>
                    <option value="user">user</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl border border-border/80 px-3 py-2 text-sm font-medium transition-all duration-200 hover:border-primary/35 hover:bg-primary/10 active:scale-[0.98] disabled:opacity-50"
                    disabled={user.id === currentUser.userId}
                  >
                    Update
                  </button>
                </form>
                <form action={deleteUserAction}>
                  <input type="hidden" name="id" value={user.id} />
                  <button
                    type="submit"
                    className="rounded-xl border border-border/80 px-3 py-2 text-sm font-medium transition-all duration-200 hover:border-primary/35 hover:bg-primary/10 active:scale-[0.98] disabled:opacity-50"
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
