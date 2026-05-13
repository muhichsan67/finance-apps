import "server-only";

import { redirect } from "next/navigation";
import type { AppRole } from "@/core/domain/auth";
import { getCurrentUserRole } from "@/lib/auth/get-current-user-role";

export async function requireRole(allowed: AppRole[]) {
  const session = await getCurrentUserRole();
  if (!allowed.includes(session.role)) {
    redirect(session.role === "admin" ? "/admin" : "/transactions");
  }
  return session;
}
