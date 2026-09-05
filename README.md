# Volt PIM

Product catalog for wholesale — SKU cards, substitutes, Excel import.

**Status:** UI + MariaDB. Catalog CRUD, login/register, roles, user admin, Excel/CSV import, and change history persist to the database.

## Stack

- Next.js 16, TypeScript, Tailwind CSS
- Prisma 6 + MariaDB (XAMPP)
- NextAuth 5 (credentials, hashed passwords)

## Roles

| Role | Access |
| --- | --- |
| Admin | Full catalog, including delete. Manages users, logins, and roles in **Użytkownicy**. |
| Editor | Create and edit products, import |
| Viewer | Read-only list, cards, dashboard, audit |

Admins edit accounts in the panel at `/users` (name, email/login, password, role). New registrations still get the editor role.

Demo accounts after seed (password `haslo123`) — change them in the app if you want:

- `admin@voltpim.dev` — admin
- `edytor@voltpim.dev` — editor
- `podglad@voltpim.dev` — viewer

## Database (local)

1. Start MySQL in XAMPP.
2. Create database `voltpim` if it does not exist.
3. Copy `.env.example` to `.env`.
4. Run:

```bash
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npx prisma studio` opens a table browser.

`npx prisma db seed` resets catalog data and upserts the three demo users.

## Excel / CSV import

Editors and admins upload a file at `/import`. New SKUs are created, existing SKUs are updated. Invalid rows are skipped and listed in an error report. Logged-in users can download the current catalog from the product list (`/api/export`) as Excel or CSV — the columns match the import template.

Required column: `sku`. New cards also need `nazwa`. Download the empty template from the import page (`/wzor-import-volt-pim.csv`).

## Screens

- Landing
- Login / register (NextAuth, accounts in MariaDB)
- Dashboard with live counts from MariaDB
- Product list (search + filters) from the database
- Product card and edit form (edit hidden for viewers)
- Excel/CSV import with a per-row error report (editors and admins)
- Excel/CSV export of the live catalog (any logged-in role)
- Change history from MariaDB (create, edit, delete, import)
- Users (admin): edit logins, passwords, and roles
