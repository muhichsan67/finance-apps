import { ListSystemSettingsUseCase } from "@/core/use-cases/system-setting/list-system-settings";
import { SupabaseSystemSettingRepository } from "@/infrastructure/repositories/supabase-system-setting-repository";
import { SectionHeader } from "@/components/section-header";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  deleteSystemSettingAction,
  upsertSystemSettingAction,
} from "./actions";

export default async function AdminSystemSettingsPage() {
  await requireRole(["admin"]);
  const supabase = await createSupabaseServerClient();
  const repository = new SupabaseSystemSettingRepository(supabase);
  const useCase = new ListSystemSettingsUseCase(repository);
  const settings = await useCase.execute();

  return (
    <section className="grid gap-4">
      <SectionHeader
        title="System Settings"
        description="Manage global finance application configuration."
      />
      <div className="rounded-lg border border-border p-4">
        <h3 className="font-medium">Add / Update Setting</h3>
        <form
          action={upsertSystemSettingAction}
          className="mt-3 grid gap-2 sm:grid-cols-4"
        >
          <input
            name="key_name"
            placeholder="key_name"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            required
          />
          <input
            name="value"
            placeholder="value"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm sm:col-span-2"
            required
          />
          <input
            name="setting_group"
            placeholder="group (optional)"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          />
          <button
            type="submit"
            className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground sm:col-start-4"
          >
            Save
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-border p-4">
        <h3 className="font-medium">Settings List</h3>
        {settings.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No active settings found.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">{setting.key_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {setting.value}
                  </p>
                  <p className="text-xs uppercase text-muted-foreground">
                    {setting.setting_group ?? "-"}
                  </p>
                </div>
                <form action={deleteSystemSettingAction}>
                  <input type="hidden" name="id" value={setting.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
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
