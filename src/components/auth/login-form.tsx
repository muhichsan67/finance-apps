"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");

        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "Invalid credentials.");
          return;
        }

        setLoading(true);
        try {
          const supabase = getSupabaseBrowserClient();
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: parsed.data.email,
            password: parsed.data.password,
          });

          if (signInError) {
            setError(signInError.message);
            return;
          }

          router.replace("/dashboard");
          router.refresh();
        } finally {
          setLoading(false);
        }
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
      <Button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
