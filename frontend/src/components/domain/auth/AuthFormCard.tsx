"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "../../layout/auth-shell";
import { ButtonCTA } from "../../ui/ButtonCTA";
import { Input } from "../../ui/input";
import { dashboardRouteForRole, saveAccessToken } from "../../../lib/auth";
import type { AuthResponse } from "../../../lib/auth";

type Field = {
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  autoComplete?: string;
};

type AuthFormCardProps = {
  title: string;
  description?: string;
  submitLabel: string;
  fields: Field[];
  footer: ReactNode;
  onSubmit: (values: Record<string, string>) => Promise<AuthResponse>;
  variant?: "default" | "simple";
};

export function AuthFormCard({
  title,
  description,
  submitLabel,
  fields,
  footer,
  onSubmit,
  variant = "default"
}: AuthFormCardProps) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const auth = await onSubmit(values);
      saveAccessToken(auth.accessToken);
      router.push(loginRedirect() || dashboardRouteForRole(auth.user.role));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  }

  if (variant === "simple") {
    return (
      <main className="min-h-screen bg-white px-4 py-6 sm:px-6">
        <Link className="inline-block font-brand text-2xl font-bold leading-none text-travel-primary" href="/">
          Alpii
        </Link>
        <section className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-[420px] flex-col justify-center py-10">
          <div className="mb-8 text-center">
            <h1 className="font-brand text-[28px] font-bold leading-tight text-travel-dark">{title}</h1>
            {description ? (
              <p className="mx-auto mt-2 max-w-sm font-interface text-sm leading-6 text-travel-muted">
                {description}
              </p>
            ) : null}
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            {fields.map((field) => (
              <label className="grid gap-2" key={field.name}>
                <span className="font-interface text-sm font-semibold text-travel-dark">
                  {field.label}
                </span>
                <Input
                  autoComplete={field.autoComplete}
                  className="h-12 min-h-0 rounded-[10px] border-[#2B2B2B]/20 bg-white px-4 text-[15px] shadow-none focus:border-travel-dark focus:ring-0"
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [field.name]: event.target.value
                    }))
                  }
                  placeholder={field.placeholder}
                  required
                  type={field.type ?? "text"}
                  value={values[field.name] ?? ""}
                />
              </label>
            ))}

            {error ? (
              <div className="rounded-travel-md border border-[#B92216]/25 bg-[#FBEAE8] px-3 py-2 font-interface text-sm text-travel-primary">
                {error}
              </div>
            ) : null}

            <ButtonCTA className="mt-1 h-12 rounded-[10px]" fullWidth isLoading={isLoading} size="lg" type="submit">
              {submitLabel}
            </ButtonCTA>
          </form>

          <div className="mt-6 text-center font-interface text-sm text-travel-muted">{footer}</div>
        </section>
      </main>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <AuthShell title={title} description={description ?? ""}>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <label className="grid gap-2" key={field.name}>
              <span className="font-interface text-sm font-medium text-travel-dark">
                {field.label}
              </span>
              <Input
                autoComplete={field.autoComplete}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [field.name]: event.target.value
                  }))
                }
                placeholder={field.placeholder}
                required
                type={field.type ?? "text"}
                value={values[field.name] ?? ""}
              />
            </label>
          ))}

          {error ? (
            <div className="rounded-travel-md border border-[#B92216]/25 bg-[#FBEAE8] px-3 py-2 font-interface text-sm text-travel-primary">
              {error}
            </div>
          ) : null}

          <ButtonCTA fullWidth isLoading={isLoading} size="lg" type="submit">
            {submitLabel}
          </ButtonCTA>
        </form>
        <div className="mt-6 font-interface text-sm text-travel-muted">{footer}</div>
      </AuthShell>
    </div>
  );
}

function loginRedirect() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("redirect");
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="font-semibold text-travel-primary transition hover:text-[#8F1A12]" href={href}>
      {children}
    </Link>
  );
}
