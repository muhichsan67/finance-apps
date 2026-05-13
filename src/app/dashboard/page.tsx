import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/auth/get-current-user-role";

export default async function DashboardRedirectPage() {
  let role;
  try {
    role = await getCurrentUserRole();
    console.log("role", role);
  } catch (error) {
    console.log("error", error);
    // redirect("/login");
  }
  redirect(role?.role === "admin" ? "/admin" : "/transactions");
}
