"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/auth-actions";
import {
  canImportCatalog,
  canManageUsers,
  canWriteProducts,
  roleLabel,
  type AppRole,
} from "@/lib/permissions";

const nav = [
  { href: "/dashboard", label: "Pulpit" },
  { href: "/products", label: "Produkty" },
  { href: "/products/new", label: "Nowa karta", write: true },
  { href: "/categories", label: "Kategorie" },
  { href: "/import", label: "Import Excel", write: true },
  { href: "/audit", label: "Historia zmian" },
  { href: "/users", label: "Użytkownicy", admin: true },
  { href: "/account", label: "Moje konto" },
];

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; role: AppRole };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const visibleNav = nav.filter((item) => {
    if (item.admin) return canManageUsers(user.role);
    if (item.href === "/import") return canImportCatalog(user.role);
    if (item.write) return canWriteProducts(user.role);
    return true;
  });

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function isActive(href: string) {
    if (href === "/products") {
      return (
        pathname.startsWith("/products") && pathname !== "/products/new"
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const links = (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Panel">
      {visibleNav.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`rounded-md px-3 py-2.5 text-sm min-h-11 flex items-center ${
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
  );

  const brand = (
    <Link href="/" className="border-b border-on-dark/10 px-5 py-5 block" onClick={() => setOpen(false)}>
      <div className="text-[11px] tracking-[0.18em] text-copper uppercase">
        Hurtownia
      </div>
      <div className="mt-1 text-lg font-semibold">Volt PIM</div>
    </Link>
  );

  const footer = (
    <div className="border-t border-on-dark/10 px-5 py-4 text-xs text-on-dark/50">
      Zalogowany jako
      <div className="mt-1 text-sm text-on-dark/90">
        {user.name} · {roleLabel[user.role]}
      </div>
      <form action={logoutAction} className="mt-3">
        <button type="submit" className="text-sm text-copper min-h-11">
          Wyloguj
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden md:flex w-56 shrink-0 flex-col bg-sidebar text-on-dark">
        {brand}
        {links}
        {footer}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50"
            aria-label="Zamknij menu"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col bg-sidebar text-on-dark shadow-xl">
            {brand}
            {links}
            {footer}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-card px-4 py-3 md:px-8 md:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line md:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Zamknij menu" : "Otwórz menu"}
              onClick={() => setOpen((value) => !value)}
            >
              <span className="sr-only">Menu</span>
              <span className="flex flex-col gap-1.5" aria-hidden>
                <span className="block h-0.5 w-5 bg-ink" />
                <span className="block h-0.5 w-5 bg-ink" />
                <span className="block h-0.5 w-5 bg-ink" />
              </span>
            </button>
            <div className="min-w-0 text-sm text-muted">
              <span className="md:hidden font-medium text-ink">Volt PIM</span>
              <span className="hidden md:inline">
                {user.role === "VIEWER"
                  ? "Katalog produktowy · tylko podgląd"
                  : "Katalog produktowy"}
              </span>
            </div>
          </div>
          <span className="hidden sm:inline rounded-full border border-line px-3 py-1 text-xs text-muted">
            {roleLabel[user.role]}
          </span>
        </header>
        <main className="flex-1 px-4 py-5 md:px-8 md:py-6">{children}</main>
      </div>
    </div>
  );
}
