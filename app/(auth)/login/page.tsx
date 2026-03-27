import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/config";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const error = params.error;
  const nextPath = params.next ?? "/dashboard";

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1a1a1a] px-6 py-12">
      <div className="w-full max-w-md crm-stat-card h-auto p-12">
        <div className="space-y-3 text-center mb-8">
          <p className="crm-label">
            Afriwork BPO
          </p>
          <h1 className="text-4xl font-black text-white tracking-tight">Login</h1>
          <p className="text-sm text-white/40 max-w-[200px] mx-auto leading-relaxed">
            Sign in with your admin account to access the internal CRM.
          </p>
        </div>

        {!hasSupabaseEnv() ? (
          <div className="mt-8 rounded-sm border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-500 text-center">
            Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
            in `.env.local` to enable login.
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-500 text-center">
            {error}
          </div>
        ) : null}

        <LoginForm nextPath={nextPath} />

        <div className="mt-12 rounded-sm border border-dashed border-white/5 bg-white/[0.02] px-6 py-5 text-xs text-white/20 text-center leading-relaxed italic">
          No signup flow is enabled. Admin users should be created or invited directly in
          Supabase Auth.
        </div>
      </div>
    </main>
  );
}
