# Volt PIM

Product catalog for wholesale — SKU cards, substitutes, Excel import.

**Status:** UI + MariaDB. Catalog CRUD, login/register, and roles persist to the database. Excel import and change history come next.

## Stack

- Next.js 16, TypeScript, Tailwind CSS
- Prisma 6 + MariaDB (XAMPP)
- NextAuth 5 (credentials, hashed passwords)

## Roles

| Role | Access |
| --- | --- |
| Admin | Full catalog, including delete |
| Editor | Create and edit products, import |
| Viewer | Read-only list, cards, dashboard, audit |

New registrations get the editor role. Demo accounts after seed (password `haslo123`):

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

## Screens

- Landing
- Login / register (NextAuth, accounts in MariaDB)
- Dashboard with live counts from MariaDB
- Product list (search + filters) from the database
- Product card and edit form (edit hidden for viewers)
- Excel import placeholder (editors and admins)
- Change history placeholder
