# Volt PIM

Product catalog for wholesale — SKU cards, substitutes, Excel import.

**Status:** UI + MariaDB. Product list, cards, and dashboard stats come from the database. Auth and write API come next.

## Stack

- Next.js 16, TypeScript, Tailwind CSS
- Prisma 6 + MariaDB (XAMPP)

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

## Screens

- Landing
- Login / register (UI only for now)
- Dashboard with live counts from MariaDB
- Product list (search + filters) from the database
- Product card and edit form
- Excel import placeholder
- Change history placeholder
