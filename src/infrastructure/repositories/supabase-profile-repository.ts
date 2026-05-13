import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRole } from "@/core/domain/auth";

export class SupabaseProfileRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getUserRole(userId: string): Promise<AppRole> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(`Failed to load user role: ${error.message}`);
    }

    if (!data?.role || (data.role !== "admin" && data.role !== "user")) {
      throw new Error("Invalid role in profile. Expected 'admin' or 'user'.");
    }

    return data.role;
  }
}
