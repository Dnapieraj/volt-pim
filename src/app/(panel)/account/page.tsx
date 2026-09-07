import { AccountForm } from "@/components/AccountForm";
import { requireSessionUser } from "@/lib/current-user";

export const metadata = { title: "Moje konto" };

export default async function AccountPage() {
  const user = await requireSessionUser();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Moje konto</h1>
      <p className="mt-1 text-sm text-muted">
        Tu zmienisz imię i hasło bez czekania na administratora.
      </p>
      <AccountForm name={user.name} email={user.email} role={user.role} />
    </div>
  );
}
