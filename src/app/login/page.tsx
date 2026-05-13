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
    <main className="mx-auto flex min-h-dvh w-full max-w-md items-center p-4">
      <section className="w-full rounded-lg border border-border p-4">
        <h1 className="text-lg font-semibold">Login</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to access admin or transaction features.
        </p>
        <div className="mt-4">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
