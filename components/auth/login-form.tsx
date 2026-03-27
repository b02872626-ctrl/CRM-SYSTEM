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
      className="crm-primary-button w-full justify-center"
    >
      {pending ? "Signing in..." : "Log in"}
    </button>
  );
}

export function LoginForm({ nextPath = "/dashboard" }: LoginFormProps) {
  return (
    <form action={signInAction} className="mt-10 space-y-6">
      <input type="hidden" name="next" value={nextPath} />

      <div className="crm-field">
        <label htmlFor="email" className="crm-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="crm-input-underline"
          placeholder="admin@afriworkbpo.com"
        />
      </div>

      <div className="crm-field">
        <label htmlFor="password" className="crm-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="crm-input-underline"
          placeholder="Enter password"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
