import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseProfileRepository } from "@/infrastructure/repositories/supabase-profile-repository";
import type { AppRole } from "@/core/domain/auth";

export async function getCurrentUserRole(): Promise<{
  userId: string;
  role: AppRole;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Unauthorized");
  }

  const repository = new SupabaseProfileRepository(supabase);
  const role = await repository.getUserRole(user.id);
  return { userId: user.id, role };
}
