import { signOutAction } from "@/features/auth/actions";

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="crm-secondary-button h-8 w-full justify-center text-xs"
      >
        Logout
      </button>
    </form>
  );
}
