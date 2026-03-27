import { ProfileRole } from "@/types/database";
import { UserRoleSelect } from "./user-role-select";

type User = {
  id: string;
  full_name: string;
  email: string;
  role: ProfileRole;
};

type UsersTableProps = {
  users: User[];
  currentUserId: string;
};

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/5 bg-[#1e1e1e] shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white/30">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="group transition-colors hover:bg-white/[0.02]">
                <td className="px-6 py-4">
                  <div className="font-semibold text-white/90">{user.full_name}</div>
                </td>
                <td className="px-6 py-4 text-white/50">{user.email}</td>
                <td className="px-6 py-4">
                  <UserRoleSelect 
                    userId={user.id} 
                    currentRole={user.role} 
                    disabled={user.id === currentUserId}
                  />
                  {user.id === currentUserId && (
                    <span className="ml-2 text-[10px] text-white/20 italic">(You)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
