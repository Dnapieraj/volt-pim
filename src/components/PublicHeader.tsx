import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
      <Link href="/" className="min-w-0">
        <div className="text-[11px] tracking-[0.18em] text-copper uppercase">
          Hurtownia elektrotechniczna
        </div>
        <div className="text-xl font-semibold">Volt PIM</div>
      </Link>
      <nav className="flex shrink-0 items-center gap-1 text-sm sm:gap-3">
        <Link
          href="/register"
          className="hidden min-h-11 items-center px-3 py-2 text-muted hover:text-ink sm:inline-flex"
        >
          Rejestracja
        </Link>
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 py-2 font-medium text-on-dark hover:bg-copper-dark"
        >
          Logowanie
        </Link>
      </nav>
    </header>
  );
}
