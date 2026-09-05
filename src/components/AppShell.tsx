"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/auth-actions";

type UserRole = "ADMIN" | "EDITOR" | "VIEWER";

const nav = [
  { href: "/dashboard", label: "Pulpit" },
  { href: "/products", label: "Produkty" },
  { href: "/products/new", label: "Nowa karta" },
  { href: "/import", label: "Import Excel" },
  { href: "/audit", label: "Historia zmian" },
];

const roleLabel: Record<UserRole, string> = {
  ADMIN: "admin",
  EDITOR: "edytor",
  VIEWER: "podgląd",
};

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; role: UserRole };
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col bg-sidebar text-on-dark">
        <Link href="/" className="border-b border-on-dark/10 px-5 py-5">
          <div className="text-[11px] tracking-[0.18em] text-copper uppercase">
            Hurtownia
          </div>
          <div className="mt-1 text-lg font-semibold">Volt PIM</div>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === "/products" &&
                pathname.startsWith("/products") &&
                pathname !== "/products/new");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm ${
                  active
                    ? "bg-on-dark/10 text-on-dark"
                    : "text-on-dark/70 hover:bg-on-dark/5 hover:text-on-dark"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-on-dark/10 px-5 py-4 text-xs text-on-dark/50">
          Zalogowany jako
          <div className="mt-1 text-sm text-on-dark/90">
            {user.name} · {roleLabel[user.role]}
          </div>
          <form action={logoutAction} className="mt-3">
            <button type="submit" className="text-sm text-copper">
              Wyloguj
            </button>
          </form>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-card px-8 py-4">
          <div className="text-sm text-muted">Katalog produktowy</div>
          <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
            MariaDB · XAMPP
          </span>
        </header>
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
