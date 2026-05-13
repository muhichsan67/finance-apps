import { redirect } from "next/navigation";
import type { AppRole } from "@/core/domain/auth";
import { getCurrentUserRole } from "@/lib/auth/get-current-user-role";
import { AppShell } from "@/components/app-shell";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let role: AppRole;
  try {
    const result = await getCurrentUserRole();
    role = result.role;
  } catch {
    redirect("/login");
  }

  return <AppShell role={role}>{children}</AppShell>;
}
