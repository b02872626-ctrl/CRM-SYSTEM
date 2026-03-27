import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentProfile } from "@/lib/auth";

export default async function ProtectedLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <AppShell 
      userEmail={profile.email} 
      userRole={profile.role} 
      userName={profile.full_name}
    >
      {children}
    </AppShell>
  );
}
