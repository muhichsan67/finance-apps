import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRole } from "@/core/domain/auth";
import type { ProfileUser, UsersRepository } from "@/core/domain/profile-user";

export class SupabaseUsersRepository implements UsersRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listActiveUsers(): Promise<ProfileUser[]> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("id,name,role,created_at,updated_at,deleted_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to load users: ${error.message}`);
    return (data ?? []) as ProfileUser[];
  }

  async updateUserRole(userId: string, role: AppRole): Promise<void> {
    const { error } = await this.supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);
    if (error) throw new Error(`Failed to update role: ${error.message}`);
  }

  async softDeleteUser(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("profiles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) throw new Error(`Failed to delete user: ${error.message}`);
  }
}
