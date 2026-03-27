import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getUsers } from "@/features/users/queries";
import { UsersTable } from "@/features/users/components/users-table";

export default async function UsersPage() {
  const currentProfile = (await getCurrentProfile()) as { id: string; role: string | null } | null;

  if (!currentProfile || currentProfile.role !== "admin") {
    redirect("/dashboard");
  }

  const users = await getUsers();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-white/50">Manage your team members and their access levels.</p>
        </div>
      </header>

      <UsersTable users={users as any} currentUserId={currentProfile.id} />
    </div>
  );
}
