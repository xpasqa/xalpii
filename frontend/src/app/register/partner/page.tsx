"use client";

import { AuthFormCard, AuthLink } from "../../../components/domain/auth/AuthFormCard";
import { registerPartner } from "../../../lib/auth";
import { routes } from "../../../lib/routes";

export default function PartnerRegisterPage() {
  return (
    <AuthFormCard
      description="Start a partner profile for local activities and curated experiences."
      fields={[
        {
          name: "fullName",
          label: "Your name",
          placeholder: "Primary contact name",
          autoComplete: "name"
        },
        {
          name: "businessName",
          label: "Business name",
          placeholder: "Your experience business",
          autoComplete: "organization"
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "partner@example.com",
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
          Already have an account? <AuthLink href={routes.login}>Log in</AuthLink>.
        </>
      }
      onSubmit={(values) =>
        registerPartner({
          fullName: values.fullName,
          businessName: values.businessName,
          email: values.email,
          password: values.password
        })
      }
      submitLabel="Create partner account"
      title="Become an Alpii partner"
    />
  );
}
