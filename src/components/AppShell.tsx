"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Pulpit" },
  { href: "/products", label: "Produkty" },
  { href: "/products/new", label: "Nowa karta" },
  { href: "/import", label: "Import Excel" },
  { href: "/audit", label: "Historia zmian" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col bg-sidebar text-[#f5f0e8]">
        <Link href="/" className="border-b border-white/10 px-5 py-5">
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
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-5 py-4 text-xs text-white/50">
          Zalogowany jako
          <div className="mt-1 text-sm text-white/90">Daniel · admin</div>
          <Link href="/login" className="mt-3 inline-block text-copper">
            Wyloguj
          </Link>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-card px-8 py-4">
          <div className="text-sm text-muted">Katalog produktowy · wersja wyglądu</div>
          <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
            Bez bazy — dane przykładowe
          </span>
        </header>
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
