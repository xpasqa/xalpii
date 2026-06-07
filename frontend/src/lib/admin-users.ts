import { apiFetch } from "./api";
import { getAccessToken } from "./auth";
import type { AuthUser, UserRole, UserStatus } from "./auth";

export type AdminUser = AuthUser & {
  partner?: {
    id: string;
    businessName: string;
    status: string;
  } | null;
};

export type AdminUserQuery = {
  search?: string;
  role?: UserRole | "";
  status?: UserStatus | "";
};

export type AdminImpersonateResponse = {
  accessToken: string;
  user: AdminUser;
};

export async function getAdminUsers(query: AdminUserQuery = {}) {
  return requireData(
    await authenticatedFetch<AdminUser[]>({
      path: `/admin/users${buildQuery(query)}`
    })
  );
}

export async function impersonateAdminUser(id: string) {
  return requireData(
    await authenticatedFetch<AdminImpersonateResponse>({
      method: "POST",
      path: `/admin/users/${id}/impersonate`
    })
  );
}

async function authenticatedFetch<TData>(input: {
  path: string;
  method?: string;
  body?: BodyInit;
}) {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Missing access token");
  }

  return apiFetch<TData>({
    ...input,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

function buildQuery(query: AdminUserQuery) {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.role) params.set("role", query.role);
  if (query.status) params.set("status", query.status);
  const value = params.toString();
  return value ? `?${value}` : "";
}

function requireData<TData>(response: { data?: TData } | undefined) {
  if (!response?.data) {
    throw new Error("API response did not include data");
  }

  return response.data;
}
