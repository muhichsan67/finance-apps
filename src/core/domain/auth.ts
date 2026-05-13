export type AppRole = "admin" | "user";

export interface UserProfile {
  id: string;
  role: AppRole;
}
