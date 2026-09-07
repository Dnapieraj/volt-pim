import { LoginForm } from "@/components/LoginForm";
import { PublicHeader } from "@/components/PublicHeader";

export const metadata = { title: "Logowanie" };

export default function LoginPage() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <div className="flex justify-center px-4 pb-16">
        <div className="w-full max-w-sm rounded-xl border border-line bg-card p-6 sm:p-8">
          <p className="text-[11px] tracking-[0.18em] text-copper uppercase">
            Volt PIM
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Logowanie</h1>
          <p className="mt-2 text-sm text-muted">
            Konta demo (hasło:{" "}
            <span className="font-medium text-ink">haslo123</span>
            ).
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li>
              <span className="font-medium text-ink">admin@voltpim.dev</span> —
              admin
            </li>
            <li>
              <span className="font-medium text-ink">edytor@voltpim.dev</span> —
              edytor
            </li>
            <li>
              <span className="font-medium text-ink">podglad@voltpim.dev</span>{" "}
              — podgląd
            </li>
          </ul>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
