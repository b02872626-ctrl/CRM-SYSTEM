"use client";

import { useTransition } from "react";
import { updateUserRoleAction } from "../actions";
import { ProfileRole } from "@/types/database";
import { cn } from "@/lib/utils";

type UserRoleSelectProps = {
  userId: string;
  currentRole: ProfileRole;
  disabled?: boolean;
};

export function UserRoleSelect({ userId, currentRole, disabled }: UserRoleSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as ProfileRole;
    startTransition(async () => {
      try {
        await updateUserRoleAction(userId, newRole);
      } catch (error) {
        console.error("Failed to update user role:", error);
        alert("Failed to update user role.");
      }
    });
  };

  return (
    <div className="relative inline-block w-full max-w-[120px]">
      <select
        value={currentRole}
        onChange={handleRoleChange}
        disabled={disabled || isPending}
        className={cn(
          "w-full appearance-none rounded-md border border-white/10 bg-[#2a2a2a] px-2 py-1.5 text-xs font-medium text-white/90 shadow-sm focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-[#333333]",
          isPending && "animate-pulse"
        )}
      >
        <option value="admin" className="bg-[#1e1e1e] text-white">Admin</option>
        <option value="sales" className="bg-[#1e1e1e] text-white">Sales</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/30">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}
