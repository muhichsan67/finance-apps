import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/auth/get-current-user-role";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AppNav } from "@/components/app-nav";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  try {
    const { role } = await getCurrentUserRole();

    return (
      <main className="mx-auto min-h-dvh w-full max-w-6xl p-4">
        <header className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold">Finance Application</h1>
            <p className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium">{role}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </header>
        <div className="mt-6">
          <AppNav role={role} />
          {children}
        </div>
      </main>
    );
  } catch {
    redirect("/login");
  }
}
