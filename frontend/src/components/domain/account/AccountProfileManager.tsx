"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  Input,
  LoadingState
} from "../../ui";
import { ButtonCTA } from "../../ui/ButtonCTA";
import { getMe, updateMe } from "../../../lib/auth";
import type { AuthUser } from "../../../lib/auth";

export function AccountProfileManager() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setError(null);
      setIsLoading(true);

      try {
        const response = await getMe();
        setUser(response.user);
        setFullName(response.user.fullName);
        setEmail(response.user.email);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load profile");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const response = await updateMe({ email, fullName });
      setUser(response.user);
      setFullName(response.user.fullName);
      setEmail(response.user.email);
      setSuccess("Profile saved.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save profile");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading profile" />;
  }

  if (error && !user) {
    return <ErrorState description={error} title="Profile unavailable" />;
  }

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account identity used across Alpii dashboards.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid max-w-2xl gap-4" onSubmit={saveProfile}>
            <Input
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Full name"
              required
              value={fullName}
            />
            <Input
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              required
              type="email"
              value={email}
            />
            <div className="grid gap-1 text-sm text-travel-muted">
              <p>Role: {user?.role}</p>
              <p>Status: {user?.status}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ButtonCTA disabled={isSaving} type="submit">
                {isSaving ? "Saving..." : "Save profile"}
              </ButtonCTA>
              {success ? <span className="text-sm font-medium text-emerald-700">{success}</span> : null}
              {error ? <span className="text-sm font-medium text-red-700">{error}</span> : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
