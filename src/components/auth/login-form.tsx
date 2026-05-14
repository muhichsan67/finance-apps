"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.email("Invalid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault();

        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message ?? "Invalid credentials.");
          return;
        }

        startTransition(() => {
          void (async () => {
            try {
              const supabase = getSupabaseBrowserClient();
              const { error: signInError } = await supabase.auth.signInWithPassword({
                email: parsed.data.email,
                password: parsed.data.password,
              });

              if (signInError) {
                toast.error(signInError.message);
                return;
              }

              toast.success("Signed in.");
              router.replace("/dashboard");
              router.refresh();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Sign in failed.");
            }
          })();
        });
      }}
    >
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-12 rounded-2xl border border-border/80 bg-card/80 px-4 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/30"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="h-12 rounded-2xl border border-border/80 bg-card/80 px-4 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/30"
      />
      <Button type="submit" disabled={pending} className="w-full gap-2">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {pending ? "Signing in…" : "Login"}
      </Button>
    </form>
  );
}
