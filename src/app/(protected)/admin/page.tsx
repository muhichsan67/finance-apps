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
    <section className="grid gap-4 sm:grid-cols-2">
      {adminMenus.map((menu) => (
        <article
          key={menu.title}
          className="app-card flex flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <h2 className="text-lg font-semibold tracking-tight">{menu.title}</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{menu.description}</p>
          <Link
            href={menu.href}
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:brightness-105 hover:shadow-md active:scale-[0.98]"
          >
            Open {menu.title}
          </Link>
        </article>
      ))}
    </section>
  );
}
