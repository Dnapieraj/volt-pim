# Volt PIM

System zarządzania informacjami o produktach (PIM) dla hurtowni elektrotechnicznej: karty SKU, zdjęcia, zamienniki, import/eksport Excela, role użytkowników i log audytu — wszystko na Next.js 16 z bazą MySQL/MariaDB.

[![CI](https://github.com/Dnapieraj/volt-pim/actions/workflows/ci.yml/badge.svg)](https://github.com/Dnapieraj/volt-pim/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)

**🔗 Demo na żywo:** [volt-pim-production.up.railway.app](https://volt-pim-production.up.railway.app)
Zaloguj się kontem demo: `admin@voltpim.dev` / `haslo123` (pozostałe konta — patrz sekcja [Role i konta demo](#role-i-konta-demo)).

## Zrzuty ekranu

<!--
  Podmień poniższe placeholdery na realne zrzuty ekranu, np.:
  ![Lista produktów](docs/screenshots/products.png)
  ![Karta produktu](docs/screenshots/product-detail.png)
  ![Panel na telefonie](docs/screenshots/mobile.png)
-->

| Panel produktów | Karta produktu | Widok mobilny |
| --- | --- | --- |
| _dodaj screenshot_ | _dodaj screenshot_ | _dodaj screenshot_ |

## Funkcje

| Obszar | Szczegóły |
| --- | --- |
| Karty SKU | EAN, cena, VAT, stan magazynowy, lokalizacja, parametry, atrybuty, galeria do 5 zdjęć, status szkic/aktywny/archiwum |
| Zamienniki | Podpowiedzi SKU z katalogu, klikalny link do karty zamiennika |
| Lista produktów | Wyszukiwanie, filtry, sortowanie i paginacja realizowane po stronie bazy danych (nie w przeglądarce) |
| Edycja zbiorcza | Zaznacz kilka kart checkboxami i zmień status/kategorię jednym zapisem |
| Kategorie | Słownik kategorii: dodaj, zmień nazwę, usuń (jeśli pusta) |
| Import / eksport | Import z Excela/CSV z raportem błędów per wiersz; eksport respektujący aktualne filtry listy |
| Role (RBAC) | Admin (pełny dostęp + użytkownicy), Edytor (karty, zdjęcia, import), Podgląd (tylko odczyt) |
| Konto | Każdy użytkownik zmienia swoje imię i hasło |
| Audyt | Log zmian: karty, import, edycja zbiorcza, konta, kategorie — z filtrowaniem |
| Duplikowanie | Kopiowanie istniejącej karty produktu jako punkt startowy dla nowej |
| UI | Sidebar na desktopie, menu hamburger + karty produktów na telefonie, pełna responsywność |

## Stack technologiczny

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **TypeScript** — strict mode
- **Tailwind CSS v4**
- **Prisma 6** + **MySQL / MariaDB**
- **NextAuth 5** (provider Credentials, sesje JWT, RBAC w middleware)
- **Zod** — walidacja danych wejściowych po stronie serwera
- **Vitest** — testy jednostkowe logiki (bez zależności od bazy)
- **GitHub Actions** — CI: lint, `tsc --noEmit`, testy przy każdym pushu/PR

## Role i konta demo

| Rola | Dostęp |
| --- | --- |
| Admin | Pełny katalog, usuwanie kart, zarządzanie użytkownikami |
| Edytor | Karty, zdjęcia, import, kategorie, edycja zbiorcza |
| Podgląd | Lista, karty, pulpit, historia — bez możliwości zapisu |

Po seedzie danych demo (hasło dla wszystkich: `haslo123`):

- `admin@voltpim.dev` — Admin
- `edytor@voltpim.dev` — Edytor
- `podglad@voltpim.dev` — Podgląd

Publiczna rejestracja zawsze nadaje rolę **Podgląd** — pozostałe role może przyznać tylko Admin.

## Uruchomienie lokalne

Wymagania: Node.js 20+, MySQL lub MariaDB (np. XAMPP).

```bash
git clone https://github.com/Dnapieraj/volt-pim.git
cd volt-pim
npm install
cp .env.example .env      # ustaw DATABASE_URL, AUTH_SECRET
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Aplikacja wystartuje pod [http://localhost:3000](http://localhost:3000).

Po każdym `git pull` z nowymi migracjami:

```bash
npx prisma generate
npx prisma migrate deploy
```

### Testy i jakość kodu

```bash
npm test           # Vitest — logika zapytań, uprawnień i walidacji
npm run lint        # ESLint
npx tsc --noEmit    # sprawdzenie typów
npm run build       # pełny build produkcyjny
```

## Wdrożenie (1 link online)

Najprostsza droga to **Railway** — jedna platforma hostuje jednocześnie aplikację i bazę MySQL, więc dostajesz jeden publiczny adres bez zakładania osobnego konta do bazy danych.

1. Załóż darmowe konto na [railway.app](https://railway.app) (logowanie przez GitHub).
2. **New Project → Deploy from GitHub repo** i wybierz to repozytorium.
3. W tym samym projekcie kliknij **+ New → Database → MySQL** — Railway sam doda zmienną `DATABASE_URL` do usługi z aplikacją (w ustawieniach aplikacji podepnij zmienną z bazy pod nazwą `DATABASE_URL`).
4. W zmiennych środowiskowych aplikacji ustaw dodatkowo:
   - `AUTH_SECRET` — dowolny losowy ciąg znaków (np. `openssl rand -base64 32`)
   - `AUTH_URL` — publiczny adres wygenerowany przez Railway (np. `https://twoja-appka.up.railway.app`)
5. Wdróż. Komenda startowa (`npm start`) sama uruchamia `prisma migrate deploy` (tworzy schemat) i bezpieczny seed (wgrywa konta i produkty demo **tylko jeśli baza jest pusta** — kolejne restarty/redeploye niczego nie nadpisują). Nie musisz nic robić ręcznie.

Po tych krokach masz jeden publiczny link, pod którym działa cała aplikacja razem z bazą danych i danymi demo — od razu gotowe do pokazania.

> Alternatywa: Vercel do hostingu aplikacji + zewnętrzna baza MySQL (np. Railway, Aiven) — wymaga wtedy dwóch kont zamiast jednego, ale też działa bez zmian w kodzie (zmienna `trustHost: true` w konfiguracji NextAuth jest już ustawiona pod dowolną domenę produkcyjną).

## Import / eksport

`/import` — dostępne dla Edytora i Admina. Wymagana kolumna: `sku`. Nowa karta wymaga dodatkowo `nazwy`. Wzór pliku: `/wzor-import-volt-pim.csv`.

Eksport z listy produktów (`/api/export`) do Excela lub CSV — query string z aktualnych filtrów listy jest respektowany, więc eksportujesz dokładnie to, co widzisz na ekranie.

Zdjęcia: do 5 na kartę, formaty JPEG/PNG/WebP, maks. 1,5 MB każde. Pliki trzymane są w `public/uploads/products/` (poza repozytorium git). Pierwsze zdjęcie w galerii jest miniaturą na liście produktów.

## Architektura

- **App Router + Server Actions** — mutacje danych bez osobnego warstwy API REST
- **Walidacja Zod** po stronie serwera w każdej akcji zapisu (nie tylko w formularzu)
- **RBAC** wymuszany dwuwarstwowo: w middleware (`src/proxy.ts`) i wewnątrz akcji serwerowych — UI nie jest jedyną linią obrony
- **Prisma + migracje** — pełna historia zmian schematu w `prisma/migrations`
- **Indeksy bazodanowe** (`status`, `updatedAt`) pod paginację i sortowanie na dużym katalogu
- **Testy jednostkowe** czystej logiki (parsowanie zapytań, uprawnienia, walidacja) — szybkie, bez zależności od bazy, uruchamiane w CI

To jest **PIM**, nie ERP: aplikacja nie obsługuje faktur, zamówień ani ruchów magazynowych — pole „stan” to atrybut katalogowy karty, nie księgowość magazynowa.

## Licencja

Projekt portfolio — do dowolnego wykorzystania jako materiał demonstracyjny.
