import { apiFetch } from "./api";
import { routes } from "./routes";

export type UserRole = "USER" | "PARTNER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type PartnerStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  partner?: AuthPartner | null;
};

export type AuthPartner = {
  id: string;
  userId: string;
  businessName: string;
  legalName?: string | null;
  status: PartnerStatus;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  user: AuthUser;
  partner?: AuthPartner;
  accessToken: string;
};

export type MeResponse = {
  user: AuthUser;
};

const tokenStorageKey = "alpii_access_token";
const impersonationTokenStorageKey = "alpii_admin_access_token";

export async function login(input: { email: string; password: string }) {
  const response = await apiFetch<AuthResponse>({
    path: "/auth/login",
    method: "POST",
    body: JSON.stringify(input)
  });

  return requireResponseData(response);
}

export async function register(input: { fullName: string; email: string; password: string }) {
  const response = await apiFetch<AuthResponse>({
    path: "/auth/register",
    method: "POST",
    body: JSON.stringify(input)
  });

  return requireResponseData(response);
}

export async function registerPartner(input: {
  fullName: string;
  email: string;
  password: string;
  businessName: string;
}) {
  const response = await apiFetch<AuthResponse>({
    path: "/auth/register-partner",
    method: "POST",
    body: JSON.stringify(input)
  });

  return requireResponseData(response);
}

export async function getMe() {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Missing access token");
  }

  const response = await apiFetch<MeResponse>({
    path: "/auth/me",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return requireResponseData(response);
}

export async function updateMe(input: { fullName?: string; email?: string }) {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Missing access token");
  }

  const response = await apiFetch<MeResponse>({
    path: "/auth/me",
    method: "PATCH",
    body: JSON.stringify(input),
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return requireResponseData(response);
}

export function saveAccessToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(tokenStorageKey, token);
}

export function startImpersonation(adminToken: string, impersonatedToken: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(impersonationTokenStorageKey, adminToken);
  window.localStorage.setItem(tokenStorageKey, impersonatedToken);
}

export function isImpersonating() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.localStorage.getItem(impersonationTokenStorageKey));
}

export function stopImpersonation() {
  if (typeof window === "undefined") {
    return false;
  }

  const adminToken = window.localStorage.getItem(impersonationTokenStorageKey);
  if (!adminToken) {
    return false;
  }

  window.localStorage.setItem(tokenStorageKey, adminToken);
  window.localStorage.removeItem(impersonationTokenStorageKey);
  return true;
}

export function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(tokenStorageKey);
}

export function clearAccessToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(tokenStorageKey);
  window.localStorage.removeItem(impersonationTokenStorageKey);
}

export function dashboardRouteForRole(role: UserRole) {
  if (role === "PARTNER") {
    return routes.partnerDashboard;
  }

  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return routes.adminDashboard;
  }

  return routes.dashboard;
}

function requireResponseData<TData>(response: { data?: TData } | undefined) {
  return requireData(response?.data);
}

function requireData<TData>(data: TData | undefined) {
  if (!data) {
    throw new Error("API response did not include data");
  }

  return data;
}
