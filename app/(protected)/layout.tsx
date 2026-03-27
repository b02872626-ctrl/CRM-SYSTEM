import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentProfile } from "@/lib/auth";

function hasAuthCookies(cookieEntries: Array<{ name: string }>) {
  return cookieEntries.some(
    ({ name }) => name.startsWith("sb-") && name.includes("-auth-token")
  );
}

export default async function ProtectedLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  if (!hasAuthCookies(cookieStore.getAll())) {
    redirect("/login");
  }

  const profile = (await getCurrentProfile()) as { email: string; role: string | null; full_name: string | null } | null;

  return (
    <AppShell 
      userEmail={profile?.email} 
      userRole={profile?.role}
      userName={profile?.full_name}
    >
      {children}
    </AppShell>
  );
}
