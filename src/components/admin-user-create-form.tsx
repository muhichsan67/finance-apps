"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createUserAdminAction } from "@/app/(protected)/admin/users/actions";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-12 w-full rounded-2xl border border-border/80 bg-card/80 px-4 text-sm shadow-sm backdrop-blur-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/30";

export function AdminUserCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="app-card grid max-w-lg gap-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => {
          void (async () => {
            const result = await createUserAdminAction(fd);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("User created.");
            if (result.data?.userId) {
              router.push(`/admin/users/${result.data.userId}/edit`);
            } else {
              router.push("/admin/users");
            }
            router.refresh();
          })();
        });
      }}
    >
      <h2 className="text-lg font-semibold tracking-tight">Create user</h2>
      <p className="text-sm text-muted-foreground">
        Requires <code className="rounded bg-muted px-1">SUPABASE_SERVICE_ROLE_KEY</code> on the server.
      </p>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="off" className={fieldClass} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="password">
          Initial password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className={fieldClass}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="name">
          Display name
        </label>
        <input id="name" name="name" type="text" className={fieldClass} placeholder="Optional" />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="role">
          Role
        </label>
        <select id="role" name="role" required className={fieldClass} defaultValue="user">
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </div>
      <Button type="submit" disabled={pending} className="w-full gap-2 sm:w-auto">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {pending ? "Creating…" : "Create user"}
      </Button>
    </form>
  );
}
