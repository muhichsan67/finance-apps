"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteUserAdminAction } from "@/app/(protected)/admin/users/actions";

export function AdminUserDeleteButton({
  userId,
  disabled,
}: {
  userId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || pending}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-200/80 bg-red-500/10 px-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-500/20 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400"
      onClick={() => {
        if (!window.confirm("Soft-delete this user? They will lose access.")) return;
        const fd = new FormData();
        fd.set("id", userId);
        startTransition(() => {
          void (async () => {
            const result = await deleteUserAdminAction(fd);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("User removed.");
            router.push("/admin/users");
            router.refresh();
          })();
        });
      }}
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" />}
      {pending ? "Deleting…" : "Delete user"}
    </button>
  );
}
