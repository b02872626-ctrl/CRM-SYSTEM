import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getUsers } from "@/features/users/queries";
import { UsersTable } from "@/features/users/components/users-table";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/ui/table-skeleton";

async function UsersTableContent({ currentUserId }: { currentUserId: string }) {
  const users = await getUsers();
  return <UsersTable users={users as any} currentUserId={currentUserId} />;
}

export default async function UsersPage() {
  const currentProfile = await getCurrentProfile();

  if (!currentProfile || (currentProfile.role as string) !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-white/50">Manage your team members and their access levels.</p>
        </div>
      </header>

      <Suspense fallback={<TableSkeleton rows={5} />}>
        <UsersTableContent currentUserId={currentProfile.id} />
      </Suspense>
    </div>
  );
}
