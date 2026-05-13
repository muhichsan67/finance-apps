import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  SystemSetting,
  SystemSettingRepository,
  UpsertSystemSettingInput,
} from "@/core/domain/system-setting";

export class SupabaseSystemSettingRepository implements SystemSettingRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listActiveSettings(): Promise<SystemSetting[]> {
    const { data, error } = await this.supabase
      .from("system_settings")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to load settings: ${error.message}`);
    return (data ?? []) as SystemSetting[];
  }

  async upsertSetting(input: UpsertSystemSettingInput): Promise<void> {
    const { data: existing, error: getError } = await this.supabase
      .from("system_settings")
      .select("id")
      .eq("key_name", input.key_name)
      .maybeSingle();
    if (getError) throw new Error(`Failed to check setting: ${getError.message}`);

    if (existing?.id) {
      const { error } = await this.supabase
        .from("system_settings")
        .update({
          value: input.value,
          setting_group: input.setting_group ?? null,
          deleted_at: null,
          updated_by: input.actorUserId,
        })
        .eq("id", existing.id);
      if (error) throw new Error(`Failed to update setting: ${error.message}`);
      return;
    }

    const { error } = await this.supabase.from("system_settings").insert({
      key_name: input.key_name,
      value: input.value,
      setting_group: input.setting_group ?? null,
      created_by: input.actorUserId,
      updated_by: input.actorUserId,
    });
    if (error) throw new Error(`Failed to create setting: ${error.message}`);
  }

  async softDeleteSetting(id: number, actorUserId: string): Promise<void> {
    const { error } = await this.supabase
      .from("system_settings")
      .update({ deleted_at: new Date().toISOString(), updated_by: actorUserId })
      .eq("id", id);
    if (error) throw new Error(`Failed to delete setting: ${error.message}`);
  }
}
