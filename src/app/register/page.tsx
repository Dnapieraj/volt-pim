import { RegisterForm } from "@/components/RegisterForm";
import { PublicHeader } from "@/components/PublicHeader";

export const metadata = { title: "Rejestracja" };

export default function RegisterPage() {
  return (
    <div className="min-h-dvh">
      <PublicHeader />
      <div className="flex justify-center px-4 pb-16">
        <div className="w-full max-w-sm rounded-xl border border-line bg-card p-6 sm:p-8">
          <p className="text-[11px] tracking-[0.18em] text-copper uppercase">
            Volt PIM
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Rejestracja</h1>
          <p className="mt-2 text-sm text-muted">
            Nowe konto dostaje rolę <span className="text-ink">podgląd</span> —
            bez prawa edycji katalogu. Hasło min. 8 znaków. Edytora nadaje
            administrator.
          </p>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
