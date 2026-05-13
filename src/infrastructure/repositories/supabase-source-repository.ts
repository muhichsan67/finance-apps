import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateSourceInput,
  Source,
  SourceRepository,
} from "@/core/domain/source";

export class SupabaseSourceRepository implements SourceRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listActiveSources(): Promise<Source[]> {
    const { data, error } = await this.supabase
      .from("sources")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to load sources: ${error.message}`);
    return (data ?? []) as Source[];
  }

  async createSource(input: CreateSourceInput): Promise<void> {
    const { error } = await this.supabase.from("sources").insert({
      user_id: null,
      name: input.name,
      type: input.type,
      created_by: input.actorUserId,
      updated_by: input.actorUserId,
    });
    if (error) throw new Error(`Failed to create source: ${error.message}`);
  }

  async softDeleteSource(id: number, actorUserId: string): Promise<void> {
    const { error } = await this.supabase
      .from("sources")
      .update({ deleted_at: new Date().toISOString(), updated_by: actorUserId })
      .eq("id", id);
    if (error) throw new Error(`Failed to delete source: ${error.message}`);
  }
}
