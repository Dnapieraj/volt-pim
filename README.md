# Volt PIM

Product information manager for a Polish electrical wholesaler: SKU cards, photos, substitutes, Excel import/export, roles, and an audit log — persisted in MariaDB.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 6 · MariaDB · NextAuth 5 · Zod · Vitest

This is a portfolio-grade B2B catalog, not a todo list. Recruiters can log in with the demo accounts below and click through a real panel.

## Co umie

| Obszar | Szczegóły |
| --- | --- |
| Karty SKU | EAN, cena, VAT, stan, lokalizacja, parametry, atrybuty, zdjęcie, status szkic/aktywny/archiwum |
| Zamienniki | Podpowiedź SKU z katalogu, na karcie klikalny link |
| Lista | Szukanie, filtry, sortowanie i paginacja **w bazie** (nie w DOM) |
| Edycja zbiorcza | Checkboxy → status i/lub kategoria za jednym zapisem |
| Kategorie | Słownik: dodaj, zmień nazwę, usuń pustą |
| Excel / CSV | Import z raportem błędów per wiersz, eksport z tymi samymi filtrami |
| Role | Admin (w tym usuwanie kart i użytkownicy), edytor, podgląd |
| Rejestracja | Publiczne konto dostaje **podgląd**, nie edytora |
| Profil | Każdy zmienia swoje imię i hasło |
| Audyt | Karty, import, bulk, konta i kategorie — z filtrem |
| UI | Sidebar na desktopie, menu hamburger + karty na telefonie |

## Role

| Rola | Dostęp |
| --- | --- |
| Admin | Pełny katalog, usuwanie kart, użytkownicy |
| Edytor | Karty, zdjęcia, import, kategorie, edycja zbiorcza |
| Podgląd | Lista, karty, pulpit, historia — bez zapisu |

Konta po seedzie (hasło `haslo123`):

- `admin@voltpim.dev` — admin
- `edytor@voltpim.dev` — edytor
- `podglad@voltpim.dev` — podgląd

## Uruchomienie (lokalnie)

1. MariaDB / MySQL (np. XAMPP), baza `voltpim`.
2. `cp .env.example .env`
3. Migracje i dane demo:

```bash
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

```bash
npm test          # Vitest (query, role, walidacja kart)
npm run lint
npx tsc --noEmit
```

CI (GitHub Actions) odpala lint, `tsc` i testy przy każdym PR.

## Import / eksport

`/import` — edytor i admin. Wymagane: `sku`. Nowa karta potrzebuje `nazwy`. Wzór: `/wzor-import-volt-pim.csv`.

Eksport z listy produktów (`/api/export`) jako Excel albo CSV. Query string z filtrów listy jest respektowany, więc eksportujesz to, co widzisz.

Zdjęcia: do 5 na kartę, JPEG/PNG/WebP, max 1,5 MB, pliki w `public/uploads/products/` (gitignored). Pierwsze zdjęcie jest miniaturą na liście.

## Architektura (dla recenzji kodu)

- App Router, Server Actions, walidacja Zod po stronie serwera w każdej mutacji
- RBAC w middleware (`src/proxy.ts`) **i** w akcjach (nie tylko w UI)
- Prisma + migracje, seed z kilkoma kartami elektrotechnicznymi
- Paginacja 20 / stronę, indeksy `status` i `updatedAt`
- Testy jednostkowe czystej logiki (bez bazy) — łatwe do CI

To jest **PIM**, nie ERP: nie ma faktur, zamówień ani ruchów magazynowych. Stan na karcie to pole katalogowe.
