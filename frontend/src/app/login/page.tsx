"use client";

import { AuthFormCard, AuthLink } from "../../components/domain/auth/AuthFormCard";
import { login } from "../../lib/auth";
import { routes } from "../../lib/routes";

export default function LoginPage() {
  return (
    <AuthFormCard
      description="Access your Alpii dashboard with your registered account."
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
          New to Alpii? <AuthLink href={routes.register}>Create an account</AuthLink> or{" "}
          <AuthLink href={routes.partnerRegister}>become a partner</AuthLink>.
        </>
      }
      onSubmit={(values) => login({ email: values.email, password: values.password })}
      submitLabel="Log in"
      title="Welcome back"
    />
  );
}
