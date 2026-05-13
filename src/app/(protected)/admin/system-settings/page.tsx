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
      <div className="app-card p-5">
        <h3 className="font-semibold tracking-tight">Add / Update Setting</h3>
        <form
          action={upsertSystemSettingAction}
          className="mt-3 grid gap-2 sm:grid-cols-4"
        >
          <input
            name="key_name"
            placeholder="key_name"
            className="h-11 rounded-2xl border border-border/80 bg-card/80 px-3 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/25"
            required
          />
          <input
            name="value"
            placeholder="value"
            className="h-11 rounded-2xl border border-border/80 bg-card/80 px-3 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/25 sm:col-span-2"
            required
          />
          <input
            name="setting_group"
            placeholder="group (optional)"
            className="h-11 rounded-2xl border border-border/80 bg-card/80 px-3 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
          <button
            type="submit"
            className="h-11 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:brightness-105 hover:shadow-md active:scale-[0.98] sm:col-start-4"
          >
            Save
          </button>
        </form>
      </div>

      <div className="app-card p-5">
        <h3 className="font-semibold tracking-tight">Settings List</h3>
        {settings.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No active settings found.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/25 p-3"
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
                    className="rounded-xl border border-border/80 px-3 py-2 text-sm font-medium transition-all duration-200 hover:border-primary/35 hover:bg-primary/10 active:scale-[0.98]"
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
