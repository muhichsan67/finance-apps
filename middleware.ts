import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "./src/lib/supabase/middleware";

export function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    /*
     * Exclude static files and images.
     * Add protected routes later, e.g. "/(app|dashboard)/:path*"
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

