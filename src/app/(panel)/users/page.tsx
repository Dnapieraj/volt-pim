import { UserCreateForm } from "@/components/UserCreateForm";
import { UserEditCard } from "@/components/UserEditCard";
import { requireUserAdmin } from "@/lib/current-user";
import { getManagedUsers } from "@/lib/users";

export default async function UsersPage() {
  const current = await requireUserAdmin();
  const users = await getManagedUsers();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Użytkownicy</h1>
      <p className="mt-1 text-sm text-muted">
        Tu zmieniasz loginy (e-mail), hasła i role. Konta demo z seeda też
        tutaj: admin@voltpim.dev, edytor@voltpim.dev, podglad@voltpim.dev.
      </p>

      <div className="mt-6">
        <UserCreateForm key={users.length} />
      </div>

      <div className="mt-6 space-y-4">
        {users.map((user) => (
          <UserEditCard
            key={user.id}
            user={user}
            isSelf={user.id === current.id}
          />
        ))}
      </div>
    </div>
  );
}
