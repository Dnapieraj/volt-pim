import Link from "next/link";

export function Pagination({
  page,
  pageCount,
  hrefForPage,
}: {
  page: number;
  pageCount: number;
  hrefForPage: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < pageCount ? page + 1 : null;

  return (
    <nav
      className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"
      aria-label="Paginacja"
    >
      <p className="text-muted">
        Strona {page} z {pageCount}
      </p>
      <div className="flex gap-2">
        {prev ? (
          <Link
            href={hrefForPage(prev)}
            className="inline-flex min-h-11 items-center rounded-md border border-line bg-card px-4 py-2 hover:border-ink"
          >
            Poprzednia
          </Link>
        ) : (
          <span className="inline-flex min-h-11 items-center rounded-md border border-line px-4 py-2 text-muted">
            Poprzednia
          </span>
        )}
        {next ? (
          <Link
            href={hrefForPage(next)}
            className="inline-flex min-h-11 items-center rounded-md border border-line bg-card px-4 py-2 hover:border-ink"
          >
            Następna
          </Link>
        ) : (
          <span className="inline-flex min-h-11 items-center rounded-md border border-line px-4 py-2 text-muted">
            Następna
          </span>
        )}
      </div>
    </nav>
  );
}
