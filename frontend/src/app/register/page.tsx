"use client";

import { AuthFormCard, AuthLink } from "../../components/domain/auth/AuthFormCard";
import { register } from "../../lib/auth";
import { routes } from "../../lib/routes";

export default function RegisterPage() {
  return (
    <AuthFormCard
      description="Create a traveler account for future bookings and vouchers."
      fields={[
        {
          name: "fullName",
          label: "Full name",
          placeholder: "Your full name",
          autoComplete: "name"
        },
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
          placeholder: "Minimum 8 characters",
          autoComplete: "new-password"
        }
      ]}
      footer={
        <>
          Already registered? <AuthLink href={routes.login}>Log in</AuthLink>. Running an
          experience? <AuthLink href={routes.partnerRegister}>Register as partner</AuthLink>.
        </>
      }
      onSubmit={(values) =>
        register({
          fullName: values.fullName,
          email: values.email,
          password: values.password
        })
      }
      submitLabel="Create account"
      title="Create your account"
    />
  );
}
