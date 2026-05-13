import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserRole } from "@/lib/auth/get-current-user-role";

const adminMenus = [
  {
    title: "Users",
    description: "Manage user accounts and role assignments.",
    href: "/admin/users",
  },
  {
    title: "Categories",
    description: "Manage transaction categories.",
    href: "/admin/categories",
  },
  {
    title: "Sources",
    description: "Manage transaction source accounts.",
    href: "/admin/sources",
  },
  {
    title: "System Settings",
    description: "Manage global app configuration.",
    href: "/admin/system-settings",
  },
];

export default async function AdminPage() {
  const { role } = await getCurrentUserRole();
  if (role !== "admin") {
    redirect("/transactions");
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {adminMenus.map((menu) => (
        <article key={menu.title} className="rounded-lg border border-border p-4">
          <h2 className="font-semibold">{menu.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{menu.description}</p>
          <Link
            href={menu.href}
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Open {menu.title}
          </Link>
        </article>
      ))}
    </section>
  );
}
