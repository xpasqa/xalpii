"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  Input,
  LoadingState,
  Textarea
} from "../../ui";
import { getPartnerProfile, updatePartnerProfile } from "../../../lib/partner";
import type { PartnerProfile, PartnerProfileInput } from "../../../lib/partner";

type ProfileFormState = {
  address: string;
  businessName: string;
  city: string;
  country: string;
  description: string;
  legalName: string;
  phone: string;
};

const emptyForm: ProfileFormState = {
  address: "",
  businessName: "",
  city: "",
  country: "",
  description: "",
  legalName: "",
  phone: ""
};

export function PartnerProfileManager() {
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileFormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getPartnerProfile();
        setPartner(profile);
        setForm(profileToForm(profile));
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load profile");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, []);

  const completion = useMemo(() => {
    const fields = [
      form.businessName,
      form.legalName,
      form.phone,
      form.country,
      form.city,
      form.address,
      form.description
    ];
    const completed = fields.filter((value) => value.trim().length > 0).length;
    return {
      completed,
      total: fields.length
    };
  }, [form]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const input: PartnerProfileInput = {
        address: form.address,
        businessName: form.businessName,
        city: form.city,
        country: form.country,
        description: form.description,
        legalName: form.legalName,
        phone: form.phone
      };
      const updatedProfile = await updatePartnerProfile(input);
      setPartner(updatedProfile);
      setForm(profileToForm(updatedProfile));
      setSuccess("Partner profile saved.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save profile");
    } finally {
      setIsSaving(false);
    }
  }

  function updateField(field: keyof ProfileFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  if (isLoading) {
    return <LoadingState label="Loading partner profile" />;
  }

  if (!partner && error) {
    return <ErrorState title="Profile unavailable" description={error} />;
  }

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Profile status</CardTitle>
            <CardDescription>
              Keep your public partner information ready before activity submission opens.
            </CardDescription>
          </div>
          {partner ? <Badge variant={statusVariant(partner.status)}>{partner.status}</Badge> : null}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-travel-md border border-travel-border bg-travel-bg p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-travel-muted">
                Completion
              </p>
              <p className="mt-2 font-brand text-2xl font-semibold text-travel-dark">
                {completion.completed}/{completion.total}
              </p>
            </div>
            <div className="rounded-travel-md border border-travel-border bg-travel-bg p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-travel-muted">
                Account
              </p>
              <p className="mt-2 font-interface text-sm font-semibold text-travel-dark">
                {partner?.user.fullName}
              </p>
              <p className="mt-1 font-interface text-sm text-travel-muted">
                {partner?.user.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partner profile</CardTitle>
          <CardDescription>
            This information belongs to your partner account. Status is managed separately by administrators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={saveProfile}>
            <Input
              onChange={(event) => updateField("businessName", event.target.value)}
              placeholder="Business name"
              required
              value={form.businessName}
            />
            <Input
              onChange={(event) => updateField("legalName", event.target.value)}
              placeholder="Legal name"
              value={form.legalName}
            />
            <Input
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="Phone"
              value={form.phone}
            />
            <Input
              onChange={(event) => updateField("country", event.target.value)}
              placeholder="Country"
              value={form.country}
            />
            <Input
              onChange={(event) => updateField("city", event.target.value)}
              placeholder="City"
              value={form.city}
            />
            <Input
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Address"
              value={form.address}
            />
            <Textarea
              className="md:col-span-2"
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Description"
              value={form.description}
            />
            <div className="flex flex-wrap items-center gap-3 md:col-span-2">
              <Button disabled={isSaving} type="submit">
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
              {success ? (
                <span className="font-interface text-sm font-medium text-emerald-700">
                  {success}
                </span>
              ) : null}
              {error ? (
                <span className="font-interface text-sm font-medium text-red-700">
                  {error}
                </span>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function profileToForm(profile: PartnerProfile): ProfileFormState {
  return {
    address: profile.address ?? "",
    businessName: profile.businessName ?? "",
    city: profile.city ?? "",
    country: profile.country ?? "",
    description: profile.description ?? "",
    legalName: profile.legalName ?? "",
    phone: profile.phone ?? ""
  };
}

function statusVariant(status: PartnerProfile["status"]) {
  if (status === "APPROVED") {
    return "success";
  }

  if (status === "REJECTED" || status === "SUSPENDED") {
    return "danger";
  }

  if (status === "PENDING_REVIEW") {
    return "warning";
  }

  return "neutral";
}
