import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="app-shell-gradient mx-auto flex min-h-dvh w-full max-w-lg items-center justify-center p-4 pb-12 pt-8">
      <section className="app-card w-full max-w-md p-6 sm:p-8">
        <h1 className="text-center text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in to manage transactions and admin tools.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
