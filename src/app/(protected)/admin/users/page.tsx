import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { ListUsersUseCase } from "@/core/use-cases/user/list-users";
import { SupabaseUsersRepository } from "@/infrastructure/repositories/supabase-users-repository";
import { SectionHeader } from "@/components/section-header";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  await requireRole(["admin"]);
  const supabase = await createSupabaseServerClient();
  const repository = new SupabaseUsersRepository(supabase);
  const useCase = new ListUsersUseCase(repository);
  const users = await useCase.execute();

  return (
    <section className="grid gap-4">
      <SectionHeader
        title="Users Management"
        description="Create users, update roles, names, passwords, and control account access."
      />
      <div className="app-card p-5">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold tracking-tight">Users</h3>
          <Link
            href="/admin/users/new"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:brightness-105 hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="size-4" aria-hidden />
            New user
          </Link>
        </div>

        {users.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No active users found.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">{user.name ?? "(No name)"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.id}</p>
                  <p className="mt-1 text-xs font-medium uppercase text-primary">{user.role}</p>
                </div>
                <Link
                  href={`/admin/users/${user.id}/edit`}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border/80 bg-card px-4 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/10"
                >
                  <Pencil className="size-4" aria-hidden />
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
