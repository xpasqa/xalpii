"use client";

import { AuthFormCard, AuthLink } from "../../components/domain/auth/AuthFormCard";
import { login } from "../../lib/auth";
import { routes } from "../../lib/routes";

export default function LoginPage() {
  return (
    <AuthFormCard
      description="Log in to manage bookings, saved experiences, and account details."
      fields={[
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
          autoComplete: "email"
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "Password123!",
          autoComplete: "current-password"
        }
      ]}
      footer={
        <>
          Don't have an account? <AuthLink href={routes.register}>Sign up</AuthLink>
        </>
      }
      onSubmit={(values) => login({ email: values.email, password: values.password })}
      submitLabel="Log in"
      title="Log in"
      variant="simple"
    />
  );
}
