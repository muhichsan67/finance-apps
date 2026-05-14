"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ProfileUser } from "@/core/domain/profile-user";
import { updateUserAdminAction } from "@/app/(protected)/admin/users/actions";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-12 w-full rounded-2xl border border-border/80 bg-card/80 px-4 text-sm shadow-sm backdrop-blur-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/30";

export function AdminUserEditForm({
  user,
  currentUserId,
}: {
  user: ProfileUser;
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isSelf = user.id === currentUserId;

  return (
    <form
      className="app-card grid max-w-lg gap-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => {
          void (async () => {
            const result = await updateUserAdminAction(fd);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("User updated.");
            router.refresh();
          })();
        });
      }}
    >
      <input type="hidden" name="id" value={user.id} />
      <h2 className="text-lg font-semibold tracking-tight">Edit user</h2>
      <p className="break-all text-xs text-muted-foreground">{user.id}</p>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="name">
          Display name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={user.name ?? ""}
          className={fieldClass}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="role">
          Role
        </label>
        <select
          id="role"
          name="role"
          required
          defaultValue={user.role}
          disabled={isSelf}
          className={fieldClass}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        {isSelf ? (
          <p className="text-xs text-muted-foreground">You cannot change your own role from this form.</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="new_password">
          New password
        </label>
        <input
          id="new_password"
          name="new_password"
          type="password"
          autoComplete="new-password"
          placeholder="Leave blank to keep current password"
          className={fieldClass}
        />
        <p className="text-xs text-muted-foreground">
          Requires service role key on the server to apply a new password.
        </p>
      </div>
      <Button type="submit" disabled={pending} className="w-full gap-2 sm:w-auto">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
