import Link from "next/link";
import { Button } from "@/components/Button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-card p-8">
        <p className="text-[11px] tracking-[0.18em] text-copper uppercase">
          Volt PIM
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Logowanie</h1>
        <p className="mt-2 text-sm text-muted">
          Na razie przycisk tylko otwiera panel. Prawdziwe hasła później.
        </p>
        <form className="mt-6 flex flex-col gap-4" action="/dashboard">
          <label className="block text-sm">
            E-mail
            <input
              type="email"
              defaultValue="admin@voltpim.dev"
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Hasło
            <input
              type="password"
              defaultValue="haslo"
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2"
            />
          </label>
          <Button type="submit" variant="dark">
            Wejdź do panelu
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          Nie masz konta?{" "}
          <Link href="/register" className="text-copper">
            Rejestracja
          </Link>
        </p>
      </div>
    </div>
  );
}
