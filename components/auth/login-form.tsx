"use client";

import { useFormStatus } from "react-dom";
import { signInAction } from "@/features/auth/actions";

type LoginFormProps = {
  nextPath?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Signing in..." : "Log in"}
    </button>
  );
}

export function LoginForm({ nextPath = "/dashboard" }: LoginFormProps) {
  return (
    <form action={signInAction} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={nextPath} />

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-900"
          placeholder="admin@afriworkbpo.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-900"
          placeholder="Enter password"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
