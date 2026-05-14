import type { AppRole } from "@/core/domain/auth";

export interface ProfileUser {
  id: string;
  name: string | null;
  role: AppRole;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface UsersRepository {
  listActiveUsers(): Promise<ProfileUser[]>;
  getActiveUserById(userId: string): Promise<ProfileUser | null>;
  updateUserRole(userId: string, role: AppRole): Promise<void>;
  updateUserProfile(
    userId: string,
    input: { name?: string | null; role?: AppRole }
  ): Promise<void>;
  softDeleteUser(userId: string): Promise<void>;
}
