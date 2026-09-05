import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-card p-8">
        <p className="text-[11px] tracking-[0.18em] text-copper uppercase">
          Volt PIM
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Rejestracja</h1>
        <p className="mt-2 text-sm text-muted">
          Nowe konto dostaje rolę edytora. Hasło min. 8 znaków.
        </p>
        <RegisterForm />
      </div>
    </div>
  );
}
